import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { removeUser, addUser } from "../utils/userSlice";
import { useEffect } from "react";

const Navbar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔥 ONLY NEW PART (to refresh premium status)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });
        dispatch(addUser(res.data));
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="navbar bg-base-300 px-4">
      {/* LEFT */}
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-lg md:text-xl">
          🧑‍💻 DevTinder
        </Link>
      </div>

      {/* RIGHT */}
      {user && (
        <div className="flex items-center gap-2 md:gap-4">
          <p className="hidden md:block text-sm md:text-base">
            Welcome, {user.firstName}
          </p>

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-9 md:w-10 rounded-full">
                <img alt="User photo" src={user.photoUrl} />
              </div>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100
                         rounded-box z-[50] mt-3 w-56 p-2 shadow-lg"
            >
              <li>
                <Link to="/profile">
                  Profile <span className="badge badge-info">New</span>
                </Link>
              </li>

              <li>
                <Link to="/connections">
                  Connections <span className="badge badge-error">💗</span>
                </Link>
              </li>

              <li>
                <Link to="/requests">
                  Requests <span className="badge badge-warning">👁️</span>
                </Link>
              </li>

              {/* 🔥 PREMIUM LOGIC (UNCHANGED) */}
              {!user.isPremium ? (
                <li>
                  <Link
                    to="/premium"
                    className="flex justify-between items-center
                    bg-gradient-to-r from-purple-600 to-pink-600
                    text-white font-semibold rounded-lg px-3 py-2"
                  >
                    Upgrade to Premium
                    <span className="badge bg-white text-purple-600">⭐</span>
                  </Link>
                </li>
              ) : (
                <li>
                  <span
                    className="flex justify-between items-center
                    bg-green-600 text-white font-semibold
                    rounded-lg px-3 py-2 cursor-default"
                  >
                    Premium Member
                    <span>⭐</span>
                  </span>
                </li>
              )}

              <div className="divider my-1"></div>

              <li>
                <button
                  onClick={handleLogout}
                  className="text-red-500 font-semibold hover:bg-red-100"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
