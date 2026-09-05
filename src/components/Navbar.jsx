import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { removeUser, addUser } from "../utils/userSlice";
import { useEffect } from "react";
import { Crown, Code2 } from "lucide-react";

const Navbar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
      await axios.post(
        `${BASE_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );

      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="navbar min-h-[72px]
      bg-[#120B1F]/70
      backdrop-blur-xl
      border-b border-purple-500/20
      shadow-lg shadow-purple-900/10
      px-8 lg:px-12
      sticky top-0 z-50"
    >
      {/* LEFT */}
      <div className="flex items-center gap-20 flex-1">
        <Link
          to="/feed"
          className="flex items-center gap-4 hover:scale-105 hover:-translate-y-0.5 duration-300"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Code2 className="text-white w-7 h-7" />
          </div>

          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-pink-400 bg-clip-text text-transparent">
              DevTinder
            </h1>

            <p className="text-xs text-gray-400">
              Code • Connect • Collaborate
            </p>
          </div>
        </Link>
        
        {user && (
        <div className="hidden lg:flex items-center gap-12 text-[15px] font-medium">
          <Link
            to="/feed"
            className="hover:text-violet-400 hover:scale-105 transition-all duration-200"
          >
            Feed
          </Link>

          <Link
            to="/connections"
            className="hover:text-violet-400 hover:scale-105 transition-all duration-200"
          >
            Connections
          </Link>

          <Link
            to="/requests"
            className="hover:text-violet-400 hover:scale-105 transition-all duration-200"
          >
            Requests
          </Link>

          <Link
            to="/premium"
            className="flex items-center gap-2 hover:text-yellow-400 hover:scale-105 transition-all duration-200"
          >
            <Crown size={18} />

            {user?.isPremium ? (
              <>
                <span>Premium</span>

                <span className="badge badge-warning badge-outline badge-sm font-semibold">
                  {user?.membershipType?.toUpperCase()}
                </span>
              </>
            ) : (
              <span>Premium</span>
            )}
          </Link>
        </div>
        )}
      </div>
      

      {user && (
        <div className="flex items-center gap-8 ml-auto">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar ml-3 ring-2 ring-transparent hover:ring-pink-500 transition-all duration-200"
            >
              <div className="w-12 rounded-full ring-1 ring-white/10 overflow-hidden">
                <img
                  alt="User"
                  src={user.photoUrl}
                  className="object-cover"
                />
              </div>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content
              bg-[#1A1128]/95
              backdrop-blur-xl
              rounded-2xl
              z-[50]
              mt-3
              w-64
              p-2
              shadow-2xl
              border border-purple-500/20"
            >
              <div className="px-3 py-3 border-b border-purple-500/20 mb-2">
                <p className="font-semibold flex items-center gap-2">
                  {user.firstName} {user.lastName}

                  {user.isPremium && (
                    <span className="badge badge-warning badge-sm">
                      👑 PRO
                    </span>
                  )}
                </p>

                <p className="text-xs text-gray-400 truncate">
                  {user.emailId}
                </p>
              </div>

              <li>
                <Link
                  to="/profile"
                  className="rounded-xl py-2 hover:bg-violet-500/10"
                >
                  👤 View Profile
                </Link>
              </li>

              <div className="divider my-1"></div>

              <li>
                <button
                  onClick={handleLogout}
                  className="rounded-xl px-2 py-2 text-red-500 hover:bg-red-500/10"
                >
                  🚪 Logout
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