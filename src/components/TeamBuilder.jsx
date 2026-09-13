import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Sparkles, Users, ArrowRight, Loader2, MapPin } from "lucide-react";

import { BASE_URL } from "../utils/constants";

export default function TeamBuilder() {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState(
    "I want to build an AI-powered resume analyzer using React, Node.js and Python. I need an ML engineer and a UI/UX designer.",
  );

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildTeam = async (event) => {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setError("Tell us what you want to build.");
      return;
    }

    if (trimmedPrompt.length > 500) {
      setError("Keep your project description under 500 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post(
        `${BASE_URL}/ai/team`,
        {
          prompt: trimmedPrompt,
        },
        {
          withCredentials: true,
        },
      );

      setResult(response.data?.data || null);
    } catch (err) {
      console.error("Team builder error:", err);

      setError(
        err.response?.data?.message || "Unable to build your team right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  const team = result?.team || [];
  const roles = result?.roles || [];

  return (
    <div className="mx-auto max-w-5xl pb-10">
      {/* HEADER */}

      <header className="max-w-2xl">
        <div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.25em] text-cyan-600">
          <Sparkles size={13} />
          AI TEAM BUILDER
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Build your dream team.
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Describe what you're building. CodeCircle will identify the roles you
          need and find developers who could fit your project.
        </p>
      </header>

      {/* INPUT */}

      <form
        onSubmit={buildTeam}
        className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
            <Sparkles size={18} className="text-cyan-600" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              Describe your project
            </p>

            <p className="text-[11px] text-slate-500">
              Tell AI what you're building and who you need.
            </p>
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          maxLength={500}
          rows={5}
          placeholder="Example: I want to build a collaborative AI coding platform..."
          className="mt-5 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />

        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-[10px] text-slate-400">
            {prompt.length}/500
          </span>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Finding team...
              </>
            ) : (
              <>
                Build my team
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* ERROR */}

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* RESULTS */}

      {result && (
        <section className="mt-10">
          {/* ROLES */}

          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-cyan-600">
              RECOMMENDED ROLES
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* DEVELOPERS HEADER */}

          <div className="mt-8 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Developers for your team
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Ranked using skills, project relevance and collaboration
                preference.
              </p>
            </div>

            <span className="font-mono text-[10px] text-slate-400">
              {team.length} FOUND
            </span>
          </div>

          {/* NO RESULTS */}

          {team.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Users size={25} className="text-slate-400" />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-900">
                No strong matches yet
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Try describing your project with more technologies or roles.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {team.map((developer) => (
                <DeveloperCard
                  key={developer._id}
                  developer={developer}
                  onProfile={() => navigate(`/profile/${developer._id}`)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* HOW IT WORKS */}

      {!result && !loading && (
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <InfoCard
            number="01"
            title="Describe"
            text="Tell CodeCircle what you're building."
          />

          <InfoCard
            number="02"
            title="Analyze"
            text="AI identifies the roles and skills your project needs."
          />

          <InfoCard
            number="03"
            title="Connect"
            text="Discover developers who could fit your team."
          />
        </div>
      )}
    </div>
  );
}

/* =====================================================
   DEVELOPER CARD
===================================================== */

function DeveloperCard({ developer, onProfile }) {
  const name =
    `${developer.firstName || ""} ${developer.lastName || ""}`.trim() ||
    "Developer";

  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md">
      <div className="flex gap-4">
        <button type="button" onClick={onProfile} className="shrink-0">
          <img
            src={
              developer.photoUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                name,
              )}&background=e0f2fe&color=0891b2&size=150`
            }
            alt={name}
            className="h-14 w-14 rounded-2xl border border-slate-200 object-cover"
          />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <button
                type="button"
                onClick={onProfile}
                className="block max-w-full truncate text-left text-base font-bold text-slate-900 transition hover:text-cyan-600"
              >
                {name}
              </button>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {developer.headline || "Software Developer"}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="font-mono text-sm font-bold text-cyan-600">
                {developer.matchScore ?? 0}%
              </p>

              <p className="text-[8px] uppercase tracking-wider text-slate-400">
                match
              </p>
            </div>
          </div>

          {developer.location && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
              <MapPin size={11} />
              {developer.location}
            </div>
          )}
        </div>
      </div>

      {/* WHY MATCH */}

      {developer.whyYouMatch && (
        <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-3">
          <div className="flex gap-2">
            <Sparkles size={13} className="mt-0.5 shrink-0 text-cyan-600" />

            <p className="text-xs leading-5 text-slate-600">
              {developer.whyYouMatch}
            </p>
          </div>
        </div>
      )}

      {/* ROLES */}

      {developer.matchedRoles?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {developer.matchedRoles.map((role) => (
            <span
              key={role}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600"
            >
              {role}
            </span>
          ))}
        </div>
      )}

      {/* SKILLS */}

      {developer.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {developer.skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-mono text-[9px] text-slate-500"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* ACTION */}

      <button
        type="button"
        onClick={onProfile}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
      >
        View profile
        <ArrowRight size={13} />
      </button>
    </article>
  );
}

/* =====================================================
   INFO CARD
===================================================== */

function InfoCard({ number, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="font-mono text-[10px] font-semibold text-cyan-600">
        {number}
      </p>

      <h3 className="mt-3 text-sm font-bold text-slate-900">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}
