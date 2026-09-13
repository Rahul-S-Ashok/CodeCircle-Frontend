import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Sparkles,
  MapPin,
  Briefcase,
  Users,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function AISearch() {
  const [query, setQuery] = useState(
    "Find me a Python developer interested in AI and hackathons",
  );

  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const run = async (e) => {
    e.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Tell AI what kind of developer you're looking for.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const res = await axios.post(
        `${BASE_URL}/ai/search`,
        { query: trimmedQuery },
        { withCredentials: true },
      );

      setResults(res.data?.data || []);
    } catch (err) {
      console.error("AI search error:", err);

      setError(
        err.response?.data?.message ||
          "Something went wrong while searching. Please try again.",
      );

      setResults([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-full">
      <section className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-violet-100 ring-1 ring-cyan-200">
              <Sparkles className="h-5 w-5 text-cyan-600" />
            </div>

            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-700">
              AI Powered
            </span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-ink md:text-4xl">
            Find your next{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent">
              developer
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted md:text-base">
            Describe the kind of developer you're looking for in normal
            language. CodeCircle AI will find the most relevant people for you.
          </p>
        </div>

        {/* Search box */}
        <form
          onSubmit={run}
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-card"
        >
          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-violet-200/40 blur-3xl" />

          <div className="relative flex flex-col gap-2 md:flex-row">
            <div className="flex min-h-[58px] flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Find a React developer for my startup..."
                maxLength={500}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex min-h-[58px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 text-sm font-bold text-white shadow-sm transition hover:scale-[1.01] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Search with AI
                </>
              )}
            </button>
          </div>
        </form>

        {/* Example searches */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="mr-1 py-2 text-xs text-slate-500">Try:</span>

          {[
            "React developer for a startup",
            "Python developer interested in AI",
            "Backend developer for a hackathon",
            "MERN developer who loves open source",
          ].map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setQuery(example)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
            >
              {example}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-10">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  AI Results
                </p>

                <h2 className="mt-1 text-xl font-bold text-ink">
                  Developers you might want to meet
                </h2>
              </div>

              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 shadow-sm">
                {results.length} found
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {results.map((person) => (
                <DeveloperResultCard
                  key={person._id}
                  person={person}
                  onProfile={() => navigate(`/profile/${person._id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!busy && !error && results.length === 0 && (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-soft">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-100 to-violet-100">
              <Users className="h-7 w-7 text-cyan-600" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-ink">
              Describe your ideal developer
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              AI will understand your requirements and rank developers based on
              their skills, interests, experience and collaboration preferences.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function DeveloperResultCard({ person, onProfile }) {
  const skills = Array.isArray(person.skills) ? person.skills : [];

  const matchScore =
    typeof person.matchScore === "number" ? person.matchScore : null;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-card">
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-100/60 blur-3xl transition group-hover:bg-cyan-100" />

      <div className="relative">
        {/* Profile */}
        <div className="flex items-start gap-4">
          <img
            src={
              person.photoUrl ||
              "https://ui-avatars.com/api/?name=Developer&background=e2e8f0&color=172033"
            }
            alt=""
            className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-slate-200"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-bold text-ink">
                  {[person.firstName, person.lastName]
                    .filter(Boolean)
                    .join(" ") || "Developer"}

                  {person.age ? (
                    <span className="ml-2 font-normal text-slate-500">
                      {person.age}
                    </span>
                  ) : null}
                </h3>

                {person.headline && (
                  <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                    {person.headline}
                  </p>
                )}
              </div>

              {matchScore !== null && (
                <div className="shrink-0 rounded-xl border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 text-right">
                  <div className="text-sm font-black text-cyan-700">
                    {matchScore}%
                  </div>

                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    match
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500">
          {person.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {person.location}
            </span>
          )}

          {typeof person.experienceYears === "number" && (
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              {person.experienceYears} yrs experience
            </span>
          )}

          {person.openToCollaborate && (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <Users className="h-3.5 w-3.5" />
              Open to collaborate
            </span>
          )}
        </div>

        {/* About */}
        {person.about && (
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
            {person.about}
          </p>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
              >
                {skill}
              </span>
            ))}

            {skills.length > 6 && (
              <span className="rounded-lg px-2 py-1 text-xs text-slate-500">
                +{skills.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Why match */}
        {person.whyYouMatch && (
          <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              Why this match?
            </div>

            <p className="text-xs leading-5 text-slate-600">
              {person.whyYouMatch}
            </p>
          </div>
        )}

        {/* Button */}
        <button
          onClick={onProfile}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
        >
          View profile
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
