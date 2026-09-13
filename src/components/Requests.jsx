import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Loader2,
  MapPin,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { BASE_URL } from "../utils/constants";

export default function Requests() {
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
      console.error("Failed to load requests:", err);

      setError(
        err.response?.data?.message || "Unable to load connection requests.",
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
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-cyan-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50">
            <UserRound className="h-5 w-5 text-cyan-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Connection Requests
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Developers who want to connect with you.
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
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
            <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
            Loading requests...
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
              onProfile={() => navigate(`/profile/${request._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({ request, processing, onAccept, onReject, onProfile }) {
  /*
    IMPORTANT:

    Backend sends user data directly inside request.

    request = {
      _id,
      firstName,
      lastName,
      photoUrl,
      headline,
      skills,
      requestId,
      matchScore,
      whyYouMatch
    }
  */

  const person = request;

  const name =
    [person.firstName, person.lastName].filter(Boolean).join(" ") ||
    "Developer";

  const avatar =
    person.photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&background=0ea5e9&color=ffffff`;

  const skills = Array.isArray(person.skills) ? person.skills : [];

  const matchScore =
    typeof person.matchScore === "number" ? person.matchScore : null;

  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-card">
      <div className="flex flex-col gap-5 sm:flex-row">
        {/* Avatar */}
        <button
          type="button"
          onClick={onProfile}
          className="shrink-0 self-start"
        >
          <img
            src={avatar}
            alt={name}
            className="h-20 w-20 rounded-2xl border border-slate-200 object-cover transition group-hover:border-cyan-300"
          />
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            {/* User details */}
            <div className="min-w-0">
              <button
                type="button"
                onClick={onProfile}
                className="text-left text-lg font-bold text-ink transition hover:text-cyan-600"
              >
                {name}
              </button>

              {person.age && (
                <span className="ml-2 text-sm text-slate-500">
                  {person.age}
                </span>
              )}

              <p className="mt-1 text-sm text-slate-500">
                {person.headline || "Software Developer"}
              </p>
            </div>

            {/* Match */}
            {matchScore !== null && (
              <div className="shrink-0 rounded-2xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-center">
                <div className="text-lg font-bold text-cyan-600">
                  {matchScore}%
                </div>

                <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Match
                </div>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            {person.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {person.location}
              </span>
            )}

            {typeof person.experienceYears === "number" && (
              <span className="flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" />
                {person.experienceYears} yrs experience
              </span>
            )}

            {person.openToCollaborate && (
              <span className="font-medium text-emerald-600">
                Open to collaborate
              </span>
            )}
          </div>

          {/* Why match */}
          {person.whyYouMatch && (
            <div className="mt-4 flex gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 p-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />

              <div>
                <p className="text-xs font-bold text-cyan-700">
                  Why you might connect
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {person.whyYouMatch}
                </p>
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.slice(0, 7).map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex gap-3">
            {/* Decline */}
            <button
              type="button"
              onClick={onReject}
              disabled={processing}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Decline
            </button>

            {/* Accept */}
            <button
              type="button"
              onClick={onAccept}
              disabled={processing}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 text-sm font-bold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-50">
        <Check className="h-7 w-7 text-cyan-600" />
      </div>

      <h2 className="mt-5 text-lg font-bold text-ink">No pending requests</h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        You're all caught up. New connection requests will appear here.
      </p>
    </div>
  );
}
