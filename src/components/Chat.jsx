import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Chat = () => {
  const { targetUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const user = useSelector((store) => store.user);
  const userId = user?._id;

  // Fetch old messages
  useEffect(() => {
    const fetchChat = async () => {
      const res = await axios.get(BASE_URL + "/chat/" + targetUserId, {
        withCredentials: true,
      });

      const msgs = res.data.messages.map((msg) => ({
        firstName: msg.senderId.firstName,
        lastName: msg.senderId.lastName,
        text: msg.text,
      }));

      setMessages(msgs);
    };

    fetchChat();
  }, [targetUserId]);

  // Socket connection
  useEffect(() => {
    if (!userId) return;

    socketRef.current = createSocketConnection();
    socketRef.current.emit("joinChat", { userId, targetUserId });

    socketRef.current.on("messageReceived", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socketRef.current.disconnect();
  }, [userId, targetUserId]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    socketRef.current.emit("sendMessage", {
      userId,
      targetUserId,
      firstName: user.firstName,
      lastName: user.lastName,
      text: newMessage,
    });

    setNewMessage("");
  };

  return (
    <div className="flex justify-center px-3 py-6">
      <div className="w-full max-w-4xl h-[72vh] flex flex-col bg-base-300 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-base-content/10 flex items-center gap-2">
          <span className="text-xl">💬</span>
          <h2 className="font-semibold text-lg">Chat</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((m, i) => {
            const isMe = m.firstName === user.firstName;

            return (
              <div
                key={i}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[72%] px-4 py-2 rounded-2xl text-sm
                    ${
                      isMe
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-none shadow-md"
                        : "bg-base-100 text-base-content rounded-bl-none shadow"
                    }`}
                >
                  {!isMe && (
                    <p className="text-xs opacity-60 mb-1">
                      {m.firstName}
                    </p>
                  )}
                  {m.text}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="px-5 py-4 border-t border-base-content/10 bg-base-200 flex gap-3">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="w-full px-5 py-3 rounded-full bg-base-100 text-base-content
                       border border-base-content/20 outline-none
                       focus:border-primary focus:ring-2 focus:ring-primary/40
                       transition-all duration-200"
            placeholder="Type a message…"
          />

          <button
            onClick={sendMessage}
            className="px-7 py-3 rounded-full font-semibold text-white
                       bg-gradient-to-r from-indigo-500 to-purple-600
                       hover:from-indigo-600 hover:to-purple-700
                       active:scale-95 hover:scale-105
                       shadow-lg shadow-purple-500/30
                       transition-all duration-200"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
