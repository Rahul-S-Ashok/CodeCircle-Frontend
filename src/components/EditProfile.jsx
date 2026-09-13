import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Code2,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Save,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";

const GENDERS = ["male", "female", "other"];

export default function EditProfile() {
  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    location: "",
    age: "",
    gender: "",
    about: "",
    skills: "",
    experienceYears: "",
    openToCollaborate: true,
    githubUsername: "",
    linkedin: "",
    twitter: "",
  });

  const [skillLevels, setSkillLevels] = useState({});

  const [loading, setLoading] = useState(!user);
  const [saving, setSaving] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      loadUserIntoForm(user);
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [user]);

  const loadUserIntoForm = (data) => {
    setForm({
      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      headline: data?.headline || "",
      location: data?.location || "",
      age: data?.age ?? "",
      gender: data?.gender || "",
      about: data?.about || "",
      skills: Array.isArray(data?.skills) ? data.skills.join(", ") : "",
      experienceYears: data?.experienceYears ?? "",
      openToCollaborate: data?.openToCollaborate ?? true,
      githubUsername: data?.githubUsername || "",
      linkedin: data?.linkedin || "",
      twitter: data?.twitter || "",
    });

    setSkillLevels(data?.skillLevels ? { ...data.skillLevels } : {});
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${BASE_URL}/profile/view`, {
        withCredentials: true,
      });

      const data = res.data?.data;

      if (!data) {
        throw new Error("Invalid profile response.");
      }

      dispatch(addUser(data));
      loadUserIntoForm(data);
    } catch (err) {
      console.error("Failed to load profile:", err);

      setError(err.response?.data?.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  const parsedSkills = form.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .filter(
      (skill, index, arr) =>
        arr.findIndex((item) => item.toLowerCase() === skill.toLowerCase()) ===
        index,
    )
    .slice(0, 30);

  const updateSkillLevel = (skill, level) => {
    setSkillLevels((prev) => ({
      ...prev,
      [skill]: level,
    }));
  };

  const generateBio = async () => {
    if (generatingBio) return;

    if (!form.firstName.trim()) {
      setError("Enter your first name before generating a bio.");
      return;
    }

    if (parsedSkills.length === 0) {
      setError("Add at least one skill before generating a bio.");
      return;
    }

    setGeneratingBio(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        `${BASE_URL}/ai/bio`,
        {
          firstName: form.firstName.trim(),
          headline: form.headline.trim(),
          location: form.location.trim(),
          skills: parsedSkills,
          experienceYears: Number(form.experienceYears) || 0,
          openToCollaborate: form.openToCollaborate,
        },
        {
          withCredentials: true,
        },
      );

      const bio = res.data?.data?.bio;

      if (!bio) {
        throw new Error("AI did not return a bio.");
      }

      setForm((prev) => ({
        ...prev,
        about: bio,
      }));

      setSuccess("AI generated your bio.");
    } catch (err) {
      console.error("AI bio error:", err);

      setError(err.response?.data?.message || "Unable to generate your bio.");
    } finally {
      setGeneratingBio(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!form.firstName.trim()) {
        throw new Error("First name is required.");
      }

      if (!form.lastName.trim()) {
        throw new Error("Last name is required.");
      }

      const age = Number(form.age);

      if (!Number.isInteger(age) || age < 18 || age > 100) {
        throw new Error("Age must be between 18 and 100.");
      }

      const experienceYears =
        form.experienceYears === "" ? 0 : Number(form.experienceYears);

      if (
        !Number.isFinite(experienceYears) ||
        experienceYears < 0 ||
        experienceYears > 50
      ) {
        throw new Error("Experience must be between 0 and 50 years.");
      }

      if (parsedSkills.length === 0) {
        throw new Error("Add at least one technical skill.");
      }

      const cleanedSkillLevels = {};

      parsedSkills.forEach((skill) => {
        if (skillLevels[skill]) {
          cleanedSkillLevels[skill] = skillLevels[skill];
        }
      });

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        headline: form.headline.trim(),
        location: form.location.trim(),
        age,
        gender: form.gender || undefined,
        about: form.about.trim(),
        skills: parsedSkills,
        skillLevels: cleanedSkillLevels,
        experienceYears,
        openToCollaborate: Boolean(form.openToCollaborate),
        githubUsername: form.githubUsername.trim(),
        linkedin: form.linkedin.trim(),
        twitter: form.twitter.trim(),
      };

      const res = await axios.patch(`${BASE_URL}/profile/edit`, payload, {
        withCredentials: true,
      });

      const updatedUser = res.data?.data;

      if (!updatedUser) {
        throw new Error("Invalid server response.");
      }

      dispatch(addUser(updatedUser));

      setSuccess("Profile saved successfully.");

      setTimeout(() => {
        navigate("/profile");
      }, 600);
    } catch (err) {
      console.error("Profile save error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-teal" />
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl pb-10">
      <button
        type="button"
        onClick={() => navigate("/profile")}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to profile
      </button>

      {/* Header */}
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal">
          ACCOUNT
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">
          Edit your profile
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          Give developers enough information to understand who you are and help
          CodeCircle find better matches.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-600">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      <form onSubmit={saveProfile} className="space-y-5">
        {/* Basic Information */}
        <Section
          title="Basic information"
          description="The essentials developers see first."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Rahul"
              required
            />

            <Field
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Ashok"
              required
            />

            <Field
              label="Age"
              name="age"
              type="number"
              value={form.age}
              onChange={handleChange}
              placeholder="21"
              min="18"
              max="100"
              required
            />

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Gender
              </label>

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/10"
              >
                <option value="">Prefer not to say</option>

                {GENDERS.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender[0].toUpperCase() + gender.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        {/* Developer Profile */}
        <Section
          title="Developer profile"
          description="Help people understand what you build."
        >
          <div className="space-y-4">
            <Field
              label="Headline"
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="Full-stack developer building AI products"
              maxLength={120}
            />

            <Field
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Bengaluru, India"
              icon={MapPin}
            />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">
                  About
                </label>

                <button
                  type="button"
                  onClick={generateBio}
                  disabled={generatingBio}
                  className="flex items-center gap-1.5 text-xs font-bold text-bloom transition hover:opacity-80 disabled:opacity-50"
                >
                  {generatingBio ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}

                  {generatingBio ? "Generating..." : "Generate with AI"}
                </button>
              </div>

              <textarea
                name="about"
                value={form.about}
                onChange={handleChange}
                placeholder="Tell developers about yourself, what you enjoy building and what you're looking for..."
                maxLength={1000}
                rows={6}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-ink outline-none placeholder:text-slate-400 transition focus:border-teal focus:ring-2 focus:ring-teal/10"
              />

              <div className="mt-1 text-right text-[10px] text-slate-400">
                {form.about.length}/1000
              </div>
            </div>
          </div>
        </Section>

        {/* Skills */}
        <Section
          title="Skills"
          description="Add comma-separated technologies you're comfortable with."
        >
          <Field
            label="Technical skills"
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="React, Node.js, MongoDB, Python, AWS"
          />

          {parsedSkills.length > 0 && (
            <div className="mt-5">
              <p className="mb-3 text-xs font-semibold text-slate-600">
                Skill levels
              </p>

              <div className="space-y-2">
                {parsedSkills.map((skill) => (
                  <div
                    key={skill}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-surface p-3 sm:flex-row sm:items-center"
                  >
                    <span className="flex-1 text-sm font-semibold text-ink">
                      {skill}
                    </span>

                    <div className="flex gap-2">
                      {["beginner", "intermediate", "advanced"].map((level) => (
                        <button
                          type="button"
                          key={level}
                          onClick={() => updateSkillLevel(skill, level)}
                          className={`rounded-xl px-3 py-1.5 text-[10px] font-bold capitalize transition ${
                            skillLevels[skill] === level
                              ? "bg-teal/10 text-teal ring-1 ring-teal/20"
                              : "bg-white text-slate-500 hover:bg-slate-100 hover:text-ink"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Experience */}
        <Section
          title="Experience"
          description="Tell people how much development experience you have."
        >
          <Field
            label="Years of experience"
            name="experienceYears"
            type="number"
            value={form.experienceYears}
            onChange={handleChange}
            placeholder="1"
            min="0"
            max="50"
          />

          <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-surface p-4 transition hover:border-teal/30">
            <input
              type="checkbox"
              name="openToCollaborate"
              checked={form.openToCollaborate}
              onChange={handleChange}
              className="h-4 w-4 accent-teal"
            />

            <div>
              <p className="text-sm font-semibold text-ink">
                I'm open to collaboration
              </p>

              <p className="mt-1 text-xs text-muted">
                Let developers know you're interested in projects, hackathons
                and ideas.
              </p>
            </div>

            <Users className="ml-auto h-5 w-5 text-teal/70" />
          </label>
        </Section>

        {/* Developer Links */}
        <Section
          title="Developer links"
          description="Optional links to your developer profiles."
        >
          <div className="space-y-4">
            <Field
              label="GitHub username"
              name="githubUsername"
              value={form.githubUsername}
              onChange={handleChange}
              placeholder="yourusername"
              icon={Code2}
            />

            <Field
              label="LinkedIn URL"
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourname"
              icon={LinkIcon}
            />

            <Field
              label="Twitter / X URL"
              name="twitter"
              value={form.twitter}
              onChange={handleChange}
              placeholder="https://x.com/yourusername"
              icon={LinkIcon}
            />
          </div>
        </Section>

        {/* Profile Photo */}
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50">
              <UserRound className="h-5 w-5 text-bloom" />
            </div>

            <div>
              <p className="text-sm font-bold text-ink">Profile photo</p>

              <p className="mt-1 text-xs leading-5 text-muted">
                Desktop image upload with Cloudinary will be added in the final
                upload step.
              </p>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-ink"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal to-volt px-7 text-sm font-black text-white shadow-glow transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
      <div className="mb-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-ink">
          {title}
        </h2>

        <p className="mt-1 text-xs text-muted">{description}</p>
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
  maxLength,
  icon: Icon,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-semibold text-slate-600"
      >
        {label}

        {required && <span className="ml-1 text-teal">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          maxLength={maxLength}
          className={`h-12 w-full rounded-2xl border border-slate-200 bg-white ${
            Icon ? "pl-11" : "px-4"
          } pr-4 text-sm text-ink outline-none placeholder:text-slate-400 transition focus:border-teal focus:ring-2 focus:ring-teal/10`}
        />
      </div>
    </div>
  );
}
