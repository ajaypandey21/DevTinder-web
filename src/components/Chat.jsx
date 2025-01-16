import { useEffect, useState } from "react";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const { targetUserId } = useParams();
  const [newMessage, setNewMessage] = useState("");
  const userId = useSelector((store) => store.user?._id);
  const firstName = useSelector((store) => store.user?.firstName);
  const lastName = useSelector((store) => store.user?.lastName);
  const fetchChatMessages = async () => {
    try {
      const chats = await axios.get(BASE_URL + `/chat/${targetUserId}`, {
        withCredentials: true,
      });
      console.log("xx", chats?.data);
      const chatMessages = chats?.data?.messages?.map((msg) => {
        const { senderId, text } = msg;

        return {
          firstName: senderId.firstName,
          lastName: senderId.lastName,
          text,
        };
      });
      setMessages(chatMessages);
    } catch (error) {}
  };
  useEffect(() => {
    fetchChatMessages();
  }, []);
  useEffect(() => {
    if (!userId) {
      return;
    }

    const socket = createSocketConnection();
    socket.emit("joinChat", { firstName, userId, targetUserId });
    socket.on("messageReceived", ({ firstName, lastName, text }) => {
      console.log(firstName + lastName, "" + text);
      setMessages((messages) => [...messages, { firstName, lastName, text }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, targetUserId, firstName, lastName]);
  const sendMessage = () => {
    const socket = createSocketConnection();
    socket.emit("sendMessage", {
      firstName,
      lastName,
      userId,
      targetUserId,
      text: newMessage,
    });
    setNewMessage("");
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
