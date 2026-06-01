import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useSelector } from 'react-redux'

function useUpdateLocation() {
    const { userData } = useSelector(state => state.user)

    useEffect(() => {
        if (!userData) return

        let watchId

        const updateLocation = async (lat, lon) => {
            try {
                await axios.post(
                    `${serverUrl}/api/user/update-location`,
                    { lat, lon },
                    { withCredentials: true }
                )
            } catch (error) {
                console.log('location update error:', error)
            }
        }

        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    updateLocation(pos.coords.latitude, pos.coords.longitude)
                },
                (err) => console.log('geolocation error:', err),
                { enableHighAccuracy: true }
            )
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId)
        }
    }, [userData?._id])
}

export default useUpdateLocation
