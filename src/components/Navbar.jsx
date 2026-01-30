import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";

const Navbar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
          {/* Hide welcome text on mobile */}
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
                         rounded-box z-[50] mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link to="/profile" className="justify-between">
                  Profile <span className="badge">New</span>
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

              <li>
                <Link
                     to="/premium"
                     className="flex items-center justify-between gap-2 px-3 py-2 rounded-md 
                     bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition shadow-md w-full">
                    <span>Premium</span>

                   <span className="badge bg-white text-purple-600 font-bold">⭐</span>
                </Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
