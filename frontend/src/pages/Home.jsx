import React from "react";
import UserDashboard from "../components/UserDashboard";
import OwnerDashboard from "../components/OwnerDashboard";
import { useSelector } from "react-redux";
import DeliveryBoy from "../components/DeliveryBoy";

function Home() {
  const { userData } = useSelector((state) => state.user);

  // Don't render anything until we know the user's role
  if (!userData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#fff9f6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#ff4d2d] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#ff4d2d] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {userData.role === "user" && <UserDashboard />}
      {userData.role === "owner" && <OwnerDashboard />}
      {userData.role === "deliveryBoy" && <DeliveryBoy />}
    </div>
  );
}

export default Home;
