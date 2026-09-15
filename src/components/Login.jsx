import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Eye,
  EyeOff,
  GitBranch,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";

import { BASE_URL, GOOGLE_CLIENT_ID } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import Logo from "./Logo";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState("");

  const googleButtonRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* =====================================================
     GOOGLE LOGIN
  ===================================================== */

  const handleGoogleResponse = async (response) => {
    if (!response?.credential) {
      setError("Google authentication failed.");
      return;
    }

    setGoogleBusy(true);
    setError("");

    try {
      const res = await axios.post(
        `${BASE_URL}/auth/google`,
        {
          credential: response.credential,
        },
        {
          withCredentials: true,
        },
      );

      const user = res.data?.data;

      if (!user) {
        throw new Error("Invalid server response.");
      }

      dispatch(addUser(user));
      if (res.data?.token) {
        localStorage.setItem("codecircle_token", res.data.token);
      }

      if (user.profileComplete) {
        navigate("/discover", {
          replace: true,
        });
      } else {
        navigate("/onboarding", {
          replace: true,
        });
      }
    } catch (err) {
      console.error("Google login error:", err);

      setError(
        err.response?.data?.message || "Google login failed. Please try again.",
      );
    } finally {
      setGoogleBusy(false);
    }
  };

  /* =====================================================
     LOAD GOOGLE SCRIPT
  ===================================================== */

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let cancelled = false;

    const renderGoogleButton = () => {
      if (
        cancelled ||
        !window.google ||
        !window.google.accounts ||
        !window.google.accounts.id ||
        !googleButtonRef.current
      ) {
        return;
      }

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 360,
        text: "continue_with",
        shape: "pill",
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();

      return () => {
        cancelled = true;
      };
    }

    const scriptId = "google-gsi-script";

    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement("script");

      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;

      script.onload = renderGoogleButton;

      document.head.appendChild(script);
    } else {
      script.addEventListener("load", renderGoogleButton);
    }

    return () => {
      cancelled = true;

      if (script) {
        script.removeEventListener("load", renderGoogleButton);
      }
    };
  }, []);

  /* =====================================================
     HANDLE INPUT CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =====================================================
     EMAIL LOGIN / SIGNUP
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!isLogin && !form.firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }

    setBusy(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";

      /*
        IMPORTANT:

        Backend expects:
        emailId

        NOT:
        email
      */

      const payload = isLogin
        ? {
            emailId: form.email.trim(),
            password: form.password,
          }
        : {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            emailId: form.email.trim(),
            password: form.password,
          };

      const res = await axios.post(`${BASE_URL}${endpoint}`, payload, {
        withCredentials: true,
      });

      const user = res.data?.data;

      if (!user) {
        throw new Error("Invalid server response.");
      }

      dispatch(addUser(user));
      if (res.data?.token) {
        localStorage.setItem("codecircle_token", res.data.token);
      }

      if (user.profileComplete) {
        navigate("/discover", {
          replace: true,
        });
      } else {
        navigate("/onboarding", {
          replace: true,
        });
      }
    } catch (err) {
      console.error("Authentication error:", err);

      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  /* =====================================================
     SWITCH LOGIN / SIGNUP
  ===================================================== */

  const switchMode = () => {
    setIsLogin((prev) => !prev);

    setError("");

    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    });
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8fafc] text-slate-900">
      {/* Background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[5%] h-72 w-72 rounded-full bg-cyan-300/30 blur-[120px]" />

        <div className="absolute bottom-[5%] right-[10%] h-80 w-80 rounded-full bg-violet-300/30 blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-5 py-8 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          {/* ============================================
              LEFT SIDE
          ============================================ */}

          <div className="hidden lg:block">
            <div className="flex items-center gap-3">
              <Logo className="h-11 w-11" />

              <span className="text-xl font-black tracking-tight text-slate-900">
                CodeCircle
              </span>
            </div>

            <div className="mt-16 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold text-cyan-700">
                <Sparkles className="h-3.5 w-3.5" />
                Developer networking, reimagined
              </div>

              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-slate-900 xl:text-6xl">
                Meet developers.
                <br />
                <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                  Build together.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-500">
                Discover developers based on skills, interests and projects.
                Match, chat, collaborate and build your next great thing
                together.
              </p>

              <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                {[
                  ["01", "Discover"],
                  ["02", "Match"],
                  ["03", "Build"],
                ].map(([number, label]) => (
                  <div
                    key={number}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <span className="text-xs font-bold text-cyan-600">
                      {number}
                    </span>

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============================================
              AUTH CARD
          ============================================ */}

          <div className="mx-auto w-full max-w-md">
            {/* Mobile Logo */}

            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <Logo className="h-10 w-10" />

              <span className="text-xl font-black text-slate-900">
                CodeCircle
              </span>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
              {/* Header */}

              <div className="mb-7">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  {isLogin ? "Welcome back" : "Create your account"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {isLogin
                    ? "Sign in to continue building your network."
                    : "Join developers who are building amazing things."}
                </p>
              </div>

              {/* ============================================
                  GOOGLE LOGIN
              ============================================ */}

              <div className="relative">
                <div
                  ref={googleButtonRef}
                  className="flex min-h-[44px] justify-center overflow-hidden rounded-full"
                />

                {googleBusy && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/90">
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
                  </div>
                )}
              </div>

              {!GOOGLE_CLIENT_ID && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
                  Google login is not configured yet.
                </div>
              )}

              {/* Divider */}

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  or continue with email
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Error */}

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                  {error}
                </div>
              )}

              {/* ============================================
                  FORM
              ============================================ */}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Signup name fields */}

                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      icon={UserRound}
                      name="firstName"
                      placeholder="First name"
                      value={form.firstName}
                      onChange={handleChange}
                      autoComplete="given-name"
                    />

                    <Input
                      name="lastName"
                      placeholder="Last name"
                      value={form.lastName}
                      onChange={handleChange}
                      autoComplete="family-name"
                    />
                  </div>
                )}

                {/* Email */}

                <Input
                  icon={Mail}
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />

                {/* Password */}

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    minLength={6}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {!isLogin && (
                  <p className="px-1 text-xs text-slate-400">
                    Password must contain at least 6 characters.
                  </p>
                )}

                {/* Submit */}

                <button
                  type="submit"
                  disabled={busy}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Sign in" : "Create account"}

                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* ============================================
                  SWITCH LOGIN / SIGNUP
              ============================================ */}

              <div className="mt-7 text-center">
                <span className="text-sm text-slate-500">
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </span>

                <button
                  type="button"
                  onClick={switchMode}
                  className="ml-2 text-sm font-bold text-cyan-600 transition hover:text-cyan-500"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </div>

              <div className="mt-7 flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-slate-400">
                <GitBranch className="h-3 w-3" />
                More developer integrations coming soon
              </div>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              By continuing, you agree to use CodeCircle responsibly and
              respectfully.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   REUSABLE INPUT COMPONENT
===================================================== */

function Input({
  icon: Icon,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 ${
          Icon ? "pl-11" : "px-4"
        } pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white`}
      />
    </div>
  );
}
