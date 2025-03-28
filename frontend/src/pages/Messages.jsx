import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await api.getConversations();
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, []);

  const handleConversationClick = (username) => {
    navigate(`/messages/${username}`);
  };

  return (
    <div className="messages-page">
      <h2>Conversations</h2>

      <div className="conversations-list">
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <div
              key={conversation.username}
              className="conversation-item"
              onClick={() => handleConversationClick(conversation.username)}
            >
              <h4>{conversation.username}</h4>
              <p>{conversation.lastMessage}</p>
            </div>
          ))
        ) : (
          <p>No conversations yet...</p>
        )}
      </div>
    </div>
  );
};

export default Messages;