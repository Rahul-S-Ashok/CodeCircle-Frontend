import axios from "axios";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { removeUserFromFeed } from "../utils/feedSlice";
import { BadgeCheck, Heart, Sparkles, X } from "lucide-react";

const UserCard = ({ user, showActions = true }) => {
  const dispatch = useDispatch();

  const [exitAnimation, setExitAnimation] = useState("");
  const [limitMessage, setLimitMessage] = useState("");

  if (!user) return null;

  const {
    _id,
    firstName,
    lastName,
    photoUrl,
    age,
    gender,
    about,
    skills = [],
  } = user;

  const handleSendRequest = async (status, userId) => {
    try {
      setLimitMessage("");

      if (status === "interested") {
        setExitAnimation("animate-like");
      } else {
        setExitAnimation("animate-dislike");
      }

      await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        {
          withCredentials: true,
        }
      );

      setTimeout(() => {
        dispatch(removeUserFromFeed(userId));
      }, 350);
    } catch (err) {
      setExitAnimation("");

      if (err.response?.status === 403) {
        setLimitMessage(err.response.data.message);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <>
      {limitMessage && (
        <div className="fixed top-24 right-6 z-50 alert alert-warning shadow-xl w-96">
          <div>
            <span className="text-xl">⚠️</span>
            <span className="ml-2">{limitMessage}</span>
          </div>

          <button
            className="btn btn-warning btn-sm"
            onClick={() => {
              window.location.href = "/premium";
            }}
          >
            Upgrade 🚀
          </button>
        </div>
      )}

      <div
        className={`w-[390px] overflow-hidden rounded-[28px] bg-base-200 border border-base-300 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-purple-500/20 ${exitAnimation}`}
      >
        <div className="relative h-[460px] overflow-hidden">
          <img
            src={photoUrl || "/default-avatar.png"}
            alt={`${firstName} ${lastName}`}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold">
                {firstName} {lastName}
              </h2>

              <BadgeCheck className="text-sky-400" size={22} />
            </div>

            {(age || gender) && (
              <p className="mt-1 text-sm text-gray-200">
                {[age, gender].filter(Boolean).join(" • ")}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-400" />
              <h3 className="font-semibold">About</h3>
            </div>

            <p className="text-sm leading-6 text-gray-300">
              {about || "No bio added yet."}
            </p>
          </div>

          {skills.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold">Skills</h3>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-xs text-purple-300"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {showActions && (
            <div className="flex justify-center gap-10 pt-2">
              <button
                onClick={() => handleSendRequest("ignored", _id)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 transition hover:scale-110 hover:bg-red-600"
              >
                <X className="text-white" size={30} />
              </button>

              <button
                onClick={() => handleSendRequest("interested", _id)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-500 transition hover:scale-110 hover:bg-pink-600"
              >
                <Heart className="text-white" fill="white" size={30} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserCard;