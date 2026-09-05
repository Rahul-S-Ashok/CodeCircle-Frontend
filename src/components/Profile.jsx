import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";
import EditProfile from "./EditProfile";

const Profile = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/profile/view`, {
        withCredentials: true,
      });

      // backend sends user directly
      dispatch(addUser(res.data));
    } catch (err) {
      console.error("Fetch profile error:", err);
    }
  };

  useEffect(() => {
    if (!user) {
      fetchProfile();
    }
  }, [user]);

  // LOADING STATE
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-4">
        <span className="loading loading-spinner loading-lg text-purple-500"></span>
        <p className="text-sm text-base-content/60 animate-pulse">
          Loading your profile…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-300/40">
      {/* Profile Section */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <EditProfile user={user} />
      </div>
    </div>
  );
};

export default Profile;