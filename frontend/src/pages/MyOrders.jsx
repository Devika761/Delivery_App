import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoIosArrowRoundBack } from "react-icons/io"
import { useNavigate } from 'react-router-dom'
import UserOrderCard from '../components/UserOrderCard'
import OwnerOrderCard from '../components/OwnerOrderCard'
import { setMyOrders, updateRealtimeOrderStatus } from '../redux/userSlice'
import { useSocket } from '../context/SocketContext'

function MyOrders() {
  const { userData, myOrders } = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return

    // Owner: new order came in
    socket.on('newOrder', (data) => {
      if (data.shopOrders?.owner?._id == userData._id) {
        // Deduplicate — don't add if already exists
        const exists = myOrders.some(o => o._id === data._id)
        if (!exists) {
          dispatch(setMyOrders([data, ...myOrders]))
        }
      }
    })

    // Customer: owner changed the order status
    socket.on('orderStatusUpdated', ({ orderId, shopId, status }) => {
      dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }))
    })

    // Legacy event name kept for compatibility
    socket.on('update-status', ({ orderId, shopId, status, userId }) => {
      if (userId == userData._id) {
        dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }))
      }
    })

    return () => {
      socket.off('newOrder')
      socket.off('orderStatusUpdated')
      socket.off('update-status')
    }
  }, [socket, myOrders])

  return (
    <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
      <div className='w-full max-w-[800px] p-4'>
        <div className='flex items-center gap-[20px] mb-6'>
          <div className='z-[10] cursor-pointer' onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
          </div>
          <h1 className='text-2xl font-bold text-start'>My Orders</h1>
        </div>
        <div className='space-y-6'>
          {myOrders?.map((order, index) => (
            userData.role === "user" ? (
              <UserOrderCard data={order} key={order._id || index} />
            ) : userData.role === "owner" ? (
              <OwnerOrderCard data={order} key={order._id || index} />
            ) : null
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyOrders
