import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  X,
  UserRound,
  MapPin,
  Loader2,
  Sparkles,
} from "lucide-react";

import { BASE_URL } from "../utils/constants";

export default function Notifications() {
  const [requests, setRequests] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setBusy(true);
    setError("");

    try {
      const res = await axios.get(`${BASE_URL}/user/requests/received`, {
        withCredentials: true,
      });

      setRequests(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);

      setError(
        err.response?.data?.message || "Unable to load your notifications.",
      );
    } finally {
      setBusy(false);
    }
  };

  const reviewRequest = async (status, requestId) => {
    if (!requestId || processingId) return;

    setProcessingId(requestId);
    setError("");

    try {
      await axios.post(
        `${BASE_URL}/request/review/${status}/${requestId}`,
        {},
        {
          withCredentials: true,
        },
      );

      setRequests((prev) =>
        prev.filter((request) => request.requestId !== requestId),
      );
    } catch (err) {
      console.error("Failed to review request:", err);

      setError(
        err.response?.data?.message || "Unable to process this request.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="mx-auto min-h-full max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/10 bg-violet-400/5">
            <Bell className="h-5 w-5 text-violet-300" />

            {requests.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#08090d] bg-cyan-400 px-1 text-[9px] font-black text-slate-950">
                {requests.length > 9 ? "9+" : requests.length}
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              See who's interested in connecting with you.
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
          <span>{error}</span>

          <button
            onClick={fetchRequests}
            className="shrink-0 font-semibold underline underline-offset-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {busy ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
            Loading notifications...
          </div>
        </div>
      ) : requests.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <RequestCard
              key={request.requestId}
              request={request}
              processing={processingId === request.requestId}
              onAccept={() => reviewRequest("accepted", request.requestId)}
              onReject={() => reviewRequest("rejected", request.requestId)}
              onProfile={() => {
                if (request.fromUser?._id) {
                  navigate(`/profile/${request.fromUser._id}`);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({ request, processing, onAccept, onReject, onProfile }) {
  const person = request.fromUser || {};

  const name =
    [person.firstName, person.lastName].filter(Boolean).join(" ") ||
    "Developer";

  const avatar =
    person.photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&background=111827&color=67e8f9`;

  const matchScore =
    typeof request.matchScore === "number" ? request.matchScore : null;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/15 hover:bg-white/[0.045]">
      {/* Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-500/5 blur-3xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        {/* Avatar */}
        <button
          type="button"
          onClick={onProfile}
          className="shrink-0 self-start"
        >
          <img
            src={avatar}
            alt=""
            className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/10 transition group-hover:ring-cyan-400/20"
          />
        </button>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onProfile}
              className="truncate text-left font-bold text-white hover:text-cyan-300"
            >
              {name}
            </button>

            {person.age && (
              <span className="text-xs text-slate-600">{person.age}</span>
            )}

            {matchScore !== null && (
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                {matchScore}% match
              </span>
            )}
          </div>

          {person.headline && (
            <p className="mt-1 line-clamp-1 text-sm text-slate-400">
              {person.headline}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {person.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {person.location}
              </span>
            )}

            {person.experienceYears !== undefined && (
              <span className="flex items-center gap-1">
                <UserRound className="h-3 w-3" />
                {person.experienceYears} yrs
              </span>
            )}
          </div>

          {request.whyYouMatch && (
            <div className="mt-3 flex gap-2 text-xs leading-5 text-slate-500">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" />
              <span>{request.whyYouMatch}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2 sm:flex-col md:flex-row">
          <button
            type="button"
            onClick={onReject}
            disabled={processing}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-slate-400 transition hover:border-red-400/20 hover:bg-red-400/5 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            <span className="hidden md:inline">Decline</span>
          </button>

          <button
            type="button"
            onClick={onAccept}
            disabled={processing}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 text-sm font-black text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}

            <span className="hidden md:inline">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400/10 to-violet-500/10">
        <Bell className="h-7 w-7 text-cyan-300" />
      </div>

      <h2 className="mt-5 text-lg font-bold text-white">
        You're all caught up
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        When another developer sends you an interest request, it'll appear here.
      </p>
    </div>
  );
}
