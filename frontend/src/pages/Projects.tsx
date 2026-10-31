import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  FolderKanban,
  X,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  getProjectProgress,
  getProjectRisks,
  type InsightTask,
} from "../lib/projectInsights";

type Project = {
  id: number;
  name: string;
  category: string;
  progress: number;
  status: string;
};

type ProjectsProps = {
  onBack: () => void;
  onOpenProject: (projectId: number) => void;
};

export default function Projects({
  onBack,
  onOpenProject,
}: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<InsightTask[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [category, setCategory] = useState("Development");
  const [progress, setProgress] = useState("0");
  const [status, setStatus] = useState("Planning");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pageError, setPageError] = useState("");
  const [darkMode, setDarkMode] = useState(
    () => document.documentElement.classList.contains("dark-mode"),
  );

  useEffect(() => {
    const root = document.documentElement;

    const observer = new MutationObserver(() => {
      setDarkMode(root.classList.contains("dark-mode"));
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const colors = {
    surface: darkMode ? "#1f2937" : "#ffffff",
    text: darkMode ? "#f3f4f6" : "#172b4d",
    muted: darkMode ? "#aab5c5" : "#64748b",
    border: darkMode ? "#374151" : "#e2e8f0",
    input: darkMode ? "#111827" : "#ffffff",
    primary: "#049fd9",
    danger: "#dc2626",
    shadow: darkMode
      ? "0 4px 16px rgba(0,0,0,0.2)"
      : "0 3px 12px rgba(16,36,58,0.04)",
  };

  const styles: Record<string, React.CSSProperties> = {
    page: {
      width: "100%",
      minWidth: 0,
      color: colors.text,
      fontFamily: "inherit",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
      padding: 24,
      marginBottom: 22,
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: 14,
      boxShadow: colors.shadow,
    },
    title: {
      margin: 0,
      fontSize: 26,
      fontWeight: 750,
      color: colors.text,
    },
    muted: {
      color: colors.muted,
      marginTop: 7,
      fontSize: 14,
      lineHeight: 1.6,
    },
    button: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "10px 14px",
      borderRadius: 8,
      border: `1px solid ${colors.border}`,
      background: colors.surface,
      color: colors.text,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
    },
    primaryButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "11px 16px",
      borderRadius: 8,
      border: "none",
      background: colors.primary,
      color: "#ffffff",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 650,
    },
    toolbar: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
      padding: 16,
      marginBottom: 20,
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
    },
    searchWrap: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flex: 1,
      minWidth: 200,
      padding: "0 12px",
      border: `1px solid ${colors.border}`,
      borderRadius: 8,
      background: colors.input,
    },
    input: {
      width: "100%",
      minWidth: 0,
      padding: "12px 0",
      border: "none",
      outline: "none",
      background: "transparent",
      color: colors.text,
      fontSize: 14,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 265px), 1fr))",
      gap: 18,
    },
    card: {
      padding: 22,
      border: `1px solid ${colors.border}`,
      borderRadius: 13,
      background: colors.surface,
      boxShadow: colors.shadow,
      minWidth: 0,
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 10px",
      borderRadius: 20,
      background: darkMode ? "#12384a" : "#e8f6fc",
      color: darkMode ? "#7dd3fc" : "#087eae",
      fontSize: 12,
      fontWeight: 650,
    },
    progressTrack: {
      width: "100%",
      height: 7,
      borderRadius: 10,
      overflow: "hidden",
      background: darkMode ? "#374151" : "#edf2f7",
      marginTop: 10,
    },
    modalBackdrop: {
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: "rgba(15, 23, 42, 0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    modal: {
      width: "100%",
      maxWidth: 480,
      maxHeight: "90vh",
      overflowY: "auto",
      padding: 26,
      borderRadius: 15,
      background: colors.surface,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
    },
    fieldLabel: {
      display: "block",
      fontSize: 13,
      fontWeight: 650,
      marginBottom: 8,
      color: colors.text,
    },
    field: {
      width: "100%",
      boxSizing: "border-box",
      padding: 12,
      borderRadius: 8,
      border: `1px solid ${colors.border}`,
      background: colors.input,
      color: colors.text,
      fontSize: 14,
    },
  };

  useEffect(() => {
    let active = true;

    async function loadProjectsAndTasks() {
      setPageError("");

      try {
        const { data: userResult, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userResult.user) {
          if (active) {
            setPageError("Please sign in again to view your projects.");
            setLoading(false);
          }
          return;
        }

        const [projectResult, taskResult] = await Promise.all([
          supabase
            .from("projects")
            .select("id, name, category, progress, status")
            .eq("owner_id", userResult.user.id)
            .order("created_at", { ascending: false }),

          supabase
            .from("tasks")
            .select(
              "id, project_id, project_name, title, status, priority, due_date"
            ),
        ]);

        if (!active) return;

        if (projectResult.error) {
          setPageError(projectResult.error.message);
          setProjects([]);
          return;
        }

        setProjects((projectResult.data ?? []) as Project[]);

        if (taskResult.error) {
          setTasks([]);
          setPageError(
            `Projects loaded, but tasks could not be loaded: ${taskResult.error.message}`
          );
        } else {
          setTasks((taskResult.data ?? []) as InsightTask[]);
        }
      } catch (error) {
        if (active) {
          setPageError(
            error instanceof Error
              ? error.message
              : "Unable to load projects and tasks."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProjectsAndTasks();

    const channel = supabase
      .channel("projects-tasks-live-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        () => {
          if (active) void loadProjectsAndTasks();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        () => {
          if (active) void loadProjectsAndTasks();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.info("Cisco Nexus Realtime connected.");
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT"
        ) {
          console.error(
            "Cisco Nexus Realtime connection issue:",
            status
          );
        }
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  function getProgress(project: Project): number {
    return getProjectProgress(
      {
        id: project.id,
        name: project.name,
        progress: project.progress,
        status: project.status,
      },
      tasks,
    );
  }

  function getRisks(project: Project): string[] {
    return getProjectRisks(
      {
        id: project.id,
        name: project.name,
        progress: project.progress,
        status: project.status,
      },
      tasks,
    );
  }

  async function addProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = projectName.trim();

    if (!name) {
      setPageError("Please enter a project name.");
      return;
    }

    setSaving(true);
    setPageError("");

    try {
      const { data: userResult, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userResult.user) {
        setPageError("Your session has expired. Please sign in again.");
        return;
      }

      const newProject = {
        owner_id: userResult.user.id,
        legacy_id: crypto.randomUUID(),
        name,
        description: "",
        category,
        progress: status === "Completed" ? 100 : Number(progress),
        status,
        assigned_members: [],
      };

      const { data, error } = await supabase
        .from("projects")
        .insert(newProject)
        .select("id, name, category, progress, status")
        .single();

      if (error) {
        setPageError(error.message);
        return;
      }

      if (data) {
        setProjects((previous) => [data as Project, ...previous]);
        setProjectName("");
        setCategory("Development");
        setProgress("0");
        setStatus("Planning");
        setShowModal(false);
      }
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Unable to create project.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(projectId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmed) return;

    setPageError("");
    setDeletingId(projectId);

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        setPageError(error.message);
        return;
      }

      setProjects((previous) =>
        previous.filter((project) => project.id !== projectId),
      );
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Unable to delete project.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredProjects = projects.filter((project) => {
    const query = search.toLowerCase();

    return (
      (project.name ?? "").toLowerCase().includes(query) ||
      (project.category ?? "").toLowerCase().includes(query) ||
      (project.status ?? "").toLowerCase().includes(query)
    );
  });

  return (
    <div style={styles.page} className="projects-page-root">
      <style>{`
        .projects-page-root * { box-sizing: border-box; }
        .projects-page-root .project-card-clickable { cursor: pointer; transition: transform .2s, box-shadow .2s; }
        .projects-page-root .project-card-clickable:hover { transform: translateY(-3px); }
        .projects-page-root button:focus-visible,
        .projects-page-root input:focus-visible,
        .projects-page-root select:focus-visible { outline: 2px solid #049fd9; outline-offset: 2px; }
        @media (max-width: 600px) {
          .projects-page-root .projects-heading { padding: 18px !important; }
          .projects-page-root .projects-title { font-size: 23px !important; }
        }
      `}</style>

      <header style={styles.header} className="projects-heading">
        <div>
          <button style={styles.button} onClick={onBack} type="button">
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <h1
            style={{ ...styles.title, marginTop: 18 }}
            className="projects-title"
          >
            Projects
          </h1>

          <p style={styles.muted}>
            Manage and track all your projects in one place.
          </p>
        </div>

        <button
          style={styles.primaryButton}
          type="button"
          onClick={() => {
            setPageError("");
            setShowModal(true);
          }}
        >
          <Plus size={18} />
          Add Project
        </button>
      </header>

      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <Search size={18} color={colors.muted} />
          <input
            style={styles.input}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects..."
            aria-label="Search projects"
          />
          {search && (
            <button
              type="button"
              style={{ ...styles.button, padding: 6 }}
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <span style={{ color: colors.muted, fontSize: 13 }}>
          {filteredProjects.length} project
          {filteredProjects.length === 1 ? "" : "s"}
        </span>
      </div>

      {pageError && (
        <div
          role="alert"
          style={{
            marginBottom: 20,
            padding: 14,
            borderRadius: 9,
            background: darkMode ? "#451f2a" : "#fff1f2",
            color: darkMode ? "#fecaca" : "#b42318",
            border: `1px solid ${darkMode ? "#7f1d1d" : "#fecaca"}`,
            overflowWrap: "anywhere",
          }}
        >
          {pageError}
        </div>
      )}

      {loading ? (
        <div style={styles.card}>Loading projects and tasks...</div>
      ) : filteredProjects.length === 0 ? (
        <div style={{ ...styles.card, textAlign: "center", padding: 48 }}>
          <FolderKanban
            size={42}
            color={colors.primary}
            style={{ margin: "0 auto 12px" }}
          />
          <h3 style={{ color: colors.text }}>
            {search ? "No matching projects" : "No projects yet"}
          </h3>
          <p style={styles.muted}>
            {search
              ? "Try a different search term."
              : "Create your first project to get started."}
          </p>
          {!search && (
            <button
              style={styles.primaryButton}
              type="button"
              onClick={() => setShowModal(true)}
            >
              <Plus size={17} />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredProjects.map((project) => {
            const projectProgress = getProgress(project);
            const risks = getRisks(project);

            return (
              <article
                key={project.id}
                style={styles.card}
                className="project-card-clickable"
                onClick={() => onOpenProject(project.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpenProject(project.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Open project ${project.name}`}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <span style={styles.badge}>
                      <FolderKanban size={13} />
                      {project.category || "General"}
                    </span>

                    <h3
                      style={{
                        color: colors.text,
                        fontSize: 18,
                        margin: "14px 0 8px",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {project.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    style={{
                      ...styles.button,
                      padding: 8,
                      color: colors.danger,
                      flexShrink: 0,
                    }}
                    aria-label={`Delete ${project.name}`}
                    disabled={deletingId === project.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      void deleteProject(project.id);
                    }}
                  >
                    {deletingId === project.id ? (
                      "..."
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    marginTop: 18,
                  }}
                >
                  <span style={{ color: colors.muted, fontSize: 13 }}>
                    Status
                  </span>
                  <span style={styles.badge}>
                    {project.status || "Planning"}
                  </span>
                </div>

                <div style={{ marginTop: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: colors.muted,
                      fontSize: 12,
                    }}
                  >
                    <span>Task-based progress</span>
                    <strong style={{ color: colors.text }}>
                      {projectProgress}%
                    </strong>
                  </div>

                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        width: `${projectProgress}%`,
                        height: "100%",
                        borderRadius: 10,
                        background:
                          projectProgress === 100 ? "#22c55e" : colors.primary,
                        transition: "width 0.2s",
                      }}
                    />
                  </div>
                </div>

                {risks.length > 0 && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: 12,
                      borderRadius: 8,
                      background: darkMode ? "#3b2c18" : "#fff7ed",
                      color: darkMode ? "#fed7aa" : "#9a3412",
                      fontSize: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontWeight: 700,
                        marginBottom: 7,
                      }}
                    >
                      <AlertTriangle size={15} />
                      Project risks
                    </div>
                    {risks.map((risk, index) => (
                      <div key={`${project.id}-risk-${index}`}>• {risk}</div>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 5,
                    marginTop: 17,
                    paddingTop: 13,
                    borderTop: `1px solid ${colors.border}`,
                    color: colors.primary,
                    fontSize: 12,
                    fontWeight: 650,
                  }}
                >
                  View project <ArrowUpRight size={15} />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showModal && (
        <div
          style={styles.modalBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowModal(false);
            }
          }}
        >
          <form style={styles.modal} onSubmit={addProject}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: colors.text, fontSize: 22 }}>
                  Create New Project
                </h2>
                <p style={{ ...styles.muted, marginBottom: 0 }}>
                  Add a project to your workspace.
                </p>
              </div>
              <button
                type="button"
                style={styles.button}
                onClick={() => setShowModal(false)}
                disabled={saving}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={styles.fieldLabel} htmlFor="project-name">
                Project Name
              </label>
              <input
                id="project-name"
                style={styles.field}
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="Enter project name"
                required
                maxLength={120}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={styles.fieldLabel} htmlFor="project-category">
                Category
              </label>
              <select
                id="project-category"
                style={styles.field}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option>Development</option>
                <option>Research</option>
                <option>Design</option>
                <option>Marketing</option>
                <option>Other</option>
              </select>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={styles.fieldLabel} htmlFor="project-status">
                Status
              </label>
              <select
                id="project-status"
                style={styles.field}
                value={status}
                onChange={(event) => {
                  const nextStatus = event.target.value;
                  setStatus(nextStatus);
                  if (nextStatus === "Completed") setProgress("100");
                }}
              >
                <option>Planning</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={styles.fieldLabel} htmlFor="project-progress">
                Initial progress (
                {status === "Completed" ? 100 : progress}%)
              </label>
              <input
                id="project-progress"
                type="range"
                min="0"
                max="100"
                step="5"
                value={status === "Completed" ? "100" : progress}
                disabled={status === "Completed"}
                onChange={(event) => setProgress(event.target.value)}
                style={{ width: "100%", accentColor: colors.primary }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                style={styles.button}
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  ...styles.primaryButton,
                  opacity: saving ? 0.7 : 1,
                }}
                disabled={saving}
              >
                <Plus size={17} />
                {saving ? "Saving..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}