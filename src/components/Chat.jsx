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
  const [targetUser, setTargetUser] = useState(null);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const user = useSelector((store) => store.user);
  const userId = user?._id;

  // ---------------- FETCH TARGET USER (FIXED) ----------------
  useEffect(() => {
    const fetchTargetUser = async () => {
      try {
        const res = await axios.get(
          BASE_URL + "/user/" + targetUserId,
          { withCredentials: true }
        );
        setTargetUser(res.data);
      } catch (err) {
        console.error("Failed to fetch target user", err);
      }
    };

    if (targetUserId) fetchTargetUser();
  }, [targetUserId]);

  // ---------------- FETCH CHAT MESSAGES ----------------
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await axios.get(
          BASE_URL + "/chat/" + targetUserId,
          { withCredentials: true }
        );

        const msgs = res.data.messages.map((msg) => ({
          senderId: msg.senderId._id,
          firstName: msg.senderId.firstName,
          text: msg.text,
          time: msg.createdAt,
          seen: msg.seen,
        }));

        setMessages(msgs);
      } catch (err) {
        console.error("Failed to fetch chat", err);
      }
    };

    if (targetUserId) fetchChat();
  }, [targetUserId]);

  // ---------------- SOCKET ----------------
  useEffect(() => {
    if (!userId || !targetUserId) return;

    socketRef.current = createSocketConnection();

    socketRef.current.emit("joinChat", { userId, targetUserId });

    socketRef.current.on("messageReceived", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          senderId: msg.senderId,
          firstName: msg.firstName,
          text: msg.text,
          time: new Date(),
          seen: false,
        },
      ]);
    });

    return () => socketRef.current.disconnect();
  }, [userId, targetUserId]);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    socketRef.current.emit("sendMessage", {
      senderId: userId,
      targetUserId,
      text: newMessage,
    });

    setNewMessage("");
  };

  // ---------------- UI ----------------
  return (
    <div className="flex justify-center px-3 py-6">
      <div className="w-full max-w-4xl h-[72vh] flex flex-col bg-base-300 rounded-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-base-content/10 flex items-center gap-3">
          <span className="text-2xl">💬</span>
          <div>
            <h2 className="font-semibold text-lg">
              {targetUser?.firstName || "Chat"}
            </h2>
            <p className="text-xs opacity-60">Connected</p>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.map((m, i) => {
            const isMe = m.senderId === userId;

            return (
              <div
                key={i}
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm
                    ${
                      isMe
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-none"
                        : "bg-base-100 text-base-content rounded-bl-none"
                    }`}
                >
                  {!isMe && (
                    <p className="text-xs opacity-60 mb-1">
                      {m.firstName}
                    </p>
                  )}
                  {m.text}
                </div>

                <div
                  className={`mt-1 text-[10px] opacity-60 ${
                    isMe ? "text-right pr-1" : "text-left pl-1"
                  }`}
                >
                  {new Date(m.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isMe && m.seen && " · Seen"}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="px-5 py-4 border-t border-base-content/10 bg-base-200 flex gap-3">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="w-full px-5 py-3 rounded-full bg-base-100 border outline-none"
            placeholder="Type a message…"
          />
          <button
            onClick={sendMessage}
            className="px-7 py-3 rounded-full text-white bg-gradient-to-r from-indigo-500 to-purple-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
