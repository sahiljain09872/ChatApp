import React, { useRef, useContext } from "react";
import { enterInRoom } from "../api/enterInRoom";
import { roomsContext } from "./Sidebar";

export default function EnterRoomSection({ onRoomChange }) {
  const roomIdRef = useRef(null);
  const [rooms, setRooms] = useContext(roomsContext);

  const handleEnterRoom = () => {
    const roomId = roomIdRef.current.value;

    const data = { roomId: roomId };
    console.log(data);

    enterInRoom(data).then((res) => {
      if (res.success) {
        // Use the passed function to handle room changes
        onRoomChange(res.newRoom);
        roomIdRef.current.value = "";
      } else {
        console.log(res.message);
      }
    });
  };

  return (
    <div className="add-room-section input-button-section">
      <input
        type="text"
        placeholder="Enter Room (roomId)..."
        className="add-room-input"
        ref={roomIdRef}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // Prevents a newline from being added
            handleEnterRoom(); // Calls the sendMessage function
          }
        }}
      />
      <button className="add-room-button" onClick={handleEnterRoom}>
        <i className="fa-solid fa-arrow-up"></i>
      </button>
    </div>
  );
}
