import React, { useContext, useEffect, useState } from "react";
import { roomContext } from "../pages/Home";
import "./ShowRoomInfo.css";
import { Copy } from "lucide-react";

import { getRoomInfo } from "../api/getRoomInfo";
import Loading from "./Loading"

export default function ShowRoomInfo({ CloseRoomInfo }) {
  let [room, setRoom] = useContext(roomContext);
  let [roomInfo, setRoomInfo] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomInfo._id);
  };

  useEffect(() => {
    console.log("room is -> ", room);
    // Now get the all about the users connected to this room
    const roomId = room._id;
    getRoomInfo({ roomId }).then((res) => {
      console.log(
        "res from the getRoomInfo api is -> ",
        res.success,
        res.RoomInfo
      );

      setRoomInfo(res.RoomInfo);
    });

    console.log("roomInfo -> ", roomInfo);
  }, []);
  
  return (
    <div id="RoomInfo">
      {!roomInfo ? (
        <Loading />
      ) : (
        <>
          <div className="container">
            <div className="headerRoomInfo">
              <button onClick={CloseRoomInfo}>
                <i className="fa-solid fa-x"></i>
              </button>
            </div>
            <div className="flex items-start space-x-6">
              {/* Room Icon Section */}
              <div className="roomIcon">
                <span>{roomInfo.roomName.charAt(0).toUpperCase()}</span>
              </div>

              {/* Room Description Section */}
              <div className="room-desc">
                <h2>{roomInfo.roomName}</h2>

                <div className="room-id">
                  <span>Room ID:</span>
                  <code>{roomInfo._id}</code>
                  <button onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="text-sm text-gray-600">
                  Created by:{" "}
                  {
                    roomInfo.participants.find(
                      (p) => p._id === roomInfo.createdBy
                    )?.name
                  }
                </div>

                <div className="text-sm text-gray-600">
                  Created on: {formatDate(roomInfo.createdAt)}
                </div>
              </div>
            </div>

            {/* Users Section */}
              <h3 className="participants-header">
                Participants ({roomInfo.participants.length})
              </h3>
            <div className="participants-section">

              <div className="space-y-3">
                {roomInfo.participants.map((user) => (
                  <div key={user._id} className="participant-card">
                    <div className="participant-icon">
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="participant-info">
                      <span className="participant-name">{user.name}</span>
                      <span className="participant-email">{user.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
