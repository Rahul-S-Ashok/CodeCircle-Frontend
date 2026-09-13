import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FolderGit2, Plus, Trash2, Loader2, X, Users } from "lucide-react";

import { BASE_URL } from "../utils/constants";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    lookingFor: "",
  });

  /* =================================================
     FETCH PROJECTS
  ================================================= */

  const fetchProjects = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${BASE_URL}/projects`, {
        withCredentials: true,
      });

      setProjects(response.data?.data || []);
    } catch (err) {
      console.error("Projects loading error:", err);

      setError(err.response?.data?.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* =================================================
     FORM CHANGE
  ================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =================================================
     CREATE PROJECT
  ================================================= */

  const createProject = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Project title is required.");
      return;
    }

    if (!form.description.trim()) {
      setError("Project description is required.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const payload = {
        title: form.title.trim(),

        description: form.description.trim(),

        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),

        lookingFor: form.lookingFor
          .split(",")
          .map((role) => role.trim())
          .filter(Boolean),
      };

      const response = await axios.post(`${BASE_URL}/projects`, payload, {
        withCredentials: true,
      });

      const newProject = response.data?.data;

      if (newProject) {
        setProjects((previous) => [newProject, ...previous]);
      }

      setForm({
        title: "",
        description: "",
        tags: "",
        lookingFor: "",
      });

      setShowForm(false);
    } catch (err) {
      console.error("Create project error:", err);

      setError(err.response?.data?.message || "Unable to create project.");
    } finally {
      setCreating(false);
    }
  };

  /* =================================================
     DELETE PROJECT
  ================================================= */

  const deleteProject = async (projectId) => {
    if (!projectId || deletingId) return;

    const confirmed = window.confirm("Delete this project?");

    if (!confirmed) return;

    setDeletingId(projectId);
    setError("");

    try {
      await axios.delete(`${BASE_URL}/projects/${projectId}`, {
        withCredentials: true,
      });

      setProjects((previous) =>
        previous.filter((project) => project._id !== projectId),
      );
    } catch (err) {
      console.error("Delete project error:", err);

      setError(err.response?.data?.message || "Unable to delete project.");
    } finally {
      setDeletingId(null);
    }
  };

  /* =================================================
     CLOSE FORM
  ================================================= */

  const closeForm = () => {
    setShowForm(false);
    setError("");

    setForm({
      title: "",
      description: "",
      tags: "",
      lookingFor: "",
    });
  };

  return (
    <div className="mx-auto min-h-full max-w-5xl pb-10 text-slate-900">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-semibold tracking-[0.25em] text-cyan-600">
            BUILD TOGETHER
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Projects
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Share what you're building and find developers who want to build it
            with you.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setError("");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-600"
        >
          <Plus size={17} />
          New project
        </button>
      </header>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* =================================================
          CREATE PROJECT FORM
      ================================================= */}

      {showForm && (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] font-semibold tracking-[0.2em] text-cyan-600">
                NEW PROJECT
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                What are you building?
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Share your idea and find developers to collaborate with.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={createProject} className="mt-6 space-y-5">
            {/* TITLE */}

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700">
                Project title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={120}
                placeholder="e.g. AI Resume Analyzer"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={2000}
                rows={4}
                placeholder="Describe your idea, what problem it solves and what you want to build..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              />
            </div>

            {/* TECHNOLOGIES */}

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700">
                Technologies
              </label>

              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB, Python"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              />

              <p className="mt-1.5 text-[11px] text-slate-500">
                Separate technologies with commas.
              </p>
            </div>

            {/* LOOKING FOR */}

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700">
                Looking for
              </label>

              <input
                name="lookingFor"
                value={form.lookingFor}
                onChange={handleChange}
                placeholder="ML Engineer, UI/UX Designer"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              />

              <p className="mt-1.5 text-[11px] text-slate-500">
                Add the roles you want on your team.
              </p>
            </div>

            {/* BUTTONS */}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeForm}
                disabled={creating}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating && <Loader2 size={14} className="animate-spin" />}

                {creating ? "Creating..." : "Create project"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================
          PROJECT LIST
      ================================================= */}

      {loading ? (
        <div className="flex min-h-[55vh] items-center justify-center">
          <div className="text-center">
            <Loader2 size={28} className="mx-auto animate-spin text-cyan-500" />

            <p className="mt-3 text-sm text-slate-500">Loading projects...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50">
            <FolderGit2 size={27} className="text-cyan-600" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No projects yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Create your first project and find developers who are excited to
            work on it.
          </p>

          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setError("");
            }}
            className="mt-6 rounded-full bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-cyan-600"
          >
            Create project
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <article
              key={project._id}
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md"
            >
              {/* PROJECT HEADER */}

              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50">
                    <FolderGit2 size={19} className="text-cyan-600" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-slate-900">
                      {project.title}
                    </h2>

                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      Developer project
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteProject(project._id)}
                  disabled={deletingId === project._id}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40"
                  aria-label="Delete project"
                >
                  {deletingId === project._id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>

              {/* DESCRIPTION */}

              <p className="mt-5 text-sm leading-6 text-slate-600">
                {project.description}
              </p>

              {/* TECHNOLOGIES */}

              {project.tags?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[10px] text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* LOOKING FOR */}

              {project.lookingFor?.length > 0 && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-cyan-600" />

                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      Looking for
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {project.lookingFor.map((role) => (
                      <span
                        key={role}
                        className="text-xs font-medium text-slate-700"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => navigate(`/projects/${project._id}/room`)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-xs font-bold text-white transition hover:bg-cyan-600"
                >
                  <Users size={16} />
                  Open Workspace
                </button>
              </div>

              {/* DATE */}

              {project.createdAt && (
                <p className="mt-5 font-mono text-[9px] text-slate-400">
                  CREATED {new Date(project.createdAt).toLocaleDateString()}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
