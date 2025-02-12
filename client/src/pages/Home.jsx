import React, { useState, useEffect, createContext } from "react";
import { validtoken } from "../api/validtoken";
import Sidebar from "../components/Sidebar";
import Room from "../components/Room";
import ShowRoomInfo from "../components/ShowRoomInfo";
import { io } from "socket.io-client";

export const roomContext = createContext();
export const socketContext = createContext();

export default function Home() {
  // before rendering the Home page , we have to whether the user is logged in or not
  let [loggedIn, setLoggedIn] = useState(true);
  let [room, setRoom] = useState({ _id: null });
  let [socket, setSocket] = useState(null);
  let [showRoomInfo , setShowRoomInfo] = useState(false);

  function OpenRoomInfo(){
    setShowRoomInfo(true);
  }

  function CloseRoomInfo(){
    setShowRoomInfo(false);
  }

  // Socket setup effect
  useEffect(() => {
    validtoken().then((res) => {
      if (res.success) {
        setLoggedIn(true);
        const socket = io("https://chatverse-gld5.onrender.com", {
          auth: {
            token: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSocket(socket);

        return () => socket.disconnect();
      } else {
        setLoggedIn(false);
      }
    });
  }, []); // Empty dependency array for socket setup

  // Event listeners effect
  useEffect(() => {
    if (!socket) return;

    const handleBeforeUnload = () => {
      console.log("refresh the page and current roomId is -> ", room._id);
      if (room._id) {
        socket.emit("changeRoom", { roomId: room._id });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && room._id) {
        socket.emit("changeRoom", room._id);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    socket.on("disconnect", () => {
      if (room._id) {
        socket.emit("changeRoom", room._id);
      }
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [socket, room]); // Dependencies include both socket and room

  // write a useEffect that will be on the room , whenever the room will get unmounted then the seencount for the user will be updated to the chat count of the room

  if (!loggedIn) {
    window.location.href = "/register";
    return null;
  }

  return (
    <socketContext.Provider value={[socket, setSocket]}>
      <roomContext.Provider value={[room, setRoom]}>
        <Sidebar id="sidebar" OpenRoomInfo={OpenRoomInfo} CloseRoomInfo={CloseRoomInfo} />
        {
          showRoomInfo ?

          <ShowRoomInfo CloseRoomInfo={CloseRoomInfo} />

          :
          <Room id="Room" OpenRoomInfo={OpenRoomInfo} CloseRoomInfo={CloseRoomInfo} />
        }
      </roomContext.Provider>
    </socketContext.Provider>
  );
}
