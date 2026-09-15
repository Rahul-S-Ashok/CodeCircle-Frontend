import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import {
  ArrowLeft,
  Send,
  Users,
  Plus,
  MoreVertical,
  Loader2,
  X,
} from "lucide-react";

import { BASE_URL } from "../utils/constants";
import { createSocketConnection } from "../utils/socket";

export default function ProjectRoom() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const user = useSelector((state) => state.user);

  const socketRef = useRef(null);

  const [message, setMessage] = useState("");
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // ADD MEMBER STATES
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberUserId, setMemberUserId] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  // =========================================================
  // FETCH PROJECT + MESSAGES
  // =========================================================

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError("");

        const [projectResponse, messagesResponse] = await Promise.all([
          axios.get(`${BASE_URL}/projects/${projectId}`, {
            withCredentials: true,
          }),

          axios.get(`${BASE_URL}/projects/${projectId}/messages`, {
            withCredentials: true,
          }),
        ]);

        setProject(projectResponse.data?.data || null);

        setMessages(messagesResponse.data?.data || []);
      } catch (err) {
        console.error("Project loading error:", err);

        setError(err.response?.data?.message || "Unable to load project.");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  // =========================================================
  // SOCKET CONNECTION
  // =========================================================

  useEffect(() => {
    if (!projectId) return;

    const socket = createSocketConnection();

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Project socket connected:", socket.id);

      socket.emit("joinProject", {
        projectId,
      });
    });

    socket.on("projectMessageReceived", (newMessage) => {
      setMessages((previousMessages) => {
        const exists = previousMessages.some(
          (item) => item._id === newMessage._id,
        );

        if (exists) {
          return previousMessages;
        }

        return [...previousMessages, newMessage];
      });
    });

    socket.on("project:error", (data) => {
      console.error("Project socket error:", data);

      setError(data?.message || "Project socket error.");

      setSending(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Project socket disconnected:", reason);
    });

    return () => {
      console.log("🧹 Cleaning project socket");

      socket.off("projectMessageReceived");

      socket.off("project:error");

      socket.disconnect();

      socketRef.current = null;
    };
  }, [projectId]);

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const sendMessage = (event) => {
    event.preventDefault();

    const text = message.trim();

    if (!text) return;

    const socket = socketRef.current;

    if (!socket || !socket.connected) {
      setError("Chat is not connected. Please try again.");

      return;
    }

    setSending(true);

    socket.emit("sendProjectMessage", {
      projectId,
      text,
    });

    setMessage("");

    setSending(false);
  };

  // =========================================================
  // ADD MEMBER
  // =========================================================

  const addMember = async (event) => {
    event.preventDefault();

    const userId = memberUserId.trim();

    if (!userId) {
      setError("Please enter a user ID.");
      return;
    }

    try {
      setAddingMember(true);
      setError("");

      const response = await axios.post(
        `${BASE_URL}/projects/${projectId}/members`,
        {
          userId,
        },
        {
          withCredentials: true,
        },
      );

      const updatedProject = response.data?.data;

      if (updatedProject) {
        setProject(updatedProject);
      }

      setMemberUserId("");
      setShowAddMember(false);
    } catch (err) {
      console.error("Add member error:", err);

      setError(err.response?.data?.message || "Unable to add member.");
    } finally {
      setAddingMember(false);
    }
  };

  // =========================================================
  // REMOVE MEMBER
  // =========================================================

  const removeMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) {
      return;
    }

    try {
      setError("");

      const response = await axios.delete(
        `${BASE_URL}/projects/${projectId}/members/${memberId}`,
        {
          withCredentials: true,
        },
      );

      const updatedProject = response.data?.data;

      if (updatedProject) {
        setProject(updatedProject);
      }
    } catch (err) {
      console.error("Remove member error:", err);

      setError(err.response?.data?.message || "Unable to remove member.");
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 size={28} className="mx-auto animate-spin text-cyan-500" />

          <p className="mt-3 text-sm text-slate-500">Loading project...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PROJECT NOT FOUND
  // =========================================================

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-sm text-cyan-600"
        >
          <ArrowLeft size={18} />
          Back to projects
        </button>

        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-600">
          {error || "Project not found."}
        </div>
      </div>
    );
  }

  // =========================================================
  // MEMBERS
  // =========================================================

  const members = [project.ownerId, ...(project.members || [])].filter(Boolean);

  const isOwner = String(project.ownerId?._id) === String(user?._id);

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="mx-auto max-w-6xl pb-10 text-slate-900">
      {/* HEADER */}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/projects")}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>

            <p className="mt-1 text-sm text-slate-500">
              Project collaboration space
            </p>
          </div>
        </div>

        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          <span>{error}</span>

          <button type="button" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* WORKSPACE */}

      <div className="mt-6 grid min-h-[650px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[1fr_280px]">
        {/* CHAT */}

        <div className="flex min-h-[650px] flex-col border-r border-slate-200">
          {/* CHAT HEADER */}

          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Users size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">Project Chat</h2>

                <p className="text-xs text-slate-500">
                  {members.length} {members.length === 1 ? "member" : "members"}
                </p>
              </div>
            </div>
          </div>

          {/* MESSAGES */}

          <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/50 p-5">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-400">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((item) => {
                const sender = item.senderId;

                const name = sender
                  ? `${sender.firstName || ""} ${sender.lastName || ""}`.trim()
                  : "Unknown";

                return (
                  <div key={item._id} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cyan-100 text-xs font-bold text-cyan-700">
                      {sender?.photoUrl ? (
                        <img
                          src={sender.photoUrl}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-700">{name}</p>

                      <div className="mt-1 max-w-xl rounded-2xl rounded-tl-none bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                        {item.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* MESSAGE INPUT */}

          <form
            onSubmit={sendMessage}
            className="border-t border-slate-200 p-4"
          >
            <div className="flex gap-3">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Message your team..."
                disabled={sending}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </form>
        </div>

        {/* SIDEBAR */}

        <aside className="bg-slate-50 p-5">
          {/* PROJECT INFO */}

          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-cyan-600">
              PROJECT
            </p>

            <h2 className="mt-2 text-lg font-bold">{project.title}</h2>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {project.description ||
                "Collaborate with your team and build something amazing together."}
            </p>
          </div>

          {/* TECHNOLOGIES */}

          {project.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-mono text-[9px] text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* MEMBERS */}

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Members</h3>

              {/* ONLY OWNER CAN SEE PLUS */}

              {isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setShowAddMember(true);
                  }}
                  className="rounded-lg p-1.5 text-cyan-600 transition hover:bg-cyan-50"
                  title="Add member"
                >
                  <Plus size={18} />
                </button>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {members.map((member) => {
                const name = `${member.firstName || ""} ${
                  member.lastName || ""
                }`.trim();

                const memberIsOwner =
                  String(member._id) === String(project.ownerId?._id);

                return (
                  <div
                    key={member._id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white text-xs font-bold text-cyan-600 shadow-sm">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-700">
                          {name}
                        </p>

                        {memberIsOwner && (
                          <p className="text-[9px] text-cyan-600">
                            Project owner
                          </p>
                        )}
                      </div>
                    </div>

                    {/* OWNER CAN REMOVE MEMBERS */}

                    {isOwner && !memberIsOwner && (
                      <button
                        type="button"
                        onClick={() => removeMember(member._id)}
                        className="text-[10px] text-rose-500 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* PROJECT ID */}

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Project Room
            </p>

            <p className="mt-1 truncate font-mono text-[10px] text-slate-500">
              {projectId}
            </p>
          </div>
        </aside>
      </div>

      {/* =====================================================
          ADD MEMBER MODAL
      ===================================================== */}

      {showAddMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !addingMember) {
              setShowAddMember(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {/* MODAL HEADER */}

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add Project Member
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Enter the CodeCircle user's ID.
                </p>
              </div>

              <button
                type="button"
                disabled={addingMember}
                onClick={() => {
                  setShowAddMember(false);
                  setMemberUserId("");
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={addMember} className="mt-6">
              <label className="text-xs font-semibold text-slate-700">
                User ID
              </label>

              <input
                type="text"
                value={memberUserId}
                onChange={(event) => setMemberUserId(event.target.value)}
                placeholder="Enter user ID..."
                disabled={addingMember}
                autoFocus
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white disabled:opacity-50"
              />

              {/* BUTTONS */}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={addingMember}
                  onClick={() => {
                    setShowAddMember(false);
                    setMemberUserId("");
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addingMember || !memberUserId.trim()}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addingMember ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add Member
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
