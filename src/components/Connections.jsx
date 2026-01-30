import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnection, removeConnection } from "../utils/connectionSlice";
import { useNavigate } from "react-router-dom";

const Connections = () => {
  const connections = useSelector((store) => store.connection);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchConnections = async () => {
    try {
      dispatch(removeConnection()); // loading

      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });

      const connectionList =
        res.data?.data ||
        res.data?.connections ||
        res.data ||
        [];

      dispatch(addConnection(connectionList));
    } catch (error) {
      console.log("CONNECTION ERROR 👉", error);
      dispatch(addConnection([]));
    }
  };

  useEffect(() => {
    if (connections === null) {
      fetchConnections();
    }
  }, [connections]);

  // Loading
  if (connections === null) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Empty
  if (!Array.isArray(connections) || connections.length === 0) {
    return (
      <h1 className="flex justify-center text-2xl my-10 text-green-300">
        No connections found
      </h1>
    );
  }

  return (
    <div className="text-center my-10">
      <h1 className="font-bold text-3xl text-pink-400">
        Connections ({connections.length})
      </h1>

      {connections.map((connection) => {
        const {
          _id,
          firstName,
          lastName,
          photoUrl,
          age,
          gender,
          about,
        } = connection;

        return (
          <div
            key={_id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between m-2 p-4 rounded-lg bg-base-300 w-full sm:w-3/4 lg:w-1/2 mx-auto"
          >
            {/* LEFT */}
            <div className="flex items-center">
              <img
                alt="photo"
                className="w-14 h-14 rounded-full object-cover"
                src={photoUrl}
              />

              <div className="text-left ml-4">
                <h2 className="font-bold text-xl">
                  {firstName} {lastName}
                </h2>

                {age && gender && <p>{age} {gender}</p>}
                <p>{about}</p>
              </div>
            </div>

            {/* RIGHT */}
            <button
              onClick={() => navigate(`/chat/${_id}`)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg mt-3 sm:mt-0"
            >
              Chat
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Connections;
