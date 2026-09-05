import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import loginBg from "../assets/login-bg.png";

const Login = () => {
  const [emailId,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [firstName,setFirstName]=useState("");
  const [lastName,setLastName]=useState("");
  const [isLoginForm,setIsLoginForm]=useState(true);
  const [error,setError]=useState("");
  const [showPassword,setShowPassword]=useState(false);

  const dispatch=useDispatch();
  const navigate=useNavigate();
  const user=useSelector(s=>s.user);

  useEffect(()=>{ if(user) navigate("/"); },[user,navigate]);

  const handleLogin=async()=>{
    setError("");
    try{
      const res=await axios.post(BASE_URL+"/auth/login",{emailId,password},{withCredentials:true});
      dispatch(addUser(res.data.user));
      navigate("/");
    }catch(err){setError(err?.response?.data||"Something went wrong");}
  };

  const handleSignUp=async()=>{
    setError("");
    try{
      const res=await axios.post(BASE_URL+"/auth/signup",{firstName,lastName,emailId,password},{withCredentials:true});
      dispatch(addUser(res.data.user));
      navigate("/profile");
    }catch(err){setError(err?.response?.data||"Something went wrong");}
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
       backgroundImage: `url(${loginBg})`,
       }}
      >
       <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"></div>
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl"/>
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl"/>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10">
        <div className="grid w-full gap-12 lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-center text-white">
            <h1 className="text-7xl font-black leading-none text-white">
               Connect.
               <br />
               Code.
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                 Collaborate.
              </span>
              </h1>
            <p className="mt-6 max-w-md text-slate-300">Build meaningful developer connections with real‑time chat and premium networking.</p>
            <div className="mt-10 space-y-4">
              {[
                    "🚀 Discover Developers",
                    "🤝 Build Meaningful Connections",
                    "💬 Real-Time Messaging",
                  ].map(t=>(
                <div key={t} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl transition-all duration-300 hover:translate-x-2 hover:border-violet-400/40 hover:bg-white/15">
                  <p className="font-semibold">{t}</p>
                </div>
              ))}
            </div>
          </div>

            <div className="mx-auto w-full max-w-md rounded-3xl border border-white/20 bg-slate-900/40 p-10 backdrop-blur-2xl shadow-[0_0_60px_rgba(168,85,247,0.35)]">
            <h2 className="text-center text-3xl font-bold text-white">{isLoginForm?"Welcome Back":"Create Account"}</h2>
            <p className="mt-2 text-center text-slate-300">{isLoginForm?"Login to continue":"Create your DevTinder profile"}</p>

            <div className="mt-8 space-y-4">
              {!isLoginForm && <>
                <input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First Name" className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white outline-none focus:border-violet-500"/>
                <input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last Name" className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white outline-none focus:border-violet-500"/>
              </>}
              <input value={emailId} onChange={e=>setEmail(e.target.value)} placeholder="Email Address" className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white outline-none focus:border-violet-500"/>
              <div className="relative">
                <input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 pr-12 text-white outline-none focus:border-violet-500"/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-4 top-3 text-slate-300">{showPassword?"🙈":"👁️"}</button>
              </div>
              {error && <p className="text-center text-red-400">{error}</p>}
              <button onClick={isLoginForm?handleLogin:handleSignUp} className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-3 font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_45px_rgba(168,85,247,0.9)]">
                {isLoginForm?"Login":"Create Account"}
              </button>
              <p onClick={()=>setIsLoginForm(!isLoginForm)} className="cursor-pointer text-center text-sm text-slate-300 hover:text-white">
                {isLoginForm?"New user? Create an account":"Already have an account? Login"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
