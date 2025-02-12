import React, { useState, useEffect, useContext, createRef } from "react";
import { roomContext, socketContext } from "../pages/Home";
import { loadChats } from "../api/loadChats";
import { getUserId } from "../api/getUserId";
import "./Chats.css";
import Chat from "./Chat";

export default function Chats() {
  const [room, setRoom] = useContext(roomContext);
  const [chats, setChats] = useState([]);
  const [socket, setSocket] = useContext(socketContext);
  const chatRef = createRef();
  const fileRef = createRef();
  const chatAreaRef = createRef();

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);

      // Check if the file is an image
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () =>
          setPreview({ src: reader.result, type: "image" });
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type.startsWith("video/")) {
        const videoURL = URL.createObjectURL(selectedFile);
        setPreview({ src: videoURL, type: "video" });
      } else if (selectedFile.type === "application/pdf") {
        const pdfURL = URL.createObjectURL(selectedFile);
        setPreview({ src: pdfURL, type: "pdf" });
      } else if (selectedFile.type.startsWith("audio/")) {
        const audioURL = URL.createObjectURL(selectedFile);
        setPreview({ src: audioURL, type: "audio" });
      } else if (
        selectedFile.type === "text/plain" ||
        selectedFile.type === "application/json"
      ) {
        const reader = new FileReader();
        reader.onload = () => setPreview({ src: reader.result, type: "text" });
        reader.readAsText(selectedFile);
      } else if (selectedFile.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = () => setPreview({ src: reader.result, type: "csv" });
        reader.readAsText(selectedFile);
      } else if (
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ) {
        const fileURL = URL.createObjectURL(selectedFile);
        setPreview({ src: fileURL, type: "document" });
      } else if (
        selectedFile.type === "application/zip" ||
        selectedFile.type === "application/x-rar-compressed"
      ) {
        const fileURL = URL.createObjectURL(selectedFile);
        setPreview({ src: fileURL, type: "download" });
      } else {
        setPreview({ src: null, type: "unsupported" });
      }
    }
  };

  function scrollToBottom() {
    const chatDiv = document.querySelector(".allChats");
    if (chatDiv) {
      chatDiv.scrollTop = chatDiv.scrollHeight;
    }
  }

  // this is the function to add chat in chats
  function addNewChat(chatData) {
    setChats((prevChats) => [...prevChats, chatData]);
  }

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  useEffect(() => {
    // get the userId
    console.log("useEffect at the mounting");

    getUserId()
      .then((res) => {
        if (res.success) {
          console.log("res from the getUserId -> ", res);
          setUserId(res.userId);
          setUserName(res.userName);
        } else {
          console.log("error in finding the userid");
        }
      })
      .catch((err) => {
        console.log("error in calling the api to get the userId -> ", err);
      });

    console.log("username", userName, "userId ", userId);

    return () => {
      socket.emit("updateSeenCount", { userId: userId, roomId: room._id });
    };
  }, []);

  // Fetch chats for the room whenever the room changes
  useEffect(() => {
    const data = { roomId: room._id };
    loadChats(data)
      .then((res) => {
        if (res.success) {
          // console.log(
          //   "chats that we are getting from the server -> ",
          //   res.chats
          // );
          setChats(res.chats); // Only keep the latest 50 chats
        } else {
          console.log("Chat API response is false");
        }
      })
      .catch((err) => console.log("Errors while calling the loadChats API"));
    console.log("username", userName, "userId ", userId);

    console.log("room has been changed ");

    // when a room changes then make the scroll to the bottom
  }, [room]);

  useEffect(() => {
    // Listen for incoming messages from the server
    socket.on("receiveMessage", (newChat) => {
      console.log("New chat received:", newChat);
      console.log("the room in which we are is -> ", room);

      // if the chat roomId matches with the current roomId then we will add that chat into the chats
      if (newChat.roomId === room._id) {
        console.log(
          "current roomId : ",
          room._id,
          "and the message's roomId is -> ",
          newChat.roomId
        );
        console.log("current room is -> ", room);
        addNewChat(newChat); // Add the new chat to the list
      }
    });

    // Cleanup the listener on component unmount
    return () => {
      socket.off("receiveMessage"); // Removes the event listener
    };
  }, [socket, room]); // Dependency ensures this effect runs only when the socket changes

  // Handle sending a message
  const sendMessage = async () => {
    const message = chatRef.current.value.trim();
    const file = fileRef.current.files[0];

    if (message === "" && !file) {
      return; // Prevent sending empty messages
    }

    let fileData = {};

    if (file) {
      console.log("Uploading file -> ", file);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:3000/upload", {
          method: "POST",
          body: formData,
        });

        const fileResponse = await response.json();

        if (response.ok) {
          fileData = {
            fileName: fileResponse.file.fileName,
            filePath: fileResponse.file.path, // Store file path instead of URL
          };
          console.log("Uploaded file data -> ", fileData);
        } else {
          console.log("File upload failed:", fileResponse.error);
          return;
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        return;
      }
    }

    // Prepare chat data
    const chatData = {
      roomId: room._id,
      senderId: {
        _id: userId,
        name: userName,
      },
      message: message,
      file: fileData,
      createdAt: new Date().toISOString(),
    };

    console.log("Final chat data ->", chatData);

    // Emit message via socket.io
    socket.emit("sendMessage", chatData);

    setFile(null);
    setPreview(null);

    // Update UI with new message
    addNewChat(chatData);

    // Clear input fields
    chatRef.current.value = "";
    fileRef.current.value = ""; // Clear file input
  };

  useEffect(() => {
    console.log(
      "when the chats is being updated then current room is -> ",
      room
    );
  }, [chats]);

  const removePreview = () => {
    setPreview(null);
    setFile(null);
    fileRef.current.value = ""; // Reset file input
  };

  const getPreview = (preview) => {
    switch (preview.type) {
      case "image":
        return <img src={preview.src} alt="img-preview" className="preview" />;
  
      case "video":
        return (
          <video controls width="500" className="preview">
            <source src={preview.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
  
      default:
        return (
          <div className="preview placeholder">
            <img src="../../public/images/image-placeholder.png" alt="File Preview" className="preview"/>
          </div>
        );
    }
  };
  
  
  

  return (
    <>
      <div className="chatarea">
        <div className="allChats">
          {chats.map((chat, index) => (
            <Chat key={index} chat={chat} userId={userId} />
          ))}
        </div>

        {preview && (
          <div className="file-preview">
            <div className="preview-container">
              {/* <img src={preview} alt="Preview" className="preview-image" /> */}
              {getPreview(preview)}
              <button className="remove-preview" onClick={removePreview}>
                ✖
              </button>
            </div>
          </div>
        )}

        <div className="sendMessageSection input-button-section">
          <input
            type="text"
            placeholder="Enter your message..."
            className="sendMessage-input"
            ref={chatRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Prevents a newline from being added
                sendMessage(); // Calls the sendMessage function
              }
            }}
          />
          {/* input for the message */}
          <input
            type="file"
            ref={fileRef}
            className="file-input"
            onChange={handleFileChange}
          />
          <button
            className="file-upload-button"
            onClick={() => fileRef.current.click()}
          >
            📂
          </button>
          {/* file input */}
          <button className="sendMessage-button" onClick={sendMessage}>
            <i className="fa-solid fa-arrow-up"></i>
          </button>{" "}
          {/* send button */}
        </div>
      </div>
    </>
  );
}
