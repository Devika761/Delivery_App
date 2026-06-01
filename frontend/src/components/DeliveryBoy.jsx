import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { serverUrl } from "../App";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { ClipLoader } from "react-spinners";

function DeliveryBoy() {
  const { userData } = useSelector((state) => state.user);
  const socket = useSocket();

  const [currentOrder, setCurrentOrder] = useState(null);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [otp, setOtp] = useState("");
  const [todayStats, setTodayStats] = useState([]);
  const [todayEarning, setTodayEarning] = useState(0);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch data on mount
  useEffect(() => {
    if (userData?.role === "deliveryBoy") {
      getAssignments();
      getCurrentOrder();
      handleTodayDeliveries();
    }
  }, [userData]);

  // Watch geolocation and emit to socket
  useEffect(() => {
    if (!socket || userData?.role !== "deliveryBoy") return;

    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          setDeliveryBoyLocation({ lat: latitude, lon: longitude });

          socket.emit("updateLocation", {
            latitude,
            longitude,
            userId: userData._id,
          });
        },
        (error) => console.log("Geolocation error:", error),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, userData]);

  // Listen for new assignment via socket
  useEffect(() => {
    if (!socket) return;

    socket.on("newAssignment", (data) => {
      console.log("NEW ASSIGNMENT RECEIVED:", data);
      if (String(data.sentTo) === String(userData._id)) {
        setAvailableAssignments((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("newAssignment");
    };
  }, [socket, userData]);

  const getAssignments = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-assignments`,
        { withCredentials: true }
      );
      setAvailableAssignments(result.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        { withCredentials: true }
      );
      setCurrentOrder(result.data);
    } catch (error) {
      // 400 means no current order — that's fine
      setCurrentOrder(null);
    }
  };

  const acceptOrder = async (assignmentId) => {
    try {
      await axios.get(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
        { withCredentials: true }
      );
      await getCurrentOrder();
      await getAssignments();
    } catch (error) {
      console.log(error);
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
        },
        { withCredentials: true }
      );
      setShowOtpBox(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setMessage("");
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        { withCredentials: true }
      );
      setMessage(result.data.message);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Invalid OTP");
    }
  };

  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-today-deliveries`,
        { withCredentials: true }
      );
      // Backend returns { stats: [...], earning: number }
      setTodayStats(result.data.stats || []);
      setTodayEarning(result.data.earning || 0);
    } catch (error) {
      console.log(error);
    }
  };

  const totalDeliveriesToday = todayStats.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#FBF6F6] overflow-y-auto">
      <Nav />
      <div className="w-full max-w-[800px] flex flex-col gap-5 items-center">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100 text-center gap-2">
          <h1 className="text-xl font-bold text-[#D96868]">
            Welcome, {userData.fullName}
          </h1>
          {deliveryBoyLocation ? (
            <p className="text-[#D96868] text-sm">
              <span className="font-semibold">Lat:</span>{" "}
              {deliveryBoyLocation.lat.toFixed(5)},{" "}
              <span className="font-semibold">Lon:</span>{" "}
              {deliveryBoyLocation.lon.toFixed(5)}
            </p>
          ) : (
            <p className="text-gray-400 text-sm">Fetching your location...</p>
          )}
        </div>

        {/* Today's Stats */}
        <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] border border-orange-100">
          <h1 className="text-lg font-bold mb-3 text-[#D96868]">
            Today's Performance
          </h1>
          <div className="flex gap-4 justify-center flex-wrap">
            <div className="flex-1 min-w-[130px] bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
              <p className="text-3xl font-bold text-[#D96868]">
                {totalDeliveriesToday}
              </p>
              <p className="text-sm text-gray-500 mt-1">Deliveries Today</p>
            </div>
            <div className="flex-1 min-w-[130px] bg-green-50 rounded-xl p-4 text-center border border-green-100">
              <p className="text-3xl font-bold text-green-600">
                ₹{todayEarning}
              </p>
              <p className="text-sm text-gray-500 mt-1">Today's Earnings</p>
            </div>
          </div>

          {/* Hourly breakdown */}
          {todayStats.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Deliveries by Hour
              </p>
              <div className="flex gap-2 flex-wrap">
                {todayStats.map((stat) => (
                  <div
                    key={stat.hour}
                    className="bg-orange-100 text-orange-700 text-xs rounded-lg px-3 py-1 font-medium"
                  >
                    {stat.hour}:00 — {stat.count}{" "}
                    {stat.count === 1 ? "delivery" : "deliveries"}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Available Orders */}
        {!currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <h1 className="text-lg font-bold mb-4">Available Orders</h1>
            <div className="space-y-4">
              {availableAssignments?.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <div
                    className="border rounded-lg p-4 flex justify-between items-center"
                    key={index}
                  >
                    <div>
                      <p className="text-sm font-semibold">{a?.shopName}</p>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Delivery Address:</span>{" "}
                        {a?.deliveryAddress?.text}
                      </p>
                      <p className="text-xs text-gray-400">
                        {a.items?.length} items | ₹{a.subtotal}
                      </p>
                    </div>
                    <button
                      className="bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600"
                      onClick={() => acceptOrder(a.assignmentId)}
                    >
                      Accept
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No Available Orders</p>
              )}
            </div>
          </div>
        )}

        {/* Current Order */}
        {currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <h2 className="text-lg font-bold mb-3">📦 Current Order</h2>
            <div className="border rounded-lg p-4 mb-3">
              <p className="font-semibold text-sm">
                {currentOrder?.shopOrder?.shop?.name}
              </p>
              <p className="text-sm text-gray-500">
                {currentOrder.deliveryAddress?.text}
              </p>
              <p className="text-xs text-gray-400">
                {currentOrder.shopOrder?.shopOrderItems?.length} items | ₹
                {currentOrder.shopOrder?.subtotal}
              </p>
            </div>

            <DeliveryBoyTracking
              data={{
                deliveryBoyLocation: deliveryBoyLocation || {
                  lat: userData.location?.coordinates?.[1] || 0,
                  lon: userData.location?.coordinates?.[0] || 0,
                },
                customerLocation: {
                  lat: currentOrder.deliveryAddress?.latitude,
                  lon: currentOrder.deliveryAddress?.longitude,
                },
              }}
            />

            {!showOtpBox ? (
              <button
                className="mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ClipLoader size={20} color="white" />
                ) : (
                  "Mark As Delivered"
                )}
              </button>
            ) : (
              <div className="mt-4 p-4 border rounded-xl bg-gray-50">
                <p className="text-sm font-semibold mb-2">
                  Enter OTP sent to{" "}
                  <span className="text-orange-500">
                    {currentOrder.user?.fullName}
                  </span>
                </p>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Enter OTP"
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                />
                {message && (
                  <p
                    className={`text-center text-sm mb-3 font-medium ${
                      message.includes("Successfully")
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {message}
                  </p>
                )}
                <button
                  className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all"
                  onClick={verifyOtp}
                >
                  Submit OTP
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryBoy;
