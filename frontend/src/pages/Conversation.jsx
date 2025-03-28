import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import Chat from "../components/Chat";
import { AuthContext } from "../context/AuthContext";
import "../styles/Conversation.css"

const Conversation = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchMessages = async () => {
      try {
        const data = await api.getMessages(id);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [id]);

  return (
    <div className="conversation-page">
      <h2>Chat</h2>
      <Chat fetchedMessages={messages} recipientId={id}/>
    </div>
  );
};

export default Conversation;
