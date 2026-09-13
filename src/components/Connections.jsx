import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageCircle, MapPin, Sparkles, Loader2, Users } from "lucide-react";

import { BASE_URL } from "../utils/constants";
import { addConnection } from "../utils/connectionSlice";

export default function Connections() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const connections = useSelector((state) => state.connection);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${BASE_URL}/user/connections`, {
          withCredentials: true,
        });

        dispatch(addConnection(response.data?.data || []));
      } catch (err) {
        console.error("Connections loading error:", err);

        setError(
          err.response?.data?.message || "Unable to load your connections.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [dispatch]);

  const list = Array.isArray(connections) ? connections : [];

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
        <div className="text-center">
          <Loader2 size={28} className="mx-auto animate-spin text-cyan-500" />

          <p className="mt-3 text-sm text-slate-500">
            Loading your connections...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-semibold tracking-[0.25em] text-cyan-600">
            YOUR NETWORK
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
            Connections
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Developers who connected with you. Start a conversation or
            collaborate on a project together.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <Users size={15} className="text-cyan-600" />

          <span className="text-sm font-semibold text-ink">{list.length}</span>

          <span className="text-xs text-slate-500">
            {list.length === 1 ? "connection" : "connections"}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!error && list.length === 0 && (
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50">
            <Users size={26} className="text-cyan-600" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-ink">
            Your network starts here
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Discover developers with similar skills and interests, then connect
            with the people you want to build with.
          </p>

          <button
            type="button"
            onClick={() => navigate("/discover")}
            className="mt-6 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            Discover developers
          </button>
        </div>
      )}

      {/* Connection grid */}
      {list.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {list.map((connection) => {
            const user = connection;

            return (
              <article
                key={user._id}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-card"
              >
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="shrink-0"
                  >
                    <img
                      src={
                        user.photoUrl ||
                        "https://via.placeholder.com/150?text=Dev"
                      }
                      alt={`${user.firstName} ${user.lastName || ""}`}
                      className="h-16 w-16 rounded-2xl border border-slate-200 object-cover transition group-hover:border-cyan-300"
                    />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => navigate(`/profile/${user._id}`)}
                          className="truncate text-left text-base font-bold text-ink transition hover:text-cyan-600"
                        >
                          {user.firstName} {user.lastName || ""}
                        </button>

                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {user.headline || "Software Developer"}
                        </p>
                      </div>

                      {typeof user.matchScore === "number" && (
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-sm font-semibold text-cyan-600">
                            {user.matchScore}%
                          </p>

                          <p className="text-[9px] uppercase tracking-wider text-slate-400">
                            match
                          </p>
                        </div>
                      )}
                    </div>

                    {user.location && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={12} />
                        <span className="truncate">{user.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Why match */}
                {user.whyYouMatch && (
                  <div className="mt-4 flex gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 p-3">
                    <Sparkles
                      size={14}
                      className="mt-0.5 shrink-0 text-cyan-600"
                    />

                    <p className="text-xs leading-5 text-slate-600">
                      {user.whyYouMatch}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {user.skills?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {user.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[9px] text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/chat/${user._id}`)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-cyan-600"
                  >
                    <MessageCircle size={15} />
                    Message
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Profile
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
