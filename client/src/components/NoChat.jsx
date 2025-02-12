import React from 'react';
import { MessageSquare, Users } from 'lucide-react';
import './NoChat.css'; // Importing the CSS file

export default function NoChat() {
  return (
    <div className="no-room-selected-container">
      <div className="card">
        {/* Header */}
        <div className="header">
          <h1 className="title">Welcome to Your Chat Space</h1>
          <p className="subtitle">Select a room from the sidebar to start chatting</p>
        </div>

        {/* Features */}
        <div className="features">
          <div className="feature-item">
            <MessageSquare className="icon" />
            <div>
              <h3 className="feature-title">Real-time Chat</h3>
            </div>
          </div>

          <div className="feature-item">
            <Users className="icon" />
            <div>
              <h3 className="feature-title">Group Conversations</h3>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {/* <div className="call-to-action">
          <h2 className="cta-title">Ready to Start?</h2>
          <p>Choose a room from the sidebar</p>
        </div> */}
      </div>
    </div>
  );
}
