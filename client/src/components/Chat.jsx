import React, { useState, useEffect } from "react";
import "./Chat.css";

const Chat = ({ chat, userId }) => {
  const isMyMessage = chat.senderId._id === userId;
  const [fileUrl, setFileUrl] = useState(null);
  const [isImage, setIsImage] = useState(false);

  // Function to check if file is an image based on file name
  const checkIfImage = (fileName) => {
    return /\.(jpg|jpeg|png|gif)$/i.test(fileName);
  };

  // Function to fetch signed URL for the file
  const fetchSignedUrl = async (filePath) => {
    try {
      const res = await fetch(`http://localhost:3000/file/${filePath}`);
      const data = await res.json();
      if (data.url) {
        console.log("file url is -> ", data.url);
        setFileUrl(data.url);
        // Check if the original file name is an image
        if (chat.file && chat.file.fileName) {
          setIsImage(checkIfImage(chat.file.fileName));
        }
      }
    } catch (error) {
      console.error("Error fetching signed URL:", error);
    }
  };

  // Fetch the signed URL when the component mounts
  useEffect(() => {
    if (chat.file && chat.file.filePath && !fileUrl) {
      console.log("Fetching file URL for path:", chat.file.filePath);
      fetchSignedUrl(chat.file.filePath);
    }
  }, [chat.file]);

  return (
    <div className={`chat-container ${isMyMessage ? "my-message" : "other-message"}`}>
      {/* Sender Name */}
      {!isMyMessage && <div className="chatSender">{chat.senderId.name}</div>}

      {/* Message Container */}
      <div className={`chatMessage ${isMyMessage ? "myChat" : "otherChat"}`}>
        {/* Text Message */}
        {chat.message && <div className="chatContent">{chat.message}</div>}

        {/* File Attachment */}
        {chat.file && chat.file.filePath && fileUrl && (
          <div className="file-container">
            {isImage ? (
              <img
                src={fileUrl}
                alt={chat.file.fileName || "Shared image"}
                className="shared-image"
                loading="lazy"
                onError={(e) => {
                  console.error("Image failed to load");
                  setIsImage(false); // Fallback to file link if image fails to load
                }}
              />
            ) : (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {chat.file.fileName || "Download file"}
              </a>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className={`chattimeStamp ${isMyMessage ? "myTimestamp" : "otherTimestamp"}`}>
          {new Date(chat.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

export default Chat;