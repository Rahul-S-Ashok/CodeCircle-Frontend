import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

import { BASE_URL } from "../utils/constants";
import { addUser, removeUser } from "../utils/userSlice";

export default function Body() {
  const dispatch = useDispatch();
  const location = useLocation();

  const user = useSelector((store) => store.user);

  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    if (user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });

        if (cancelled) return;

        const loggedInUser = res.data?.data;

        if (loggedInUser) {
          dispatch(addUser(loggedInUser));
        } else {
          dispatch(removeUser());
        }
      } catch (error) {
        if (cancelled) return;

        dispatch(removeUser());
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [dispatch, user]);

  // Wait until authentication check is finished
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-cyan-500" />

          <p className="text-sm text-slate-500">Loading CodeCircle...</p>
        </div>
      </div>
    );
  }

  // User is NOT logged in
  if (!user) {
    if (location.pathname !== "/" && location.pathname !== "/login") {
      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  }

  // Logged-in user trying to access login
  if (location.pathname === "/login" || location.pathname === "/") {
    return (
      <Navigate
        to={user.profileComplete ? "/discover" : "/onboarding"}
        replace
      />
    );
  }

  // User hasn't completed onboarding
  if (!user.profileComplete && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // User already completed onboarding
  if (user.profileComplete && location.pathname === "/onboarding") {
    return <Navigate to="/discover" replace />;
  }

  return <Outlet />;
}
