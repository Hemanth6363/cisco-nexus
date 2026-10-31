import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  Circle,
  X,
  ListTodo,
  Pencil,
  Calendar,
  UserRound,
} from "lucide-react";

type TaskStatus = "Pending" | "In Progress" | "Completed";

type Task = {
  id: number;
  title: string;
  project: string;
  projectId?: number;
  priority: string;
  status: TaskStatus;
  assignedTo?: string;
  dueDate?: string;
};

type Project = {
  id?: number;
  name?: string;
  title?: string;
};

type TeamMember = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
};

type TasksProps = {
  onBack: () => void;
};

const styles = `
  * { box-sizing: border-box; }

  .tasks-page {
    min-height: 100vh;
    background: #f5f6fa;
    color: #20243a;
    font-family: Arial, Helvetica, sans-serif;
  }

  .tasks-page button,
  .tasks-page input,
  .tasks-page select {
    font: inherit;
  }

  .tasks-page button { cursor: pointer; }

  .tasks-header {
    background: #171a2e;
    color: white;
    padding: 24px 35px;
  }

  .tasks-header-inner {
    max-width: 1250px;
    margin: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
  }

  .tasks-header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .tasks-back {
    width: 42px;
    height: 42px;
    border: 1px solid #454963;
    background: transparent;
    color: white;
    border-radius: 8px;
    display: grid;
    place-items: center;
  }

  .tasks-back:hover { background: #303452; }

  .tasks-header h1 { margin: 0; font-size: 27px; }

  .tasks-header p {
    margin: 6px 0 0;
    color: #aeb1c2;
  }

  .tasks-add {
    border: none;
    background: #625cf5;
    color: white;
    padding: 12px 18px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .tasks-add:hover, .tasks-save:hover { background: #514bea; }

  .tasks-content {
    max-width: 1250px;
    margin: auto;
    padding: 30px 35px;
  }

  .tasks-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 22px;
  }

  .tasks-stat {
    background: white;
    border: 1px solid #e7e7ee;
    border-radius: 12px;
    padding: 20px;
  }

  .tasks-stat p {
    margin: 0 0 8px;
    color: #85899a;
    font-size: 13px;
  }

  .tasks-stat h2 { margin: 0; font-size: 28px; }

  .tasks-toolbar {
    background: white;
    border: 1px solid #e7e7ee;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
    display: flex;
    gap: 12px;
  }

  .tasks-search {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  .tasks-search svg {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: #85899a;
  }

  .tasks-search input {
    width: 100%;
    padding: 12px 14px 12px 42px;
    border: 1px solid #dddde6;
    border-radius: 8px;
    outline: none;
  }

  .tasks-search input:focus,
  .tasks-field:focus {
    border-color: #625cf5;
  }

  .tasks-filter {
    min-width: 150px;
    padding: 0 12px;
    border: 1px solid #dddde6;
    border-radius: 8px;
    background: white;
  }

  .tasks-list { display: flex; flex-direction: column; gap: 12px; }

  .tasks-card {
    background: white;
    border: 1px solid #e7e7ee;
    border-radius: 12px;
    padding: 19px;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .tasks-check {
    border: none;
    background: transparent;
    display: flex;
    padding: 0;
    flex-shrink: 0;
  }

  .tasks-check.pending { color: #888b9b; }
  .tasks-check.progress { color: #d99a22; }
  .tasks-check.done { color: #625cf5; }

  .tasks-info { flex: 1; min-width: 0; }

  .tasks-title { margin: 0; font-size: 15px; overflow-wrap: anywhere; }

  .tasks-title.done { text-decoration: line-through; color: #999cab; }

  .tasks-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 7px 14px;
    margin-top: 9px;
    color: #85899a;
    font-size: 12px;
  }

  .tasks-meta span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .tasks-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .tasks-badge {
    padding: 6px 9px;
    border-radius: 20px;
    font-size: 11px;
    white-space: nowrap;
  }

  .tasks-high { background: #fff0f0; color: #d84c4c; }
  .tasks-medium { background: #fff8e8; color: #c28a19; }
  .tasks-low { background: #eefaf2; color: #36925a; }

  .tasks-status {
    padding: 6px 9px;
    border-radius: 7px;
    border: 1px solid #e3e3ed;
    background: #fff;
    color: #454963;
    font-size: 11px;
    max-width: 125px;
  }

  .tasks-icon-button {
    border: none;
    width: 34px;
    height: 34px;
    border-radius: 7px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .tasks-edit { background: #f0efff; color: #625cf5; }
  .tasks-delete { background: #fff1f1; color: #e05252; }

  .tasks-empty {
    background: white;
    border: 1px solid #e7e7ee;
    border-radius: 12px;
    padding: 55px 20px;
    text-align: center;
    color: #85899a;
  }

  .tasks-empty h3 { color: #20243a; }

  .tasks-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 18, 35, .58);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    z-index: 1000;
    overflow-y: auto;
  }

  .tasks-modal {
    width: 100%;
    max-width: 540px;
    max-height: 92vh;
    overflow-y: auto;
    background: white;
    border-radius: 14px;
    padding: 25px;
    color: #20243a;
  }

  .tasks-modal-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 22px;
  }

  .tasks-modal-head h2 { margin: 0; font-size: 21px; }

  .tasks-close {
    border: none;
    background: #f1f1f5;
    width: 35px;
    height: 35px;
    border-radius: 7px;
    display: grid;
    place-items: center;
  }

  .tasks-group { margin-bottom: 17px; }

  .tasks-group label {
    display: block;
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 7px;
  }

  .tasks-field {
    width: 100%;
    padding: 12px;
    border: 1px solid #dddde6;
    border-radius: 8px;
    outline: none;
    background: white;
    color: #20243a;
  }

  .tasks-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 23px;
  }

  .tasks-cancel, .tasks-save {
    padding: 11px 16px;
    border-radius: 8px;
  }

  .tasks-cancel { border: 1px solid #dddde6; background: white; }

  .tasks-save { border: none; background: #625cf5; color: white; }

  .tasks-note { color: #85899a; font-size: 12px; margin-top: 6px; }

  @media (max-width: 850px) {
    .tasks-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .tasks-card { flex-wrap: wrap; }
    .tasks-actions { width: 100%; justify-content: flex-start; padding-left: 37px; }
  }

  @media (max-width: 600px) {
    .tasks-header { padding: 20px; }
    .tasks-header-inner { align-items: flex-start; flex-direction: column; }
    .tasks-add { width: 100%; }
    .tasks-content { padding: 20px; }
    .tasks-toolbar { flex-direction: column; }
    .tasks-search input { min-height: 43px; }
    .tasks-filter { min-height: 43px; }
    .tasks-stats { gap: 10px; }
    .tasks-stat { padding: 15px; }
    .tasks-stat h2 { font-size: 24px; }
    .tasks-actions { padding-left: 0; }
    .tasks-modal { padding: 19px; }

  }

  /* Dark mode follows the saved theme applied to the document root. */
  .dark-mode .tasks-page {
    background: #111827;
    color: #f3f4f6;
  }

  .dark-mode .tasks-stat,
  .dark-mode .tasks-toolbar,
  .dark-mode .tasks-card,
  .dark-mode .tasks-empty,
  .dark-mode .tasks-modal {
    background: #1f2937;
    color: #f3f4f6;
    border-color: #374151;
  }

  .dark-mode .tasks-stat p,
  .dark-mode .tasks-meta,
  .dark-mode .tasks-note,
  .dark-mode .tasks-empty {
    color: #aab5c5;
  }

  .dark-mode .tasks-empty h3,
  .dark-mode .tasks-title,
  .dark-mode .tasks-modal-head h2,
  .dark-mode .tasks-group label {
    color: #f3f4f6;
  }

  .dark-mode .tasks-search input,
  .dark-mode .tasks-filter,
  .dark-mode .tasks-status,
  .dark-mode .tasks-field,
  .dark-mode .tasks-cancel {
    background: #111827;
    color: #f3f4f6;
    border-color: #4b5563;
  }

  .dark-mode .tasks-search input::placeholder,
  .dark-mode .tasks-field::placeholder {
    color: #9ca3af;
  }

  .dark-mode .tasks-close {
    background: #374151;
    color: #f3f4f6;
  }

  .dark-mode .tasks-title.done {
    color: #9ca3af;
  }

  .dark-mode .tasks-high {
    background: #451f2a;
    color: #fecaca;
  }

  .dark-mode .tasks-medium {
    background: #453719;
    color: #fde68a;
  }

  .dark-mode .tasks-low {
    background: #153b2a;
    color: #bbf7d0;
  }

  .dark-mode .tasks-edit {
    background: #373151;
    color: #c4b5fd;
  }

  .dark-mode .tasks-delete {
    background: #451f2a;
    color: #fecaca;
  }

  .dark-mode .tasks-cancel {
    border-color: #4b5563;
  }
`;

