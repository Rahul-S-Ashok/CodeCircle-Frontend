import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Briefcase,
  Code2,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  MapPin,
  MessageCircle,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import { BASE_URL } from "../utils/constants";

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setBusy(true);
    setError("");

    try {
      const res = await axios.get(`${BASE_URL}/user/${id}`, {
        withCredentials: true,
      });

      const data = res.data?.data;

      if (!data) {
        throw new Error("Invalid profile response.");
      }

      setProfile(data);
    } catch (err) {
      console.error("Failed to load public profile:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load this developer's profile.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (busy) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
          Loading profile...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <UserRound className="h-6 w-6 text-red-500" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            Profile unavailable
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "This profile could not be found."}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mx-auto mt-5 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </div>
    );
  }

  const name =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    "Developer";

  const avatar =
    profile.photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&background=111827&color=67e8f9&size=256`;

  const skills = Array.isArray(profile.skills) ? profile.skills : [];

  const projects = Array.isArray(profile.projects) ? profile.projects : [];

  return (
    <div className="mx-auto min-h-full max-w-5xl">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-[100px]" />

        <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-[100px]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Photo */}
          <div className="relative shrink-0 self-center sm:self-start">
            <img
              src={avatar}
              alt={name}
              className="h-32 w-32 rounded-[2rem] object-cover ring-1 ring-slate-200 sm:h-36 sm:w-36"
            />

            {profile.openToCollaborate && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">
                Open to collaborate
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                {/* FIXED NAME COLOR */}
                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                  {name}

                  {profile.age && (
                    <span className="ml-2 text-xl font-normal text-slate-500">
                      {profile.age}
                    </span>
                  )}
                </h1>

                {profile.headline && (
                  <p className="mt-2 text-base text-slate-500">
                    {profile.headline}
                  </p>
                )}
              </div>

              {profile.matchScore !== undefined &&
                profile.matchScore !== null && (
                  <div className="mx-auto rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-center sm:mx-0">
                    <div className="text-xl font-black text-cyan-600">
                      {profile.matchScore}%
                    </div>

                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Compatibility
                    </div>
                  </div>
                )}
            </div>

            {/* Metadata */}
            <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
              {profile.location && (
                <Meta icon={MapPin} text={profile.location} />
              )}

              {typeof profile.experienceYears === "number" && (
                <Meta
                  icon={Briefcase}
                  text={`${profile.experienceYears} years experience`}
                />
              )}

              {profile.gender && (
                <Meta icon={UserRound} text={profile.gender} />
              )}
            </div>

            {/* Socials */}
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              {profile.githubUsername && (
                <SocialButton
                  icon={Code2}
                  label="GitHub"
                  href={`https://github.com/${profile.githubUsername}`}
                />
              )}

              {profile.linkedin && (
                <SocialButton
                  icon={LinkIcon}
                  label="LinkedIn"
                  href={profile.linkedin}
                />
              )}

              {profile.twitter && (
                <SocialButton
                  icon={LinkIcon}
                  label="Twitter"
                  href={profile.twitter}
                />
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="relative mt-7 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(`/chat/${profile._id}`)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 text-sm font-black text-slate-950 transition hover:scale-[1.01]"
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </button>

          <button
            type="button"
            onClick={() => navigate("/discover")}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-600"
          >
            <Users className="h-4 w-4" />
            Discover more
          </button>
        </div>
      </section>

      {/* Why match */}
      {profile.whyYouMatch && (
        <section className="mt-5 rounded-3xl border border-violet-200 bg-violet-50 p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">
              <Sparkles className="h-5 w-5 text-violet-500" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-violet-700">
                Why you might connect
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {profile.whyYouMatch}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* About + collaboration */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionTitle title="About" />

          {profile.about ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
              {profile.about}
            </p>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No bio available.</p>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionTitle title="Collaboration" />

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50">
              <Users className="h-5 w-5 text-cyan-600" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                {profile.openToCollaborate
                  ? "Open to collaboration"
                  : "Not currently looking"}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {profile.openToCollaborate
                  ? "Available for projects, hackathons and ideas."
                  : "May not be actively looking for projects."}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Skills */}
      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionTitle title="Skills" />

        {skills.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700"
              >
                {skill}

                {profile.skillLevels?.[skill] && (
                  <span className="ml-2 text-xs text-cyan-600">
                    {profile.skillLevels[skill]}
                  </span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No skills listed.</p>
        )}
      </section>

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mt-5 pb-8">
          <SectionTitle title="Projects" />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProjectCard({ project }) {
  const tags = Array.isArray(project.tags) ? project.tags : [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md">
      <h3 className="font-bold text-slate-900">
        {project.title || "Untitled project"}
      </h3>

      {project.description && (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
          {project.description}
        </p>
      )}

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {project.lookingFor && (
        <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-600">
            Looking for
          </p>

          <p className="mt-1 text-xs text-slate-600">{project.lookingFor}</p>
        </div>
      )}
    </div>
  );
}

function Meta({ icon: Icon, text }) {
  return (
    <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
      <Icon className="h-3.5 w-3.5 text-slate-500" />
      {text}
    </span>
  );
}

function SocialButton({ icon: Icon, label, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-600"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      <ExternalLink className="h-3 w-3 opacity-50" />
    </a>
  );
}

function SectionTitle({ title }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">
      {title}
    </h2>
  );
}
