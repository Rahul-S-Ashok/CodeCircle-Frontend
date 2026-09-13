import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, MapPin, Sparkles, UserRound } from "lucide-react";

import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";

export default function Onboarding() {
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
    photoUrl: "",
  });

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateBio = async () => {
    setGenerating(true);
    setError("");
    setMessage("");

    try {
      const skills = form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const res = await axios.post(
        `${BASE_URL}/ai/bio`,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          headline: form.headline,
          location: form.location,
          skills,
        },
        {
          withCredentials: true,
        },
      );

      const data = res.data?.data;

      if (!data) {
        throw new Error("AI did not return profile data.");
      }

      setForm((prev) => ({
        ...prev,
        headline: data.headline || prev.headline,
        about: data.about || prev.about,
        skills:
          Array.isArray(data.skills) && data.skills.length
            ? data.skills.join(", ")
            : prev.skills,
      }));

      setMessage("AI profile generated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Unable to generate your profile.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const headline = form.headline.trim();
    const location = form.location.trim();
    const about = form.about.trim();
    const photoUrl = form.photoUrl.trim();

    const skills = form.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const age = form.age === "" ? undefined : Number(form.age);

    if (firstName.length < 2) {
      setError("First name must contain at least 2 characters.");
      setSaving(false);
      return;
    }

    if (lastName.length < 2) {
      setError("Last name must contain at least 2 characters.");
      setSaving(false);
      return;
    }

    if (!headline) {
      setError("Please add a developer headline.");
      setSaving(false);
      return;
    }

    if (about.length < 10) {
      setError("Tell developers a little more about yourself.");
      setSaving(false);
      return;
    }

    if (skills.length === 0) {
      setError("Add at least one skill.");
      setSaving(false);
      return;
    }

    if (
      age !== undefined &&
      (!Number.isInteger(age) || age < 18 || age > 100)
    ) {
      setError("Age must be a whole number between 18 and 100.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        firstName,
        lastName,
        headline,
        location,
        age,
        gender: form.gender,
        about,
        skills,
        photoUrl,
      };

      const res = await axios.patch(`${BASE_URL}/profile/edit`, payload, {
        withCredentials: true,
      });

      const updatedUser = res.data?.data;

      if (!updatedUser) {
        throw new Error("Invalid response from server.");
      }

      dispatch(addUser(updatedUser));

      setMessage("Profile complete. Welcome to CodeCircle!");

      setTimeout(() => {
        navigate("/discover", { replace: true });
      }, 700);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Unable to save your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 md:px-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2">
            <Sparkles className="h-3.5 w-3.5 text-cyan-600" />

            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-700">
              Welcome to CodeCircle
            </p>
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Build your developer identity.
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Tell the community who you are, what you build, and what kind of
            developers you want to meet.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-7">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Complete your profile
            </span>

            <span className="font-bold text-cyan-600">Step 1 of 1</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            {/* Profile Preview */}
            <div className="border-b border-slate-100 bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-6 md:p-8">
              <div className="flex items-center gap-4">
                {form.photoUrl ? (
                  <img
                    src={form.photoUrl}
                    alt="Preview"
                    className="h-16 w-16 rounded-2xl border border-slate-200 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <UserRound size={24} className="text-slate-400" />
                  </div>
                )}

                <div className="min-w-0">
                  <p className="font-bold text-slate-900">
                    {form.firstName || "Your"} {form.lastName || "Name"}
                  </p>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {form.headline || "Your developer headline"}
                  </p>

                  {form.location && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={12} />
                      {form.location}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-10 p-6 md:p-8">
              {/* About You */}
              <section>
                <SectionTitle
                  number="01"
                  title="About you"
                  description="These details help developers recognize and connect with you."
                />

                <div className="grid gap-5 md:grid-cols-2">
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
                    min="18"
                    max="100"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="21"
                  />

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Gender
                    </label>

                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <Field
                    label="Location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Bangalore, India"
                  />

                  <Field
                    label="Profile photo URL"
                    name="photoUrl"
                    value={form.photoUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />

                  <Field
                    label="Developer headline"
                    name="headline"
                    value={form.headline}
                    onChange={handleChange}
                    placeholder="Full Stack Developer • MERN • AI"
                    className="md:col-span-2"
                    required
                  />
                </div>
              </section>

              {/* Skills */}
              <section className="border-t border-slate-100 pt-8">
                <SectionTitle
                  number="02"
                  title="Your stack"
                  description="Add the technologies you actually enjoy working with."
                />

                <Field
                  label="Skills"
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, MongoDB, Python, ML"
                  hint="Separate skills with commas."
                />
              </section>

              {/* About */}
              <section className="border-t border-slate-100 pt-8">
                <SectionTitle
                  number="03"
                  title="Your story"
                  description="Give other developers a reason to start a conversation."
                />

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label className="text-sm font-semibold text-slate-700">
                      About you
                    </label>

                    <button
                      type="button"
                      onClick={generateBio}
                      disabled={generating}
                      className="flex shrink-0 items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Sparkles size={13} />

                      {generating ? "Generating..." : "Generate with AI"}
                    </button>
                  </div>

                  <textarea
                    name="about"
                    value={form.about}
                    onChange={handleChange}
                    rows={6}
                    placeholder="I'm a full-stack developer who loves building products with React and Node.js..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    required
                  />
                </div>
              </section>

              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {typeof error === "string" ? error : "Something went wrong."}
                </div>
              )}

              {/* Success */}
              {message && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  <Check size={16} />
                  {message}
                </div>
              )}

              {/* Submit */}
              <div className="border-t border-slate-100 pt-7">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    "Creating your profile..."
                  ) : (
                    <>
                      Enter CodeCircle
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-xs text-slate-400">
                  You can change these details anytime from your profile.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionTitle({ number, title, description }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <span className="rounded-md bg-cyan-50 px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-cyan-600">
          {number}
        </span>

        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>

      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  hint,
  className = "",
  min,
  max,
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
      />

      {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
