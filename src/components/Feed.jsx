import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Loader2, RefreshCw, Sparkles, Users } from "lucide-react";

import UserCard from "./UserCard";
import { BASE_URL } from "../utils/constants";
import { addFeed } from "../utils/feedSlice";

export default function Feed() {
  const dispatch = useDispatch();
  const feed = useSelector((state) => state.feed);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchFeed = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await axios.get(
        `${BASE_URL}/user/feed?page=1&limit=30`,
        {
          withCredentials: true,
        },
      );

      dispatch(addFeed(response.data?.data || []));
    } catch (err) {
      console.error("Feed loading error:", err);

      setError(err.response?.data?.message || "Unable to load developers.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const developers = Array.isArray(feed) ? feed : [];

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-0 md:pt-0">
        <FeedHeader onRefresh={() => fetchFeed(true)} refreshing={false} />

        <div className="flex min-h-[65vh] items-center justify-center">
          <div className="text-center">
            <Loader2 size={30} className="mx-auto animate-spin text-teal" />

            <p className="mt-4 text-sm text-muted">
              Finding developers for you...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-0 md:pt-0">
        <FeedHeader onRefresh={() => fetchFeed(true)} refreshing={refreshing} />

        <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-ink">Something went wrong</p>

          <p className="mt-2 text-sm text-muted">{error}</p>

          <button
            type="button"
            onClick={() => fetchFeed(true)}
            disabled={refreshing}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-90 disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <RefreshCw size={15} />
            )}
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (developers.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-0 md:pt-0">
        <FeedHeader onRefresh={() => fetchFeed(true)} refreshing={refreshing} />

        <div className="mt-8 flex min-h-[60vh] items-center justify-center rounded-3xl border border-border bg-panel px-6 shadow-soft">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10">
              <Users size={27} className="text-teal" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-ink">
              You've reached the end
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted">
              There aren't any more developers to show right now.
            </p>

            <button
              type="button"
              onClick={() => fetchFeed(true)}
              disabled={refreshing}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-ink transition hover:bg-border disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-0 md:pt-0">
      <FeedHeader onRefresh={() => fetchFeed(true)} refreshing={refreshing} />

      <div className="mt-8 flex justify-center">
        <div className="relative w-full max-w-[420px]">
          {/* BACK CARD 3 */}
          {developers[2] && (
            <div
              key={developers[2]._id}
              className="pointer-events-none absolute inset-0 z-10 translate-y-6 scale-[0.94] opacity-30"
            >
              <UserCard user={developers[2]} showActions={false} />
            </div>
          )}

          {/* BACK CARD 2 */}
          {developers[1] && (
            <div
              key={developers[1]._id}
              className="pointer-events-none absolute inset-0 z-20 translate-y-3 scale-[0.97] opacity-60"
            >
              <UserCard user={developers[1]} showActions={false} />
            </div>
          )}

          {/* MAIN CARD */}
          {developers[0] && (
            <div key={developers[0]._id} className="relative z-30">
              <UserCard user={developers[0]} showActions={true} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 pb-4 text-center">
        <Sparkles size={13} className="shrink-0 text-teal" />

        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          Find developers. Connect. Build together.
        </p>
      </div>
    </div>
  );
}

function FeedHeader({ onRefresh, refreshing }) {
  return (
    <header className="flex items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[10px] font-semibold tracking-[0.25em] text-teal">
          DEVELOPER DISCOVERY
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
          Discover
        </h1>

        <p className="mt-2 text-sm text-muted">
          Meet developers who could become your next teammate.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        aria-label="Refresh feed"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-panel text-muted shadow-soft transition hover:bg-surface hover:text-ink disabled:opacity-50"
      >
        <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
      </button>
    </header>
  );
}
