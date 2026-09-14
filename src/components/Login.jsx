import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [emailId, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setError("");

    try {
      const res = await axios.post(
        BASE_URL + "/auth/login",
        {
          emailId,
          password,
        },
        {
          withCredentials: true,
        },
      );

      dispatch(addUser(res.data.data));

      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
  };

  const handleSignUp = async () => {
    setError("");

    try {
      const res = await axios.post(
        BASE_URL + "/auth/signup",
        {
          firstName,
          lastName,
          emailId,
          password,
        },
        {
          withCredentials: true,
        },
      );

      dispatch(addUser(res.data.data));

      navigate("/profile");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10">
        <div className="grid w-full gap-12 lg:grid-cols-2">
          {/* LEFT SIDE */}
          <div className="hidden lg:flex flex-col justify-center text-white">
            <h1 className="text-6xl font-extrabold leading-tight">
              Connect.
              <br />
              Code.
              <br />
              Collaborate.
            </h1>

            <p className="mt-6 max-w-md text-slate-300">
              Build meaningful developer connections with real-time chat and
              premium networking.
            </p>

            <div className="mt-10 space-y-4">
              {["Developer Discovery", "Realtime Chat", "Premium Matching"].map(
                (text) => (
                  <div
                    key={text}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                  >
                    <p className="font-semibold">{text}</p>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* LOGIN CARD */}
          <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="text-center text-3xl font-bold text-white">
              {isLoginForm ? "Welcome Back" : "Create Account"}
            </h2>

            <p className="mt-2 text-center text-slate-300">
              {isLoginForm
                ? "Login to continue"
                : "Create your CodeCircle profile"}
            </p>

            <div className="mt-8 space-y-4">
              {/* SIGNUP FIELDS */}
              {!isLoginForm && (
                <>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white outline-none focus:border-violet-500"
                  />

                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white outline-none focus:border-violet-500"
                  />
                </>
              )}

              {/* EMAIL */}
              <input
                value={emailId}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white outline-none focus:border-violet-500"
              />

              {/* PASSWORD */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 pr-12 text-white outline-none focus:border-violet-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-slate-300"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* ERROR */}
              {error && <p className="text-center text-red-400">{error}</p>}

              {/* BUTTON */}
              <button
                onClick={isLoginForm ? handleLogin : handleSignUp}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 font-semibold text-white transition hover:scale-[1.02]"
              >
                {isLoginForm ? "Login" : "Create Account"}
              </button>

              {/* SWITCH */}
              <p
                onClick={() => {
                  setIsLoginForm(!isLoginForm);
                  setError("");
                }}
                className="cursor-pointer text-center text-sm text-slate-300 hover:text-white"
              >
                {isLoginForm
                  ? "New user? Create an account"
                  : "Already have an account? Login"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
