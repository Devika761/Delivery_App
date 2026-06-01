import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setMyOrders } from '../redux/userSlice'

function useGetMyOrders() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)

    useEffect(() => {
        // Only fetch for user or owner, and only when userId first becomes available
        if (!userData?._id || userData.role === 'deliveryBoy') return

        const fetchOrders = async () => {
            try {
                const result = await axios.get(
                    `${serverUrl}/api/order/my-orders`,
                    { withCredentials: true }
                )
                dispatch(setMyOrders(result.data))
            } catch (error) {
                console.log(error)
            }
        }

        fetchOrders()
    }, [userData?._id]) // Only re-fetch when the user ID changes (login/logout), not on every userData update
}

export default useGetMyOrders
