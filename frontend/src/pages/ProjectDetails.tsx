
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FolderKanban,
  CheckCircle2,
  Users,
  ListTodo,
  Pencil,
  Plus,
  Trash2,
  X,
  Calendar,
} from "lucide-react";

type Project = {
  id: number;
  name: string;
  category: string;
  progress: number;
  status: string;
  deadline?: string;
  assignedMembers?: string[];
};

type Task = {
  id: number;
  title: string;
  project: string;
  projectId?: number;
  priority: string;
  status: string;
  assignedTo?: string;
  dueDate?: string;
};

type TeamMember = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
};

type ProjectDetailsProps = {
  projectId: number;
  onBack: () => void;
};

const styles = `
  * { box-sizing: border-box; }

  .pd-page {
    min-height: 100vh;
    background: #f5f6fa;
    color: #20243a;
    font-family: Arial, Helvetica, sans-serif;
  }

  .pd-header {
    background: #171a2e;
    color: white;
    padding: 24px 35px;
  }

  .pd-header-inner {
    max-width: 1200px;
    margin: auto;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .pd-back {
    width: 42px;
    height: 42px;
    border: 1px solid #454963;
    background: transparent;
    color: white;
    border-radius: 8px;
    display: grid;
    place-items: center;
    cursor: pointer;
    flex-shrink: 0;
  }

  .pd-back:hover { background: #303452; }

  .pd-header h1 { margin: 0; font-size: 26px; }
  .pd-header p { margin: 7px 0 0; color: #aeb1c2; }

  .pd-content {
    max-width: 1200px;
    margin: auto;
    padding: 30px 35px;
  }

  .pd-card {
    background: white;
    border: 1px solid #e7e7ee;
    border-radius: 13px;
    padding: 23px;
    margin-bottom: 20px;
  }

  .pd-project-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    flex-wrap: wrap;
  }

  .pd-project-name {
    margin: 0 0 10px;
    font-size: 25px;
    overflow-wrap: anywhere;
  }

  .pd-muted { color: #85899a; font-size: 13px; }

  .pd-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 10px;
  }

  .pd-badge {
    padding: 6px 10px;
    border-radius: 20px;
    background: #f0efff;
    color: #625cf5;
    font-size: 12px;
  }

  .pd-status {
    background: #eefaf2;
    color: #36925a;
  }

  .pd-button {
    border: none;
    background: #625cf5;
    color: white;
    padding: 11px 15px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
  }

  .pd-button:hover { background: #514bea; }

  .pd-button-secondary {
    background: white;
    color: #454963;
    border: 1px solid #dddde6;
  }

  .pd-button-secondary:hover { background: #f5f5fa; }

  .pd-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  .pd-stat {
    background: white;
    border: 1px solid #e7e7ee;
    border-radius: 12px;
    padding: 20px;
    min-width: 0;
  }

  .pd-stat-label {
    color: #85899a;
    font-size: 13px;
    margin: 0 0 9px;
  }

  .pd-stat-value { margin: 0; font-size: 27px; }

  .pd-progress-track {
    height: 9px;
    background: #ececf4;
    border-radius: 20px;
    overflow: hidden;
    margin-top: 13px;
  }

  .pd-progress-fill {
    height: 100%;
    background: #625cf5;
    border-radius: 20px;
    transition: width .25s ease;
  }

  .pd-section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }

  .pd-section-head h2 { margin: 0; font-size: 19px; }

  .pd-task-list { display: flex; flex-direction: column; gap: 11px; }

  .pd-task {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    border: 1px solid #ececf2;
    border-radius: 10px;
  }

  .pd-task-check {
    background: transparent;
    border: none;
    padding: 0;
    display: flex;
    cursor: pointer;
    flex-shrink: 0;
    color: #85899a;
  }

  .pd-task-check.done { color: #625cf5; }

  .pd-task-info { flex: 1; min-width: 0; }

  .pd-task-title {
    margin: 0;
    font-size: 14px;
    overflow-wrap: anywhere;
  }

  .pd-task-title.done {
    text-decoration: line-through;
    color: #999cab;
  }

  .pd-task-meta {
    margin-top: 6px;
    color: #85899a;
    font-size: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 13px;
  }

  .pd-task-actions { display: flex; gap: 7px; }

  .pd-icon-button {
    width: 33px;
    height: 33px;
    border: none;
    border-radius: 7px;
    display: grid;
    place-items: center;
    cursor: pointer;
  }

  .pd-edit { background: #f0efff; color: #625cf5; }
  .pd-delete { background: #fff1f1; color: #e05252; }

  .pd-members {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .pd-member {
    flex: 1 1 210px;
    min-width: 0;
    padding: 15px;
    border: 1px solid #ececf2;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pd-avatar {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #f0efff;
    color: #625cf5;
    display: grid;
    place-items: center;
    font-weight: bold;
  }

  .pd-member-name { margin: 0 0 5px; font-size: 14px; }
  .pd-member-role { margin: 0; color: #85899a; font-size: 12px; }

  .pd-empty {
    text-align: center;
    padding: 35px 15px;
    color: #85899a;
  }

  .pd-empty h3 { color: #20243a; margin-bottom: 7px; }

  .pd-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 18, 35, .58);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 18px;
    z-index: 1000;
  }

  .pd-modal {
    width: 100%;
    max-width: 530px;
    max-height: 92vh;
    overflow-y: auto;
    background: white;
    color: #20243a;
    border-radius: 14px;
    padding: 24px;
  }

  .pd-modal-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 22px;
  }

  .pd-modal-head h2 { margin: 0; font-size: 21px; }

  .pd-close {
    width: 34px;
    height: 34px;
    border: none;
    background: #f1f1f5;
    border-radius: 7px;
    display: grid;
    place-items: center;
    cursor: pointer;
  }

  .pd-group { margin-bottom: 16px; }

  .pd-group label {
    display: block;
    margin-bottom: 7px;
    font-size: 13px;
    font-weight: bold;
  }

  .pd-field {
    width: 100%;
    padding: 12px;
    border: 1px solid #dddde6;
    border-radius: 8px;
    outline: none;
    background: white;
    color: #20243a;
  }

  .pd-field:focus { border-color: #625cf5; }

  .pd-member-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 180px;
    overflow-y: auto;
    padding: 12px;
    border: 1px solid #e7e7ee;
    border-radius: 8px;
  }

  .pd-member-option {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 13px;
    cursor: pointer;
  }

  .pd-member-option input { accent-color: #625cf5; }

  .pd-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 22px;
  }

  .pd-error {
    padding: 35px;
    text-align: center;
    color: #85899a;
  }

  @media (max-width: 800px) {
    .pd-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 600px) {
    .pd-header { padding: 20px; }
    .pd-content { padding: 20px; }
    .pd-card { padding: 17px; }
    .pd-stats { gap: 10px; }
    .pd-stat { padding: 15px; }
    .pd-stat-value { font-size: 23px; }
    .pd-task { flex-wrap: wrap; }
    .pd-task-actions { margin-left: auto; }
    .pd-project-name { font-size: 21px; }
  }
`;