export default function Tasks({ onBack }: TasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState<TaskStatus>("Pending");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setPageError("");

      const [taskResult, projectResult, teamResult] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, project_id, project_name, title, priority, status, assigned_to, due_date")
          .order("id", { ascending: true }),
        supabase
          .from("projects")
          .select("id, name, category, progress, status")
          .order("id", { ascending: true }),
        supabase
          .from("team_members")
          .select("id, name, email, role")
          .order("id", { ascending: true }),
      ]);

      if (cancelled) return;

      const firstError = taskResult.error || projectResult.error || teamResult.error;
      if (firstError) {
        console.error("Could not load task data:", firstError.message);
        setPageError(firstError.message);
        setLoading(false);
        return;
      }

      const loadedProjects: Project[] = (projectResult.data ?? []).map((item) => ({
        id: Number(item.id),
        name: item.name,
        title: item.name,
      }));

      const loadedTeam: TeamMember[] = (teamResult.data ?? []).map((item) => ({
        id: Number(item.id),
        name: item.name,
        email: item.email ?? "",
        role: item.role ?? "",
      }));

      const loadedTasks: Task[] = (taskResult.data ?? []).map((item) => {
        const matchingProject = loadedProjects.find(
          (projectItem) => Number(projectItem.id) === Number(item.project_id)
        );

        return {
          id: Number(item.id),
          title: item.title || "Untitled Task",
          project: matchingProject?.name || item.project_name || "General",
          projectId: item.project_id == null ? undefined : Number(item.project_id),
          priority: ["High", "Medium", "Low"].includes(item.priority)
            ? item.priority
            : "Medium",
          status: ["Pending", "In Progress", "Completed"].includes(item.status)
            ? (item.status as TaskStatus)
            : "Pending",
          assignedTo: item.assigned_to || "",
          dueDate: item.due_date || "",
        };
      });

      setProjects(loadedProjects);
      setTeam(loadedTeam);
      setTasks(loadedTasks);
      setLoading(false);
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetForm = () => {
    setTitle("");
    setProject("");
    setPriority("Medium");
    setStatus("Pending");
    setAssignedTo("");
    setDueDate("");
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setProject(task.project);
    setPriority(task.priority);
    setStatus(task.status);
    setAssignedTo(task.assignedTo || "");
    setDueDate(task.dueDate || "");
    setShowModal(true);
  };

  const saveTask = async () => {
    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (!project) {
      alert("Please select a project.");
      return;
    }

    setSaving(true);
    setPageError("");

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("Please sign in again before saving a task.");
      }

      const selectedProject = projects.find(
        (item, index) => getProjectName(item, index) === project
      );

      const payload = {
        project_id: selectedProject?.id ?? null,
        project_name: project,
        title: title.trim(),
        priority,
        status,
        assigned_to: assignedTo || "",
        due_date: dueDate || null,
      };

      if (editingId !== null) {
        const { data, error } = await supabase
          .from("tasks")
          .update(payload)
          .eq("id", editingId)
          .select("id, project_id, project_name, title, priority, status, assigned_to, due_date")
          .single();

        if (error) throw error;

        const updatedTask: Task = {
          id: Number(data.id),
          title: data.title,
          project: data.project_name || project,
          projectId: data.project_id == null ? undefined : Number(data.project_id),
          priority: data.priority,
          status: data.status as TaskStatus,
          assignedTo: data.assigned_to || "",
          dueDate: data.due_date || "",
        };

        setTasks((current) =>
          current.map((item) => item.id === editingId ? updatedTask : item)
        );
      } else {
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            ...payload,
            owner_id: userData.user.id,
            legacy_id: crypto.randomUUID(),
          })
          .select("id, project_id, project_name, title, priority, status, assigned_to, due_date")
          .single();

        if (error) throw error;

        const newTask: Task = {
          id: Number(data.id),
          title: data.title,
          project: data.project_name || project,
          projectId: data.project_id == null ? undefined : Number(data.project_id),
          priority: data.priority,
          status: data.status as TaskStatus,
          assignedTo: data.assigned_to || "",
          dueDate: data.due_date || "",
        };

        setTasks((current) => [...current, newTask]);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      console.error("Could not save task:", message);
      setPageError(message);
    } finally {
      setSaving(false);
    }
  };

  const updateTaskStatus = async (task: Task, nextStatus: TaskStatus) => {
    setPageError("");
    const { error } = await supabase
      .from("tasks")
      .update({ status: nextStatus })
      .eq("id", task.id);

    if (error) {
      console.error("Could not update task status:", error.message);
      setPageError(error.message);
      return;
    }

    setTasks((current) =>
      current.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item)
    );
  };

  const cycleStatus = (task: Task) => {
    const nextStatus: TaskStatus =
      task.status === "Pending" ? "In Progress" :
      task.status === "In Progress" ? "Completed" : "Pending";
    void updateTaskStatus(task, nextStatus);
  };

  const deleteTask = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    setPageError("");
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("Could not delete task:", error.message);
      setPageError(error.message);
      return;
    }

    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const filteredTasks = tasks.filter((task) => {
    const query = search.toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(query) ||
      task.project.toLowerCase().includes(query) ||
      (task.assignedTo || "").toLowerCase().includes(query);

    const matchesFilter =
      filter === "All" || task.status === filter;

    return matchesSearch && matchesFilter;
  });

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const pending = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const getProjectName = (
    item: Project,
    index: number
  ) => item.name || item.title || `Project ${index + 1}`;

  const priorityClass = (value: string) =>
    value === "High"
      ? "tasks-high"
      : value === "Low"
        ? "tasks-low"
        : "tasks-medium";

  const statusClass = (value: string) =>
    value === "Completed"
      ? "done"
      : value === "In Progress"
        ? "progress"
        : "pending";

  return (
    <div className="tasks-page">
      <style>{styles}</style>

      <header className="tasks-header">
        <div className="tasks-header-inner">
          <div className="tasks-header-left">
            <button
              className="tasks-back"
              onClick={onBack}
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1>Tasks</h1>
              <p>Manage, assign and track your work</p>
            </div>
          </div>

          <button className="tasks-add" onClick={openCreateModal}>
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </header>

      <main className="tasks-content">
        {pageError && (
          <div role="alert" style={{ background: document.documentElement.classList.contains("dark-mode") ? "#451f2a" : "#fff1f1", color: document.documentElement.classList.contains("dark-mode") ? "#fecaca" : "#a62b2b", padding: "12px 15px", borderRadius: 8, marginBottom: 18, overflowWrap: "anywhere" }}>
            {pageError}
          </div>
        )}

        {loading ? (
          <div className="tasks-empty">Loading tasks from Supabase...</div>
        ) : (
        <>
        <div className="tasks-stats">
          <div className="tasks-stat">
            <p>Total Tasks</p>
            <h2>{tasks.length}</h2>
          </div>

          <div className="tasks-stat">
            <p>Pending</p>
            <h2>{pending}</h2>
          </div>

          <div className="tasks-stat">
            <p>In Progress</p>
            <h2>{inProgress}</h2>
          </div>

          <div className="tasks-stat">
            <p>Completed</p>
            <h2>{completed}</h2>
          </div>
        </div>

        <div className="tasks-toolbar">
          <div className="tasks-search">
            <Search size={18} />
            <input
              placeholder="Search task, project or assignee..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="tasks-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter tasks by status"
          >
            <option value="All">All Tasks</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="tasks-empty">
            <ListTodo size={46} color="#625cf5" />
            <h3>No tasks found</h3>
            <p>
              {tasks.length === 0
                ? "Create your first task to get started."
                : "Try another search or status filter."}
            </p>
            {tasks.length === 0 && (
              <button className="tasks-add" onClick={openCreateModal}>
                <Plus size={17} /> Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="tasks-list">
            {filteredTasks.map((task) => (
              <div className="tasks-card" key={task.id}>
                <button
                  className={`tasks-check ${statusClass(task.status)}`}
                  onClick={() => cycleStatus(task)}
                  title={`Current status: ${task.status}. Click to change status.`}
                  aria-label={`Change status for ${task.title}`}
                >
                  {task.status === "Completed" ? (
                    <CheckCircle2 size={24} />
                  ) : task.status === "In Progress" ? (
                    <ListTodo size={24} />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>

                <div className="tasks-info">
                  <h3
                    className={`tasks-title ${
                      task.status === "Completed" ? "done" : ""
                    }`}
                  >
                    {task.title}
                  </h3>

                  <div className="tasks-meta">
                    <span>
                      <ListTodo size={14} />
                      {task.project}
                    </span>

                    <span>
                      <UserRound size={14} />
                      {task.assignedTo || "Unassigned"}
                    </span>

                    {task.dueDate && (
                      <span>
                        <Calendar size={14} />
                        {task.dueDate}
                      </span>
                    )}
                  </div>
                </div>

                <div className="tasks-actions">
                  <span
                    className={`tasks-badge ${priorityClass(task.priority)}`}
                  >
                    {task.priority}
                  </span>

                  <select
                    className="tasks-status"
                    aria-label={`Status for ${task.title}`}
                    value={task.status}
                    onChange={(event) => {
                      const nextStatus = event.target.value as TaskStatus;
                      void updateTaskStatus(task, nextStatus);
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    className="tasks-icon-button tasks-edit"
                    onClick={() => openEditModal(task)}
                    aria-label={`Edit ${task.title}`}
                    title="Edit task"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="tasks-icon-button tasks-delete"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete ${task.title}`}
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </>
        )}
      </main>

      {showModal && (
        <div
          className="tasks-overlay"
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <div
            className="tasks-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="tasks-modal-head">
              <h2>
                {editingId !== null ? "Edit Task" : "Create New Task"}
              </h2>

              <button
                className="tasks-close"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="tasks-group">
              <label htmlFor="task-title">Task Title *</label>
              <input
                id="task-title"
                className="tasks-field"
                placeholder="e.g. Build login page"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="tasks-group">
              <label htmlFor="task-project">Project *</label>
              <select
                id="task-project"
                className="tasks-field"
                value={project}
                onChange={(event) => setProject(event.target.value)}
              >
                <option value="">Select a project</option>
                {projects.map((item, index) => {
                  const name = getProjectName(item, index);

                  return (
                    <option
                      key={item.id ?? `${name}-${index}`}
                      value={name}
                    >
                      {name}
                    </option>
                  );
                })}
              </select>
              {projects.length === 0 && (
                <p className="tasks-note">
                  No projects found. Create a project first.
                </p>
              )}
            </div>

            <div className="tasks-group">
              <label htmlFor="task-assignee">Assign to Team Member</label>
              <select
                id="task-assignee"
                className="tasks-field"
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
              >
                <option value="">Unassigned</option>
                {team
                  .filter((member) => member.name)
                  .map((member, index) => (
                    <option
                      key={member.id ?? `${member.name}-${index}`}
                      value={member.name}
                    >
                      {member.name}
                      {member.role ? ` â€” ${member.role}` : ""}
                    </option>
                  ))}
              </select>
              {team.length === 0 && (
                <p className="tasks-note">
                  Add team members on the Team page to assign tasks.
                </p>
              )}
            </div>

            <div className="tasks-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="tasks-field"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="tasks-group">
              <label htmlFor="task-due-date">Due Date</label>
              <input
                id="task-due-date"
                className="tasks-field"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>

            <div className="tasks-group">
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                className="tasks-field"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TaskStatus)
                }
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="tasks-modal-actions">
              <button
                className="tasks-cancel"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancel
              </button>

              <button className="tasks-save" onClick={() => void saveTask()} disabled={saving}>
                {saving ? "Saving..." : editingId !== null ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
