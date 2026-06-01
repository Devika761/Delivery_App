import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setShopsInMyCity } from '../redux/userSlice'

function useGetShopByCity() {
    const dispatch = useDispatch()
    const { currentCity, userData } = useSelector(state => state.user)

    useEffect(() => {
        if (!currentCity || !userData || userData.role !== 'user') return

        const fetchShops = async () => {
            try {
                const result = await axios.get(
                    `${serverUrl}/api/shop/get-by-city/${currentCity}`,
                    { withCredentials: true }
                )
                dispatch(setShopsInMyCity(result.data))
            } catch (error) {
                console.log(error)
            }
        }

        fetchShops()
    }, [currentCity, userData])
}

export default useGetShopByCity