export default function ProjectDetails({
  projectId,
  onBack,
}: ProjectDetailsProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const [projectName, setProjectName] = useState("");
  const [category, setCategory] = useState("Development");
  const [projectStatus, setProjectStatus] = useState("Planning");
  const [deadline, setDeadline] = useState("");
  const [assignedMembers, setAssignedMembers] = useState<string[]>([]);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskStatus, setTaskStatus] = useState("Pending");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  useEffect(() => {
    loadAll();
  }, [projectId]);

  const readArray = <T,>(key: string): T[] => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const data: unknown = JSON.parse(raw);
      return Array.isArray(data) ? (data as T[]) : [];
    } catch {
      return [];
    }
  };

  const loadAll = () => {
    const savedProjects = readArray<Project>("cisco-nexus-projects");
    const found = savedProjects.find(
      (item) => Number(item.id) === Number(projectId)
    );

    setProject(found ?? null);
    setTasks(readArray<Task>("cisco-nexus-tasks"));
    setTeam(readArray<TeamMember>("cisco-nexus-team"));
  };

  const projectTasks = tasks.filter((task) => {
    if (task.projectId != null) {
      return Number(task.projectId) === Number(projectId);
    }

    return task.project === project?.name;
  });

  const completedTasks = projectTasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const calculatedProgress =
    projectTasks.length > 0
      ? Math.round((completedTasks / projectTasks.length) * 100)
      : project?.progress ?? 0;

  const saveProjectChanges = () => {
    if (!projectName.trim()) {
      alert("Please enter a project name.");
      return;
    }

    const updatedProjects = readArray<Project>("cisco-nexus-projects");
    const updatedProject = updatedProjects.map((item) =>
      Number(item.id) === Number(projectId)
        ? {
            ...item,
            name: projectName.trim(),
            category,
            status: projectStatus,
            deadline,
            assignedMembers,
            progress: calculatedProgress,
          }
        : item
    );

    localStorage.setItem(
      "cisco-nexus-projects",
      JSON.stringify(updatedProject)
    );

    // Keep older tasks linked by project name working after a rename.
    const updatedTasks = readArray<Task>("cisco-nexus-tasks").map(
      (task) => {
        const belongsToProject =
          task.projectId != null
            ? Number(task.projectId) === Number(projectId)
            : task.project === project?.name;

        return belongsToProject
          ? {
              ...task,
              project: projectName.trim(),
              projectId,
            }
          : task;
      }
    );

    localStorage.setItem(
      "cisco-nexus-tasks",
      JSON.stringify(updatedTasks)
    );

    setProject({
      ...project!,
      name: projectName.trim(),
      category,
      status: projectStatus,
      deadline,
      assignedMembers,
      progress: calculatedProgress,
    });

    setTasks(updatedTasks);
    setShowProjectModal(false);
  };

  const openProjectEditor = () => {
    if (!project) return;

    setProjectName(project.name);
    setCategory(project.category || "Development");
    setProjectStatus(project.status || "Planning");
    setDeadline(project.deadline || "");
    setAssignedMembers(project.assignedMembers || []);
    setShowProjectModal(true);
    setTeam(readArray<TeamMember>("cisco-nexus-team"));
  };

  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskPriority("Medium");
    setTaskStatus("Pending");
    setTaskAssignee("");
    setTaskDueDate("");
    setEditingTaskId(null);
  };

  const openNewTask = () => {
    resetTaskForm();
    setTeam(readArray<TeamMember>("cisco-nexus-team"));
    setShowTaskModal(true);
  };

  const openTaskEditor = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskPriority(task.priority || "Medium");
    setTaskStatus(task.status || "Pending");
    setTaskAssignee(task.assignedTo || "");
    setTaskDueDate(task.dueDate || "");
    setTeam(readArray<TeamMember>("cisco-nexus-team"));
    setShowTaskModal(true);
  };

  const saveTask = () => {
    if (!taskTitle.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (!project) return;

    const currentTasks = readArray<Task>("cisco-nexus-tasks");

    const updatedTask: Task = {
      id: editingTaskId ?? Date.now(),
      title: taskTitle.trim(),
      project: project.name,
      projectId,
      priority: taskPriority,
      status: taskStatus,
      assignedTo: taskAssignee,
      dueDate: taskDueDate,
    };

    const updatedTasks =
      editingTaskId !== null
        ? currentTasks.map((task) =>
            task.id === editingTaskId ? updatedTask : task
          )
        : [...currentTasks, updatedTask];

    localStorage.setItem(
      "cisco-nexus-tasks",
      JSON.stringify(updatedTasks)
    );

    setTasks(updatedTasks);
    setShowTaskModal(false);
    resetTaskForm();
  };

  const toggleTask = (task: Task) => {
    const nextStatus =
      task.status === "Completed" ? "Pending" : "Completed";

    const updatedTasks = readArray<Task>("cisco-nexus-tasks").map(
      (item) =>
        item.id === task.id
          ? { ...item, status: nextStatus }
          : item
    );

    localStorage.setItem(
      "cisco-nexus-tasks",
      JSON.stringify(updatedTasks)
    );

    setTasks(updatedTasks);
  };

  const deleteTask = (taskId: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    const updatedTasks = readArray<Task>("cisco-nexus-tasks").filter(
      (task) => task.id !== taskId
    );

    localStorage.setItem(
      "cisco-nexus-tasks",
      JSON.stringify(updatedTasks)
    );

    setTasks(updatedTasks);
  };

  const toggleAssignedMember = (name: string) => {
    setAssignedMembers((current) =>
      current.includes(name)
        ? current.filter((member) => member !== name)
        : [...current, name]
    );
  };

  const closeProjectModal = () => setShowProjectModal(false);

  const closeTaskModal = () => {
    setShowTaskModal(false);
    resetTaskForm();
  };

  if (!project) {
    return (
      <div className="pd-page">
        <style>{styles}</style>
        <header className="pd-header">
          <div className="pd-header-inner">
            <button className="pd-back" onClick={onBack}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1>Project Details</h1>
              <p>Project not found</p>
            </div>
          </div>
        </header>
        <div className="pd-error">
          <FolderKanban size={45} />
          <h2>This project could not be found.</h2>
          <p>It may have been deleted or moved.</p>
          <button className="pd-button" onClick={onBack}>
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-page">
      <style>{styles}</style>

      <header className="pd-header">
        <div className="pd-header-inner">
          <button
            className="pd-back"
            onClick={onBack}
            aria-label="Back to projects"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1>Project Details</h1>
            <p>Manage your project, tasks and team</p>
          </div>
        </div>
      </header>

      <main className="pd-content">
        <section className="pd-card">
          <div className="pd-project-head">
            <div>
              <h2 className="pd-project-name">{project.name}</h2>
              <div className="pd-muted">
                {project.deadline
                  ? `Deadline: ${project.deadline}`
                  : "No deadline set"}
              </div>

              <div className="pd-badges">
                <span className="pd-badge">{project.category}</span>
                <span className="pd-badge pd-status">
                  {project.status}
                </span>
              </div>
            </div>

            <button
              className="pd-button"
              onClick={openProjectEditor}
            >
              <Pencil size={16} />
              Edit Project
            </button>
          </div>

          <div style={{ marginTop: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <strong>Project Progress</strong>
              <strong>{calculatedProgress}%</strong>
            </div>

            <div className="pd-progress-track">
              <div
                className="pd-progress-fill"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, calculatedProgress)
                  )}%`,
                }}
              />
            </div>
          </div>
        </section>

        <section className="pd-stats">
          <div className="pd-stat">
            <p className="pd-stat-label">Total Tasks</p>
            <h2 className="pd-stat-value">{projectTasks.length}</h2>
          </div>

          <div className="pd-stat">
            <p className="pd-stat-label">Completed Tasks</p>
            <h2 className="pd-stat-value">{completedTasks}</h2>
          </div>

          <div className="pd-stat">
            <p className="pd-stat-label">Remaining Tasks</p>
            <h2 className="pd-stat-value">
              {projectTasks.length - completedTasks}
            </h2>
          </div>

          <div className="pd-stat">
            <p className="pd-stat-label">Team Members</p>
            <h2 className="pd-stat-value">
              {(project.assignedMembers || []).length}
            </h2>
          </div>
        </section>

        <section className="pd-card">
          <div className="pd-section-head">
            <h2>
              <ListTodo
                size={19}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              Project Tasks
            </h2>

            <button className="pd-button" onClick={openNewTask}>
              <Plus size={17} />
              Add Task
            </button>
          </div>

          {projectTasks.length === 0 ? (
            <div className="pd-empty">
              <ListTodo size={40} color="#625cf5" />
              <h3>No tasks yet</h3>
              <p>Create a task to start tracking project progress.</p>
            </div>
          ) : (
            <div className="pd-task-list">
              {projectTasks.map((task) => (
                <div className="pd-task" key={task.id}>
                  <button
                    className={`pd-task-check ${
                      task.status === "Completed" ? "done" : ""
                    }`}
                    onClick={() => toggleTask(task)}
                    title="Toggle task completion"
                    aria-label={`Toggle ${task.title}`}
                  >
                    {task.status === "Completed" ? (
                      <CheckCircle2 size={23} />
                    ) : (
                      <CheckCircle2
                        size={23}
                        color="#b8bac8"
                      />
                    )}
                  </button>

                  <div className="pd-task-info">
                    <h3
                      className={`pd-task-title ${
                        task.status === "Completed" ? "done" : ""
                      }`}
                    >
                      {task.title}
                    </h3>

                    <div className="pd-task-meta">
                      <span>{task.status}</span>
                      <span>{task.priority || "Medium"} Priority</span>
                      {task.assignedTo && (
                        <span>
                          <Users size={13} />
                          {task.assignedTo}
                        </span>
                      )}
                      {task.dueDate && (
                        <span>
                          <Calendar size={13} />
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pd-task-actions">
                    <button
                      className="pd-icon-button pd-edit"
                      onClick={() => openTaskEditor(task)}
                      title="Edit task"
                      aria-label={`Edit ${task.title}`}
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      className="pd-icon-button pd-delete"
                      onClick={() => deleteTask(task.id)}
                      title="Delete task"
                      aria-label={`Delete ${task.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="pd-card">
          <div className="pd-section-head">
            <h2>
              <Users
                size={19}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              Assigned Team
            </h2>

            <button
              className="pd-button pd-button-secondary"
              onClick={openProjectEditor}
            >
              <Pencil size={15} />
              Manage Team
            </button>
          </div>

          {(project.assignedMembers || []).length === 0 ? (
            <div className="pd-empty">
              <Users size={38} color="#625cf5" />
              <h3>No team members assigned</h3>
              <p>Use Edit Project to assign team members.</p>
            </div>
          ) : (
            <div className="pd-members">
              {(project.assignedMembers || []).map((name) => {
                const member = team.find(
                  (item) => item.name === name
                );

                return (
                  <div className="pd-member" key={name}>
                    <div className="pd-avatar">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="pd-member-name">{name}</h3>
                      <p className="pd-member-role">
                        {member?.role || "Team Member"}
                      </p>
                      {member?.email && (
                        <p className="pd-member-role">
                          {member.email}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {showProjectModal && (
        <div
          className="pd-overlay"
          onClick={closeProjectModal}
        >
          <div
            className="pd-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pd-modal-head">
              <h2>Edit Project</h2>
              <button
                className="pd-close"
                onClick={closeProjectModal}
                aria-label="Close project editor"
              >
                <X size={18} />
              </button>
            </div>

            <div className="pd-group">
              <label htmlFor="pd-project-name">Project Name</label>
              <input
                id="pd-project-name"
                className="pd-field"
                value={projectName}
                onChange={(event) =>
                  setProjectName(event.target.value)
                }
              />
            </div>

            <div className="pd-group">
              <label htmlFor="pd-category">Category</label>
              <select
                id="pd-category"
                className="pd-field"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option>Development</option>
                <option>Design</option>
                <option>Marketing</option>
                <option>Infrastructure</option>
                <option>Research</option>
                <option>Other</option>
              </select>
            </div>

            <div className="pd-group">
              <label htmlFor="pd-status">Status</label>
              <select
                id="pd-status"
                className="pd-field"
                value={projectStatus}
                onChange={(event) =>
                  setProjectStatus(event.target.value)
                }
              >
                <option>Planning</option>
                <option>In Progress</option>
                <option>On Hold</option>
                <option>Completed</option>
              </select>
            </div>

            <div className="pd-group">
              <label htmlFor="pd-deadline">Deadline</label>
              <input
                id="pd-deadline"
                type="date"
                className="pd-field"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />
            </div>

            <div className="pd-group">
              <label>Assign Team Members</label>

              {team.length === 0 ? (
                <p className="pd-muted">
                  No team members found. Add members on the Team page
                  first.
                </p>
              ) : (
                <div className="pd-member-options">
                  {team
                    .filter((member) => member.name)
                    .map((member, index) => (
                      <label
                        className="pd-member-option"
                        key={member.id ?? `${member.name}-${index}`}
                      >
                        <input
                          type="checkbox"
                          checked={assignedMembers.includes(
                            member.name || ""
                          )}
                          onChange={() =>
                            toggleAssignedMember(member.name || "")
                          }
                        />
                        <span>
                          {member.name}
                          {member.role ? ` — ${member.role}` : ""}
                        </span>
                      </label>
                    ))}
                </div>
              )}
            </div>

            <div className="pd-modal-actions">
              <button
                className="pd-button pd-button-secondary"
                onClick={closeProjectModal}
              >
                Cancel
              </button>
              <button
                className="pd-button"
                onClick={saveProjectChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="pd-overlay" onClick={closeTaskModal}>
          <div
            className="pd-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pd-modal-head">
              <h2>
                {editingTaskId !== null ? "Edit Task" : "Add Project Task"}
              </h2>
              <button
                className="pd-close"
                onClick={closeTaskModal}
                aria-label="Close task editor"
              >
                <X size={18} />
              </button>
            </div>

            <div className="pd-group">
              <label htmlFor="pd-task-title">Task Title</label>
              <input
                id="pd-task-title"
                className="pd-field"
                placeholder="Enter task title"
                value={taskTitle}
                onChange={(event) =>
                  setTaskTitle(event.target.value)
                }
              />
            </div>

            <div className="pd-group">
              <label htmlFor="pd-task-assignee">Assign to Team Member</label>
              <select
                id="pd-task-assignee"
                className="pd-field"
                value={taskAssignee}
                onChange={(event) =>
                  setTaskAssignee(event.target.value)
                }
              >
                <option value="">Unassigned</option>
                {team
                  .filter(
                    (member) =>
                      member.name &&
                      (project.assignedMembers || []).includes(
                        member.name
                      )
                  )
                  .map((member, index) => (
                    <option
                      key={member.id ?? `${member.name}-${index}`}
                      value={member.name}
                    >
                      {member.name}
                    </option>
                  ))}
              </select>
              <p className="pd-muted">
                Assign team members to this project first to show them here.
              </p>
            </div>

            <div className="pd-group">
              <label htmlFor="pd-task-priority">Priority</label>
              <select
                id="pd-task-priority"
                className="pd-field"
                value={taskPriority}
                onChange={(event) =>
                  setTaskPriority(event.target.value)
                }
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div className="pd-group">
              <label htmlFor="pd-task-status">Status</label>
              <select
                id="pd-task-status"
                className="pd-field"
                value={taskStatus}
                onChange={(event) =>
                  setTaskStatus(event.target.value)
                }
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>

            <div className="pd-group">
              <label htmlFor="pd-task-due">Due Date</label>
              <input
                id="pd-task-due"
                type="date"
                className="pd-field"
                value={taskDueDate}
                onChange={(event) =>
                  setTaskDueDate(event.target.value)
                }
              />
            </div>

            <div className="pd-modal-actions">
              <button
                className="pd-button pd-button-secondary"
                onClick={closeTaskModal}
              >
                Cancel
              </button>
              <button className="pd-button" onClick={saveTask}>
                {editingTaskId !== null ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
