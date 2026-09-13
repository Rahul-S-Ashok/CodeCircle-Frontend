import axios from "axios";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { removeUserFromFeed } from "../utils/feedSlice";
import { Heart, Star, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserCard({ user, showActions = true }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [exitAnimation, setExitAnimation] = useState("");
  const [limitMessage, setLimitMessage] = useState("");

  if (!user) return null;

  const {
    _id,
    firstName,
    lastName,
    photoUrl,
    age,
    headline,
    location,
    about,
    skills = [],
    matchScore,
    openToCollaborate,
  } = user;

  const handleSendRequest = async (status, userId) => {
    try {
      setLimitMessage("");

      setExitAnimation(
        status === "interested" ? "animate-like" : "animate-dislike",
      );

      await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        {
          withCredentials: true,
        },
      );

      setTimeout(() => {
        dispatch(removeUserFromFeed(userId));
      }, 320);
    } catch (err) {
      setExitAnimation("");

      if (err.response?.status === 403) {
        setLimitMessage(err.response.data.message);
      }
    }
  };

  return (
    <>
      {/* Premium Limit Message */}

      {limitMessage && (
        <div className="fixed right-6 top-8 z-50 w-80 rounded-xl border border-amber-400/40 bg-panel p-4 shadow-lg">
          <p className="text-sm">{limitMessage}</p>

          <button
            className="mt-2 text-sm font-semibold text-teal"
            onClick={() => navigate("/premium")}
          >
            Upgrade
          </button>
        </div>
      )}

      {/* User Card */}

      <div
        className={`w-full max-w-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-panel shadow-glow ${exitAnimation}`}
      >
        {/* Image Section */}

        <div className="relative h-[380px]">
          <img
            src={photoUrl || "/default-avatar.png"}
            alt={`${firstName} ${lastName}`}
            className="h-full w-full object-cover"
          />

          {/* Dark overlay for readable text */}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          {/* Match Score */}

          {matchScore != null && (
            <span className="absolute right-4 top-4 z-10 rounded-full bg-teal px-3 py-1 font-mono text-xs font-semibold text-black shadow-md">
              {matchScore}% Match
            </span>
          )}

          {/* User Details */}

          <div className="absolute bottom-0 left-0 z-10 w-full p-6">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">
              {firstName} {lastName}
              {age ? `, ${age}` : ""}
            </h2>

            <p className="mt-1 text-sm font-medium text-teal drop-shadow">
              {headline || "Developer"}
            </p>

            <p className="mt-1 text-xs text-slate-200 drop-shadow">
              {location || "Remote"}

              {openToCollaborate !== false ? " · Open to collaborate" : ""}
            </p>
          </div>
        </div>

        {/* Card Content */}

        <div className="space-y-4 p-6">
          <p className="text-sm leading-6 text-muted">
            {about || "No bio yet."}
          </p>

          {/* Skills */}

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-teal/30 bg-teal/10 px-3 py-1 font-mono text-xs text-teal"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}

          {showActions && (
            <div className="flex items-center justify-center gap-8 pt-2">
              {/* Ignore */}

              <button
                type="button"
                onClick={() => handleSendRequest("ignored", _id)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600/90 text-white transition hover:scale-110 hover:bg-rose-600"
              >
                <X />
              </button>

              {/* View Profile */}

              <button
                type="button"
                onClick={() => navigate(`/profile/${_id}`)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-volt/20 text-volt transition hover:scale-110"
              >
                <Star size={18} />
              </button>

              {/* Interested */}

              <button
                type="button"
                onClick={() => handleSendRequest("interested", _id)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-teal text-black transition hover:scale-110"
              >
                <Heart fill="currentColor" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
