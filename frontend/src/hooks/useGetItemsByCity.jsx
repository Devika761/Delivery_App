import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity } from '../redux/userSlice'

function useGetItemsByCity() {
    const dispatch = useDispatch()
    const { currentCity, userData } = useSelector(state => state.user)

    useEffect(() => {
        if (!currentCity || !userData || userData.role !== 'user') return

        const fetchItems = async () => {
            try {
                const result = await axios.get(
                    `${serverUrl}/api/item/get-by-city/${currentCity}`,
                    { withCredentials: true }
                )
                dispatch(setItemsInMyCity(result.data))
            } catch (error) {
                console.log(error)
            }
        }

        fetchItems()
    }, [currentCity, userData])
}

export default useGetItemsByCity
