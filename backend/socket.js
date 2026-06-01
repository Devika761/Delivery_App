import User from "./models/user.model.js"
import DeliveryAssignment from "./models/deliveryAssignment.model.js"
import Order from "./models/order.model.js"

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log("Socket connected:", socket.id)

    socket.on('identity', async ({ userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          socketId: socket.id,
          isOnline: true
        }, { returnDocument: 'after' })

        console.log(`User identified: ${user?.fullName} (${user?.role})`)

        // If delivery boy reconnects, re-send any pending broadcasted assignments
        if (user?.role === 'deliveryBoy') {
          const pendingAssignments = await DeliveryAssignment.find({
            brodcastedTo: userId,
            status: "brodcasted"
          })
            .populate("order")
            .populate("shop")

          for (const assignment of pendingAssignments) {
            if (!assignment.order || !assignment.shop) continue

            const shopOrder = assignment.order.shopOrders.find(
              so => so._id.equals(assignment.shopOrderId)
            )

            socket.emit("newAssignment", {
              sentTo: userId,
              assignmentId: assignment._id,
              orderId: assignment.order._id,
              shopName: assignment.shop.name,
              deliveryAddress: assignment.order.deliveryAddress,
              items: shopOrder?.shopOrderItems || [],
              subtotal: shopOrder?.subtotal
            })
          }

          if (pendingAssignments.length > 0) {
            console.log(`Re-sent ${pendingAssignments.length} pending assignment(s) to ${user.fullName}`)
          }
        }

      } catch (error) {
        console.log("identity error:", error)
      }
    })

    socket.on('updateLocation', async ({ latitude, longitude, userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          isOnline: true,
          socketId: socket.id
        })

        if (user) {
          io.emit('updateDeliveryLocation', {
            deliveryBoyId: userId,
            latitude,
            longitude
          })
        }
      } catch (error) {
        console.log('updateDeliveryLocation error:', error)
      }
    })

    socket.on('disconnect', async () => {
      try {
        await User.findOneAndUpdate({ socketId: socket.id }, {
          socketId: null,
          isOnline: false
        })
        console.log("Socket disconnected:", socket.id)
      } catch (error) {
        console.log("disconnect error:", error)
      }
    })
  })
}
