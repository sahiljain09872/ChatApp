import React, { useState, useEffect, useContext } from "react";
import { roomContext } from "../pages/Home";
import "./Header.css";

export default function Header({OpenRoomInfo}) {
  let [room, setRoom] = useContext(roomContext);

  function getOutOfRoom(){
    setRoom(null);
  }

  return (
    <>
      <header className="chat-header">
        <div className="left-room-icon">
          <button className="left-arrow" onClick={getOutOfRoom}>
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>

        <div className="roomIcon-description" onClick={OpenRoomInfo}>
          <div className="room-icon">{room.roomName[0].toUpperCase()}</div>
          <div className="description">
            <h2>{room.roomName}</h2>
            {/* <p>Sahil Jain, Sahil Jain, Sahil Jain, Sahil Jain...Sahil Jain, Sahil Jain, Sahil Jain, Sahil Jain...Sahil Jain, Sahil Jain, Sahil Jain, Sahil Jain...Sahil Jain, Sahil Jain, Sahil Jain, Sahil Jain...Sahil Jain, Sahil Jain, Sahil Jain, Sahil Jain...Sahil Jain, Sahil Jain, Sahil Jain, Sahil Jain...Sahil Jain, Sahil Jain, Sahil Jain, Sahil Jain...Sahil Jain, Sahil Jain, Sahil Jain, Sahil Jain...Sahil Jain, Sahil Jain, Sahil Jain, Sahil Jain...Sahil Jain, Sahil Jain, Sahil Jain, Sahil Jain...Sahil Jain, Sahil Jain, Sahil Jain, Sahil Jain...Sahil Jain, Sahil Jain, Sahil Jain, Sahil Jain...Sahil Jain, Sahil Jain, Sahil Jain, Sahil Jain...</p> */}
          </div>
        </div>
      </header>
    </>
  );
}
