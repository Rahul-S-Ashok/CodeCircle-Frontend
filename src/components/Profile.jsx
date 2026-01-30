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
      <div className="flex justify-center items-center min-h-[70vh]">
        <span className="loading loading-spinner loading-lg text-purple-500"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Profile Section */}
      <EditProfile user={user} />
    </div>
  );
};

export default Profile;
