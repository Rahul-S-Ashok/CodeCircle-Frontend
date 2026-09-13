import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Search,
  MapPin,
  ArrowRight,
  Loader2,
  Users,
} from "lucide-react";

import { BASE_URL } from "../utils/constants";

export default function Messages() {
  const [connections, setConnections] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      setFiltered(connections);
      return;
    }

    const filteredConnections = connections.filter((person) => {
      const name = [person.firstName, person.lastName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const headline = (person.headline || "").toLowerCase();
      const location = (person.location || "").toLowerCase();

      return (
        name.includes(value) ||
        headline.includes(value) ||
        location.includes(value)
      );
    });

    setFiltered(filteredConnections);
  }, [search, connections]);

  const fetchConnections = async () => {
    setBusy(true);
    setError("");

    try {
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
      });

      const data = res.data?.data || [];

      setConnections(data);
      setFiltered(data);
    } catch (err) {
      console.error("Failed to load connections:", err);

      setError(
        err.response?.data?.message || "Unable to load your connections.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto min-h-full max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50">
            <MessageCircle className="h-5 w-5 text-cyan-600" />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Messages
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Chat with developers you've connected with.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
        <Search className="h-4 w-4 text-slate-400" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}

          <button
            type="button"
            onClick={fetchConnections}
            className="ml-3 font-semibold underline underline-offset-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {busy ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
            Loading conversations...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasSearch={Boolean(search.trim())} />
      ) : (
        <div className="space-y-3">
          {filtered.map((person) => (
            <ConversationCard
              key={person._id}
              person={person}
              onClick={() => navigate(`/chat/${person._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ConversationCard({ person, onClick }) {
  const name =
    [person.firstName, person.lastName].filter(Boolean).join(" ") ||
    "Developer";

  const avatar =
    person.photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&background=e2e8f0&color=172033`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={avatar}
          alt=""
          className="h-14 w-14 rounded-2xl object-cover ring-1 ring-slate-200"
        />

        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-sm font-bold text-slate-900">{name}</h2>

          {person.age && (
            <span className="shrink-0 text-xs text-slate-400">
              {person.age}
            </span>
          )}
        </div>

        {person.headline && (
          <p className="mt-1 truncate text-sm text-slate-500">
            {person.headline}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
          {person.location && (
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />

              <span className="truncate">{person.location}</span>
            </span>
          )}

          {person.openToCollaborate && (
            <span className="hidden text-emerald-600 sm:block">
              Open to collaborate
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition group-hover:border-cyan-200 group-hover:bg-cyan-50 group-hover:text-cyan-600">
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

function EmptyState({ hasSearch }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-50 to-violet-50">
        {hasSearch ? (
          <Search className="h-7 w-7 text-slate-400" />
        ) : (
          <Users className="h-7 w-7 text-cyan-600" />
        )}
      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-900">
        {hasSearch ? "No conversations found" : "No conversations yet"}
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {hasSearch
          ? "Try searching for another developer."
          : "Start discovering developers and connect with someone you'd like to build with."}
      </p>
    </div>
  );
}
