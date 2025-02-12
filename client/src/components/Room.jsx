import React, { useState, useEffect, useContext } from "react";
import { roomContext } from "../pages/Home";
import "./Room.css";
import Header from "./Header";
import Chats from "./Chats";
import NoChat from "./NoChat";

export default function Room({OpenRoomInfo , CloseRoomInfo}) {
  let [room, setRoom] = useContext(roomContext);

  useEffect(() => {
    return;
  }, []);

  return (
    <div id="Room">
      {room?._id == null ? ( // Safely access room._id using optional chaining
        <>
          <NoChat />
        </>
      ) : (
        <>
          <Header OpenRoomInfo={OpenRoomInfo} />
          <Chats />
        </>
      )}
    </div>
  );
}
