import React, { useRef } from "react";
import { createRoom } from "../api/createRoom";

export default function AddRoomSection({ onRoomAdd }) {
  const newRoomNameRef = useRef(null);

  const handleAddRoom = () => {
    const newRoomName = newRoomNameRef.current.value;

    const data = { roomName: newRoomName };
    console.log("new Room Data that we are creating -> ", data);

    createRoom(data).then((res) => {
      if (res.success) {
        // Use the passed function to handle the new room addition
        onRoomAdd(res.newRoom);
        newRoomNameRef.current.value = "";
      } else {
        console.log(res.message);
      }
    });
  };

  return (
    <div className="add-room-section input-button-section">
      <input
        type="text"
        placeholder="New room name..."
        className="add-room-input"
        ref={newRoomNameRef}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // Prevents a newline from being added
            handleAddRoom(); // Calls the sendMessage function
          }
        }}
      />
      <button className="add-room-button" onClick={handleAddRoom}>
        <i className="fas fa-plus"></i>
      </button>
    </div>
  );
}
