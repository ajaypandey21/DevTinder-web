import React, { useEffect, useState } from "react";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const userId = useSelector((store) => store.user?._id);
  const firstName = useSelector((store) => store.user?.firstName);
  const lastName = useSelector((store) => store.user?.lastName);

  const { targetUserId } = useParams();

  useEffect(() => {
    const socket = createSocketConnection();
    socket.emit("joinChat", { firstName, lastName, userId, targetUserId });
    socket.on("messageReceived", ({ firstName, lastName, text }) => {
      console.log(firstName + lastName, "" + text);
      setMessages((messages) => [...messages, { firstName, lastName, text }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, firstName]);
  const sendMessage = () => {
    const socket = createSocketConnection();
    socket.emit("sendMessage", {
      firstName,
      lastName,
      userId,
      targetUserId,
      text: newMessage,
    });
  };

  return (
    <div className="w-3/4 mx-auto border border-gray-600 m-5 h-[70vh] flex flex-col">
      <h1 className="p-5 border-b border-gray-600">Chat</h1>
      <div className="flex-1 overflow-scroll p-5">
        {messages.map((msg, index) => {
          return (
            <div
              key={index}
              className={
                "chat " +
                (firstName === msg.firstName ? "chat-end" : "chat-start")
              }
            >
              <div className="chat-header">
                {`${msg.firstName}  ${msg.lastName}`}
                <time className="text-xs opacity-50"> 2 hours ago</time>
              </div>
              <div className="chat-bubble">{msg.text}</div>
              <div className="chat-footer opacity-50">Seen</div>
            </div>
          );
        })}
      </div>
      <div className="p-5 border-t border-gray-600 flex items-center gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border border-gray-500 text-white rounded p-2"
        ></input>
        <button onClick={sendMessage} className="btn btn-secondary">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
