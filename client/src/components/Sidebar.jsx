import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useRef,
  useCallback,
  createRef,
} from "react";
import { loadRooms } from "../api/loadRooms";
import "./Sidebar.css";
import AddRoomSection from "./AddRoomSection";
import EnterRoomSection from "./EnterRoomSection";
import { roomContext, socketContext } from "../pages/Home"; // contexts from the Home
import { Search, X } from "lucide-react";

export const roomsContext = createContext(null);

export default function Sidebar({ OpenRoomInfo, CloseRoomInfo }) {
  const [socket, setSocket] = useContext(socketContext);
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useContext(roomContext);
  const previousRoomRef = useRef(null);
  const searchRef = createRef(null);

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Function to handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredRooms = rooms.filter((room) =>
    room.roomId.roomName.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  // console.log("socket at sidebar is -> ", socket);

  const updateUnseenCount = (targetRoomId) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.roomId._id === targetRoomId
          ? { ...room, unseenCount: room.unseenCount + 1 }
          : room
      )
    );
  }; // perfectly working

  const unseenCountZero = (targetRoomId) => {
    setRooms((prevRooms) =>
      prevRooms.map(
        (room) =>
          room.roomId._id === targetRoomId
            ? { ...room, unseenCount: 0 } // Reset unseenCount for the target room
            : room // Keep other rooms unchanged
      )
    );
  }; //  perfectly working

  useEffect(() => {
    // Listen for incoming messages from the server
    if (!socket) return;
    socket.on("receiveMessage", (newChat) => {
      // console.log("New chat received:", newChat);
      // console.log("new Chat is received over the sidebar");

      console.log(
        "message's roomId -> ",
        newChat.roomId,
        "current roomId is -> ",
        room._id
      );
      // if the chat roomId matches with the current roomId then we will add that chat into the chats
      if (newChat.roomId != room._id) {
        // updating the unseen count of the roomId of message
        playSound();
        updateUnseenCount(newChat.roomId);
      }
    });

    // Cleanup the listener on component unmount
    return () => {
      socket.off("receiveMessage"); // Removes the event listener
    };
  }, [socket, rooms]); // perfectly working

  // useEffect(() => {
  //   console.log(
  //     "socket and room dependent useEffect at the sidebar -> ",
  //     socket
  //   );
  // }, [socket, room]); // perfectly working

  useEffect(() => {
    // Fetch all rooms the user is connected to
    loadRooms().then((res) => {
      if (res.success) {
        setRooms(res.rooms);
      } else {
        console.log(res.message);
      }
    });

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null); // Close any open dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    console.log("the rooms that the user is getting at the sidebar -> ", rooms);
  }, [rooms]);

  // Function to handle room creation
  const handleAddRoom = (newRoom) => {
    if (rooms.some((room) => room.roomId._id === newRoom._id)) {
      console.log("Room already exists");
      return;
    }

    console.log("handleAddRoom");
    socket.emit("joinRoom", newRoom._id);

    handleRoomChange(newRoom);
    setRooms((prevRooms) => [
      { roomId: newRoom, unseenCount: 0 },
      ...prevRooms,
    ]);
  };

  const handleRoomChange = useCallback(
    (room) => {
      console.log("Previous Room ID:", previousRoomRef.current);
      console.log("Current Room ID (Newly Created):", room._id);

      if (!socket) {
        console.error("Socket is not initialized");
        return;
      }

      socket.emit("changeRoom", previousRoomRef.current);

      unseenCountZero(room._id);
      previousRoomRef.current = room._id;
      setRoom(room);
    },
    [socket]
  );

  function logout() {
    // logout the user

    if (!socket) return;

    socket.emit("changeRoom", room._id);
    localStorage.removeItem("token");
    window.location.reload();
  }

  const playSound = () => {
    const sound = new Audio("/sounds/notification.mp3"); // Path to your sound file
    sound.play();
  };

  const handleRoomInfo = (e, roomId) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === roomId ? null : roomId);
  };

  const handleExitRoom = (e, roomId) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    // Add your exit room logic here
    console.log("Exiting room:", roomId);

    // remove this room from the rooms array at the sidebar
    setRooms((prevRooms) =>
      prevRooms.filter((room) => room.roomId._id !== roomId)
    );

    setRoom(null);
    CloseRoomInfo();
    // and send a io emit to the io server to remove the mapping of the userId with the roomId
    socket.emit("exitRoom", roomId);
  };

  const handleRoomDesc = (e, Room) => {
    // here we are getting the room that we have to show the desc
    e.stopPropagation();
    setOpenDropdownId(null);
    // Add your room info logic here
    console.log("Showing room desc for:", Room._id);
    if (!room || room._id == null || room._id != Room._id) {
      // roomId doesn't match
      console.log("not matching with roomId");

      // CloseRoomInfo();
      // closed to roomInfo
      setRoom(Room); // we are setting the Room to the required room
      OpenRoomInfo();
    } else {
      console.log("roomId matches to show the room Desc !!");
      OpenRoomInfo();
    }
  };

  const clearSearch = () => {
    if (searchRef.current) {
      searchRef.current.value = "";
      onSearch("");
    }
  };

  return (
    <div id="sidebar">
      <div className="header-container">
        <button className="logout-button" onClick={logout}>
        <i className="fas fa-sign-out-alt fa-rotate-180"></i>
        </button>

        <h1 className="company-name">Chat</h1>
      </div>

      <div className="search-section">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            onChange={handleSearchChange}
            ref={searchRef}
          />
          <i
            className="fa-solid  search-icon"
            onClick={clearSearch}
            style={{ pointerEvents: "auto", cursor: "pointer" }}
          />
        </div>
      </div>

      {rooms.length > 0 ? (
        <div className="rooms-list">
          {filteredRooms.map((room) => (
            <div
              key={room.roomId._id}
              className="room-card"
              onClick={() => {
                console.log("changing the room !!");
                handleRoomChange(room.roomId);
                CloseRoomInfo();
              }}
            >
              <div className="room-icon">
                {room.roomId.roomName.charAt(0).toUpperCase()}
              </div>

              <div className="room-name">{room.roomId.roomName}</div>

              <div className="room-actions">
                {room.unseenCount > 0 && (
                  <div className="unseen-count">{room.unseenCount}</div>
                )}

                <div className="room-info">
                  <button
                    className="room-info-button"
                    onClick={(e) => handleRoomInfo(e, room.roomId._id)}
                  >
                    <i className="fa fa-ellipsis-v"></i>
                  </button>

                  {openDropdownId === room.roomId._id && (
                    <div className="room-dropdown">
                      <button
                        className="dropdown-item exit-room"
                        onClick={(e) => handleExitRoom(e, room.roomId._id)}
                      >
                        <i className="fa fa-sign-out"></i>
                        Exit Room
                      </button>
                      <button
                        className="dropdown-item room-info"
                        onClick={(e) => handleRoomDesc(e, room.roomId)}
                      >
                        <i className="fa fa-info-circle"></i>
                        Room Desc
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-rooms">
          <div className="no-rooms-icon">
            <i className="fas fa-comments"></i>
          </div>
          <h2 className="no-rooms-title">No Rooms Yet</h2>
          <p className="no-rooms-description">
            Start a conversation by creating a new room or joining an existing
            one!
          </p>
        </div>
      )}

      <roomsContext.Provider value={[rooms, setRooms]}>
        <AddRoomSection onRoomAdd={handleAddRoom} />
        <EnterRoomSection onRoomChange={(newRoom) => handleAddRoom(newRoom)} />
      </roomsContext.Provider>
    </div>
  );
}
