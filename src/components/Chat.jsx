import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

import { BASE_URL } from "../utils/constants";
import { createSocketConnection } from "../utils/socket";

export default function Chat() {
  const { targetUserId } = useParams();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.user);

  const [targetUser, setTargetUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [icebreakers, setIcebreakers] = useState([]);
  const [error, setError] = useState("");

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  /* -------------------------------------------------------
     Scroll to bottom
  ------------------------------------------------------- */

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 50);
    }
  }, [messages.length, loading]);

  /* -------------------------------------------------------
     Load chat
  ------------------------------------------------------- */

  useEffect(() => {
    if (!targetUserId || !currentUser?._id) {
      return;
    }

    let cancelled = false;

    const loadChat = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${BASE_URL}/chat/${targetUserId}`, {
          withCredentials: true,
        });

        if (cancelled) return;

        const chatData = response.data?.data;

        setTargetUser(chatData?.targetUser || null);
        setMessages(chatData?.messages || []);
      } catch (err) {
        console.error("Chat loading error:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message || "Unable to open this conversation.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadChat();

    return () => {
      cancelled = true;
    };
  }, [targetUserId, currentUser?._id]);

  /* -------------------------------------------------------
     Socket connection
  ------------------------------------------------------- */

  useEffect(() => {
    if (!targetUserId || !currentUser?._id) {
      return;
    }

    const socket = createSocketConnection();

    socketRef.current = socket;

    const joinChat = () => {
      console.log("Joining chat with:", targetUserId);

      socket.emit("joinChat", {
        targetUserId,
      });
    };

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);

      joinChat();
    };

    const handleDisconnect = (reason) => {
      console.log("Socket disconnected:", reason);
    };

    /* -------------------------------------------------------
       Receive message
    ------------------------------------------------------- */

    const handleMessage = (message) => {
      if (!message) return;

      console.log("Message received:", message);

      const senderId = message.senderId?._id || message.senderId;

      /*
        Backend only sends senderId.
        A message belongs to this chat if:

        - sender is target user
        OR
        - sender is current user
      */

      const belongsToChat =
        String(senderId) === String(targetUserId) ||
        String(senderId) === String(currentUser._id);

      if (!belongsToChat) {
        return;
      }

      setMessages((previous) => {
        /*
          Prevent duplicate messages.

          This is important because the backend can emit
          the message through both the chat room and directly
          to the user.
        */

        if (
          message._id &&
          previous.some((item) => String(item._id) === String(message._id))
        ) {
          return previous;
        }

        return [...previous, message];
      });
    };

    /* -------------------------------------------------------
       Socket errors
    ------------------------------------------------------- */

    const handleChatError = (data) => {
      console.error("Chat socket error:", data);

      setError(data?.message || "Chat connection error.");
    };

    socket.on("connect", handleConnect);

    socket.on("disconnect", handleDisconnect);

    socket.on("messageReceived", handleMessage);

    socket.on("chat:error", handleChatError);

    /*
      If already connected
    */

    if (socket.connected) {
      joinChat();
    }

    /* -------------------------------------------------------
       Cleanup
    ------------------------------------------------------- */

    return () => {
      socket.off("connect", handleConnect);

      socket.off("disconnect", handleDisconnect);

      socket.off("messageReceived", handleMessage);

      socket.off("chat:error", handleChatError);

      socket.disconnect();

      socketRef.current = null;
    };
  }, [targetUserId, currentUser?._id]);

  /* -------------------------------------------------------
     Send message
  ------------------------------------------------------- */

  const sendMessage = (event) => {
    event?.preventDefault();

    const trimmed = text.trim();

    if (!trimmed || sending) {
      return;
    }

    if (trimmed.length > 2000) {
      setError("Message cannot be longer than 2000 characters.");

      return;
    }

    const socket = socketRef.current;

    if (!socket?.connected) {
      setError("Chat connection is unavailable. Please try again.");

      return;
    }

    setSending(true);
    setError("");

    socket.emit(
      "sendMessage",
      {
        targetUserId,
        text: trimmed,
      },
      () => {
        setSending(false);
      },
    );

    setText("");

    /*
      Safety timeout.

      Your backend currently doesn't send an acknowledgement,
      so this prevents the send button from staying stuck.
    */

    setTimeout(() => {
      setSending(false);
    }, 500);
  };

  /* -------------------------------------------------------
     Generate AI icebreakers
  ------------------------------------------------------- */

  const generateIcebreakers = async () => {
    if (!targetUserId || aiLoading) {
      return;
    }

    setAiLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${BASE_URL}/ai/icebreaker`,
        {
          targetUserId,
        },
        {
          withCredentials: true,
        },
      );

      setIcebreakers(response.data?.data || []);
    } catch (err) {
      console.error("Icebreaker error:", err);

      setError(
        err.response?.data?.message || "Unable to generate icebreakers.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const useIcebreaker = (message) => {
    setText(message);
    setIcebreakers([]);
  };

  /* -------------------------------------------------------
     Loading
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-cyan-500" size={28} />

          <p className="mt-3 text-sm text-slate-500">Opening conversation...</p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     Missing chat user
  ------------------------------------------------------- */

  if (!targetUser) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-lg font-semibold text-ink">
          Conversation unavailable
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {error || "This developer could not be found."}
        </p>

        <button
          type="button"
          onClick={() => navigate("/messages")}
          className="mt-6 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600"
        >
          Back to messages
        </button>
      </div>
    );
  }

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  return (
    <div className="mx-auto flex h-[calc(100vh-3rem)] max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
      {/* HEADER */}

      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
        <button
          type="button"
          onClick={() => navigate("/messages")}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Back to messages"
        >
          <ArrowLeft size={19} />
        </button>

        <img
          src={
            targetUser.photoUrl || "https://via.placeholder.com/100?text=Dev"
          }
          alt=""
          className="h-10 w-10 rounded-full border border-slate-200 object-cover"
        />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-ink md:text-base">
            {targetUser.firstName} {targetUser.lastName || ""}
          </h2>

          <p className="truncate text-xs text-slate-500">
            {targetUser.headline || "CodeCircle developer"}
          </p>
        </div>
      </header>

      {/* ERROR */}

      {error && (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-center text-xs text-rose-600">
          {error}
        </div>
      )}

      {/* MESSAGES */}

      <main className="flex-1 overflow-y-auto bg-slate-50/50 px-4 py-5 md:px-8">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50">
                <Sparkles size={23} className="text-cyan-600" />
              </div>

              <h3 className="mt-4 font-semibold text-ink">
                Start the conversation
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Talk about projects, technologies, hackathons or find something
                you can build together.
              </p>

              <button
                type="button"
                onClick={generateIcebreakers}
                disabled={aiLoading}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 disabled:opacity-50"
              >
                {aiLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} className="text-cyan-600" />
                )}
                AI Icebreakers
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const senderId = message.senderId?._id || message.senderId;

              const mine = String(senderId) === String(currentUser?._id);

              return (
                <div
                  key={
                    message._id || `${senderId}-${message.createdAt}-${index}`
                  }
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm md:max-w-[65%] ${
                      mine
                        ? "rounded-br-md bg-cyan-500 text-white"
                        : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {message.text}
                    </p>

                    {message.createdAt && (
                      <p
                        className={`mt-1 text-[9px] ${
                          mine ? "text-white/60" : "text-slate-400"
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* AI ICEBREAKERS */}

      {icebreakers.length > 0 && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:px-6">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-600" />

            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              AI suggestions
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {icebreakers.map((item, index) => (
              <button
                key={`${item}-${index}`}
                type="button"
                onClick={() => useIcebreaker(item)}
                className="min-w-max rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT */}

      <form
        onSubmit={sendMessage}
        className="border-t border-slate-200 bg-white p-3 md:p-4"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-cyan-300 focus-within:bg-white">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage(event);
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder={`Message ${targetUser.firstName}...`}
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />

          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Send message"
          >
            {sending ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Send size={17} />
            )}
          </button>
        </div>

        <div className="mt-1 px-2 text-right text-[9px] text-slate-400">
          {text.length}/2000
        </div>
      </form>
    </div>
  );
}
