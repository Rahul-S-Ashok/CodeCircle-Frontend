import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Briefcase,
  Code2,
  Edit3,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";

export default function Profile() {
  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(user);
  const [busy, setBusy] = useState(!user);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      setBusy(true);
      setError("");

      const res = await axios.get(`${BASE_URL}/profile/view`, {
        withCredentials: true,
      });

      const data = res.data?.data;

      if (!data) {
        throw new Error("Invalid profile response.");
      }

      setProfile(data);
      dispatch(addUser(data));
    } catch (err) {
      console.error("Failed to load profile:", err);

      setError(err.response?.data?.message || "Unable to load your profile.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfile(user);
      setBusy(false);
      return;
    }

    fetchProfile();
  }, [user]);

  if (busy) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
          Loading your profile...
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center">
        <div className="w-full rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-sm text-rose-600">{error}</p>

          <button
            type="button"
            onClick={fetchProfile}
            className="mt-4 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const name =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    "Developer";

  const skills = Array.isArray(profile.skills) ? profile.skills : [];

  const avatar =
    profile.photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&background=06b6d4&color=ffffff&size=256`;

  return (
    <div className="mx-auto min-h-full max-w-5xl">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
            YOUR PROFILE
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Profile
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate("/profile/edit")}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 text-sm font-bold text-white transition hover:bg-cyan-600"
        >
          <Edit3 className="h-4 w-4" />
          Edit profile
        </button>
      </div>

      {/* Profile Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-100 blur-[100px]" />

        <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-blue-100 blur-[100px]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative shrink-0 self-center sm:self-start">
            <img
              src={avatar}
              alt={name}
              className="h-32 w-32 rounded-[2rem] border border-slate-200 object-cover sm:h-36 sm:w-36"
            />

            {profile.openToCollaborate && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">
                Open to collaborate
              </div>
            )}
          </div>

          {/* Main Info */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                {/* NAME */}
                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                  {name}

                  {profile.age && (
                    <span className="ml-2 text-xl font-normal text-slate-500">
                      {profile.age}
                    </span>
                  )}
                </h2>

                {profile.headline && (
                  <p className="mt-2 text-base text-slate-600">
                    {profile.headline}
                  </p>
                )}
              </div>

              {profile.isPremium && (
                <span className="mx-auto flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600 sm:mx-0">
                  <Sparkles className="h-3.5 w-3.5" />

                  {profile.membershipType || "Premium"}
                </span>
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

            {/* Social Links */}
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              {profile.githubUsername && (
                <SocialButton
                  icon={Code2}
                  label="GitHub"
                  href={`https://github.com/${profile.githubUsername}`}
                />
              )}

              {profile.linkedinUrl && (
                <SocialButton
                  icon={LinkIcon}
                  label="LinkedIn"
                  href={profile.linkedinUrl}
                />
              )}

              {profile.twitterUrl && (
                <SocialButton
                  icon={LinkIcon}
                  label="Twitter"
                  href={profile.twitterUrl}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Profile Completion */}
      {!profile.profileComplete && (
        <div className="mt-5 flex flex-col gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-amber-700">Complete your profile</p>

            <p className="mt-1 text-sm text-slate-600">
              A complete profile helps you find better matches.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/profile/edit")}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 px-4 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
          >
            Complete now
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        {/* About */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionTitle title="About" />

          {profile.about ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
              {profile.about}
            </p>
          ) : (
            <EmptyText text="Tell developers a little about yourself." />
          )}
        </section>

        {/* Collaboration */}
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

              <p className="mt-1 text-xs text-slate-500">
                {profile.openToCollaborate
                  ? "Available for projects, hackathons and ideas."
                  : "You can change this from Edit Profile."}
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
              <div
                key={skill}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700"
              >
                {skill}

                {profile.skillLevels?.[skill] && (
                  <span className="ml-2 text-xs text-cyan-600">
                    {profile.skillLevels[skill]}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyText text="Add your technical skills to improve your matches." />
        )}
      </section>

      {/* GitHub Stats */}
      {profile.githubStats && (
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionTitle title="GitHub" />

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat label="Repositories" value={profile.githubStats.repos || 0} />

            <Stat
              label="Contributions"
              value={profile.githubStats.contributions || 0}
            />

            <Stat
              label="Achievements"
              value={profile.githubStats.achievements || 0}
            />
          </div>
        </section>
      )}

      {/* Bottom Edit */}
      <div className="mt-6 flex justify-center pb-8">
        <button
          type="button"
          onClick={() => navigate("/profile/edit")}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-cyan-600"
        >
          <Edit3 className="h-4 w-4" />
          Keep your profile updated
        </button>
      </div>
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
    <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">
      {title}
    </h3>
  );
}

function EmptyText({ text }) {
  return <p className="mt-4 text-sm leading-6 text-slate-500">{text}</p>;
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xl font-black text-slate-900">{value}</p>

      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  );
}
