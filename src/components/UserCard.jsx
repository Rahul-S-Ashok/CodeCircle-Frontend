import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user, showActions = true }) => {
  const dispatch = useDispatch();

  if (!user) return null;

  const {
    _id,
    firstName,
    lastName,
    photoUrl,
    age,
    gender,
    about,
    skills,
  } = user;

  const handleSendRequest = async (status, userId) => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(userId));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="card bg-base-300 w-96 shadow-xl">
      <figure>
        <img
          src={photoUrl || "/default-avatar.png"}
          alt="photo"
          className="h-80 w-full object-cover"
        />
      </figure>

      <div className="card-body">
        <h2 className="card-title">
          {firstName} {lastName}
        </h2>

        {age && gender && (
          <p className="text-sm text-gray-400">
            {age}, {gender}
          </p>
        )}

        <p className="mt-2">{about}</p>

        {Array.isArray(skills) && skills.length > 0 && (
          <div className="mt-3">
            <h3 className="font-semibold mb-1">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-200 text-blue-700 px-2 py-1 rounded-lg text-xs"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ✅ ACTION BUTTONS — ONLY FOR FEED */}
        {showActions && (
          <div className="flex justify-center gap-6 mt-6">
            <button
              className="btn bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
              onClick={() => handleSendRequest("ignored", _id)}
            >
              Ignore
            </button>

            <button
              className="btn bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg"
              onClick={() => handleSendRequest("interested", _id)}
            >
              Interested
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
