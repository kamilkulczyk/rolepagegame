import React, { useState, useEffect } from "react";
import { api } from "../api";
import "../styles/Chat.css";

const Chat = ({ fetchedMessages, recipientId }) => {
  const [messages, setMessages] = useState(fetchedMessages);
  const [newMessage, setNewMessage] = useState("");
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = api.createWebSocket(recipientId, (receivedMessage) => {
      setMessages((prev) => [...prev, receivedMessage]);
    });

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [recipientId]);

  useEffect(() => {
    setMessages(fetchedMessages);
  }, [fetchedMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    api.sendMessage(ws, recipientId, newMessage);

    const sentMessage = {
      sender: "You",
      recipientId,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, sentMessage]);

    setNewMessage("");
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === "You" ? "sent" : "received"}`}>
            <span>{msg.senderId}: {msg.message}</span>
            <div className="timestamp">
              <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="message-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
