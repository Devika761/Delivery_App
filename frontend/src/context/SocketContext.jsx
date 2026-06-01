import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { serverUrl } from "../App";

const SocketContext = createContext(null);

export function SocketProvider({ children, userId }) {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Disconnect previous socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socketInstance = io(serverUrl, {
      withCredentials: true,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Socket Connected:", socketInstance.id);
      if (userId) {
        socketInstance.emit("identity", { userId });
      }
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
