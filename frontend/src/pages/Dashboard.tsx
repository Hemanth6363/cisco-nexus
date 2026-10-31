
import { useEffect, useState } from "react";
import {
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Plus,
  ArrowUpRight,
  TrendingUp,
  CircleAlert,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type DashboardProps = {
  onNavigateToProjects: () => void;
  onNavigateToTasks: () => void;
  onNavigateToTeam: () => void;
  onNavigateToReports: () => void;
  onNavigateToSettings: () => void;
};

type Project = {
  project_id: number;
  project_name: string;
  total_tasks: number;
  completed_tasks: number;
  progress: number;
};

type Task = {
  id: number;
  title: string;
  status: string | null;
  due_date?: string | null;
  priority?: string | null;
};

type TeamMember = {
  id: number;
  name: string;
};

function Dashboard({ onNavigateToProjects }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      setLoadError("");

      try {
        const [projectsResult, tasksResult, teamResult] =
          await Promise.all([
            supabase
              .from("project_progress")
              .select(
                "project_id, project_name, total_tasks, completed_tasks, progress"
              )
              .order("project_id", { ascending: true }),

            supabase
              .from("tasks")
              .select("id, title, status, due_date, priority"),

            supabase
              .from("team_members")
              .select("id, name"),
          ]);

        if (!active) return;

        const error =
          projectsResult.error ||
          tasksResult.error ||
          teamResult.error;

        if (error) {
          setLoadError(error.message);
          return;
        }

        setProjects(
          (projectsResult.data ?? []).map((project) => ({
            project_id: Number(project.project_id),
            project_name: project.project_name ?? "Untitled project",
            total_tasks: Number(project.total_tasks ?? 0),
            completed_tasks: Number(project.completed_tasks ?? 0),
            progress: Math.max(
              0,
              Math.min(100, Number(project.progress ?? 0))
            ),
          }))
        );

        setTasks((tasksResult.data ?? []) as Task[]);
        setTeam((teamResult.data ?? []) as TeamMember[]);
        setLastUpdated(new Date());
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "An unexpected error occurred."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    setLoading(true);
    void loadDashboardData();

    // Refresh automatically every 15 seconds.
    const interval = window.setInterval(() => {
      void loadDashboardData();
    }, 15000);

    // Refresh when the user returns to the browser tab.
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadDashboardData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  const completedTasks = tasks.filter(
    (task) => task.status?.toLowerCase() === "completed"
  ).length;

  const productivity =
    tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date) return false;
    if (task.status?.toLowerCase() === "completed") return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(`${task.due_date}T00:00:00`);
    return dueDate < today;
  });

  const riskyProjects = projects.filter((project) => {
    const hasOverdueTask = tasks.some((task) => {
      if (!task.due_date) return false;
      if (task.status?.toLowerCase() === "completed") return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return new Date(`${task.due_date}T00:00:00`) < today;
    });

    return (
      project.total_tasks > 0 &&
      project.progress < 30 &&
      hasOverdueTask
    );
  });

  const recentProjects = [...projects]
    .sort((a, b) => b.project_id - a.project_id)
    .slice(0, 4);

  const styles = `
    .dashboard-content {
      width: 100%;
      min-width: 0;
      color: var(--app-text, #172b4d);
      font-family: inherit;
    }

    .dashboard-content * { box-sizing: border-box; }

    .dashboard-content .dash-welcome,
    .dashboard-content .stat-card,
    .dashboard-content .projects-card,
    .dashboard-content .risk-card {
      background: var(--app-surface, #fff);
      color: var(--app-text, #172b4d);
      border: 1px solid var(--app-border, #e2e8f0);
      border-radius: 14px;
      box-shadow: var(--app-shadow, 0 2px 8px rgba(16,36,58,.04));
    }

    .dashboard-content .dash-welcome {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
      padding: 26px;
      margin-bottom: 24px;
    }

    .dashboard-content .dash-eyebrow {
      margin: 0 0 8px;
      color: var(--app-primary, #049fd9);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
    }

    .dashboard-content h2,
    .dashboard-content h3 {
      color: var(--app-text, #172b4d);
    }

    .dashboard-content .dash-welcome h2 {
      margin: 0;
      font-size: 27px;
      font-weight: 750;
    }

    .dashboard-content .dash-subtitle,
    .dashboard-content .projects-description {
      color: var(--app-muted, #64748b);
      font-size: 14px;
      line-height: 1.6;
    }

    .dashboard-content .create-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      padding: 12px 17px;
      border: none;
      border-radius: 8px;
      background: var(--app-primary, #049fd9);
      color: #fff;
      font-size: 14px;
      font-weight: 650;
      cursor: pointer;
    }

    .dashboard-content .create-button:hover { filter: brightness(.92); }

    .dashboard-content .dashboard-message,
    .dashboard-content .risk-card {
      padding: 16px;
      margin-bottom: 20px;
    }

    .dashboard-content .dashboard-message {
      display: flex;
      gap: 10px;
      overflow-wrap: anywhere;
      border: 1px solid #f5b7b7;
      border-radius: 10px;
      background: #fff1f2;
      color: #a52c2c;
    }

    .dashboard-content .risk-card {
      border-color: #f5c26b;
      background: var(--app-surface, #fff);
    }

    .dashboard-content .risk-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .dashboard-content .stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 18px;
      margin-bottom: 24px;
    }

    .dashboard-content .stat-card {
      min-width: 0;
      padding: 22px;
      transition: transform .2s;
    }

    .dashboard-content .stat-card:hover {
      transform: translateY(-2px);
    }

    .dashboard-content .stat-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 43px;
      height: 43px;
      margin-bottom: 19px;
      border-radius: 11px;
      background: var(--app-surface-alt, #e8f6fc);
      color: var(--app-primary, #049fd9);
    }

    .dashboard-content .stat-title {
      margin-bottom: 8px;
      color: var(--app-muted, #64748b);
      font-size: 13px;
    }

    .dashboard-content .stat-value {
      color: var(--app-text, #172b4d);
      font-size: 31px;
      font-weight: 750;
    }

    .dashboard-content .stat-footnote {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 13px;
      color: var(--app-muted, #64748b);
      font-size: 11px;
    }

    .dashboard-content .stat-footnote svg {
      color: #0f9f78;
      flex-shrink: 0;
    }

    .dashboard-content .projects-card { padding: 25px; }

    .dashboard-content .projects-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .dashboard-content .projects-header h3 {
      margin: 0;
      font-size: 19px;
    }

    .dashboard-content .projects-description {
      margin-bottom: 17px;
      font-size: 13px;
    }

    .dashboard-content .view-all {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 8px;
      border: none;
      background: transparent;
      color: var(--app-primary, #049fd9);
      font-weight: 650;
      cursor: pointer;
    }

    .dashboard-content .project-row {
      padding: 18px 0;
      border-bottom: 1px solid var(--app-border, #e2e8f0);
    }

    .dashboard-content .project-row:last-child {
      border-bottom: none;
    }

    .dashboard-content .project-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 13px;
    }

    .dashboard-content .project-name {
      color: var(--app-text, #172b4d);
      font-size: 14px;
      font-weight: 650;
      overflow-wrap: anywhere;
    }

    .dashboard-content .project-category {
      margin-top: 5px;
      color: var(--app-muted, #64748b);
      font-size: 12px;
    }

    .dashboard-content .status {
      display: inline-flex;
      padding: 6px 10px;
      border-radius: 20px;
      background: var(--app-surface-alt, #edf8fd);
      color: var(--app-primary, #087eae);
      font-size: 11px;
      font-weight: 650;
      white-space: nowrap;
    }

    .dashboard-content .progress-label-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 7px;
      color: var(--app-muted, #64748b);
      font-size: 11px;
    }

    .dashboard-content .progress-background {
      height: 7px;
      overflow: hidden;
      border-radius: 20px;
      background: var(--app-border, #edf2f7);
    }

    .dashboard-content .progress-bar {
      height: 100%;
      border-radius: 20px;
      background: var(--app-primary, #049fd9);
      transition: width .3s ease;
    }

    .dashboard-content .empty-projects {
      padding: 35px 12px;
      color: var(--app-muted, #64748b);
      text-align: center;
      font-size: 14px;
    }

    .dashboard-content .updated-time {
      margin: 0 0 16px;
      color: var(--app-muted, #64748b);
      font-size: 12px;
    }

    @media (max-width: 1100px) {
      .dashboard-content .stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 600px) {
      .dashboard-content .stats { gap: 12px; }
      .dashboard-content .stat-card { padding: 16px; }
      .dashboard-content .stat-value { font-size: 26px; }
      .dashboard-content .dash-welcome { padding: 20px; }
      .dashboard-content .dash-welcome h2 { font-size: 23px; }
      .dashboard-content .create-button { width: 100%; }
      .dashboard-content .projects-card { padding: 18px; }
      .dashboard-content .project-top { flex-wrap: wrap; }
    }
  `;

  return (
    <div className="dashboard-content">
      <style>{styles}</style>

      <section className="dash-welcome">
        <div>
          <p className="dash-eyebrow">Workspace overview</p>
          <h2>Dashboard</h2>
          <p className="dash-subtitle">
            Welcome back! Here's your live project overview.
          </p>
        </div>

        <button
          className="create-button"
          type="button"
          onClick={onNavigateToProjects}
        >
          <Plus size={17} />
          Create Project
        </button>
      </section>

      {lastUpdated && (
        <p className="updated-time">
          Last refreshed: {lastUpdated.toLocaleTimeString()}
          {" · "}Refreshes every 15 seconds
        </p>
      )}

      {loadError && (
        <div className="dashboard-message" role="alert">
          <CircleAlert size={18} />
          <span>
            Could not load dashboard data: {loadError}.
            Check your Supabase view permissions and table policies.
          </span>
        </div>
      )}

      {!loading && (overdueTasks.length > 0 || riskyProjects.length > 0) && (
        <section className="risk-card" aria-label="Project risk alerts">
          <div className="risk-title">
            <CircleAlert size={19} />
            Project Risk Alerts
          </div>

          {overdueTasks.length > 0 && (
            <p>
              <strong>{overdueTasks.length}</strong> overdue task(s) need
              attention. Review their due dates and status.
            </p>
          )}

          {riskyProjects.length > 0 && (
            <p>
              <strong>{riskyProjects.length}</strong> project(s) have low
              progress and may need intervention.
            </p>
          )}

          <p>
            <small>
              These are rule-based alerts using task deadlines and
              project progress, not an external AI model.
            </small>
          </p>
        </section>
      )}

      <section className="stats" aria-label="Workspace statistics">
        <div className="stat-card">
          <div className="stat-icon-wrap"><FolderKanban size={22} /></div>
          <div className="stat-title">Total Projects</div>
          <div className="stat-value">{loading ? "—" : projects.length}</div>
          <div className="stat-footnote">
            <TrendingUp size={13} />
            <span>Across your workspace</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap"><CheckSquare size={22} /></div>
          <div className="stat-title">Tasks Completed</div>
          <div className="stat-value">{loading ? "—" : completedTasks}</div>
          <div className="stat-footnote">
            <TrendingUp size={13} />
            <span>Tasks marked completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap"><Users size={22} /></div>
          <div className="stat-title">Team Members</div>
          <div className="stat-value">{loading ? "—" : team.length}</div>
          <div className="stat-footnote">
            <TrendingUp size={13} />
            <span>People in your team</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap"><BarChart3 size={22} /></div>
          <div className="stat-title">Productivity</div>
          <div className="stat-value">{loading ? "—" : `${productivity}%`}</div>
          <div className="stat-footnote">
            <TrendingUp size={13} />
            <span>Task completion rate</span>
          </div>
        </div>
      </section>

      <section className="projects-card">
        <div className="projects-header">
          <h3>Recent Projects</h3>
          <button
            className="view-all"
            type="button"
            onClick={onNavigateToProjects}
          >
            View all <ArrowUpRight size={16} />
          </button>
        </div>

        <p className="projects-description">
          Progress is calculated from tasks linked to each project.
        </p>

        {loading ? (
          <div className="empty-projects">Loading your projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty-projects">
            <FolderKanban size={40} />
            <p>No projects found.</p>
          </div>
        ) : (
          recentProjects.map((project) => (
            <div className="project-row" key={project.project_id}>
              <div className="project-top">
                <div>
                  <div className="project-name">{project.project_name}</div>
                  <div className="project-category">
                    {project.completed_tasks} of {project.total_tasks} tasks
                    completed
                  </div>
                </div>
                <span className="status">
                  {project.progress === 100
                    ? "Completed"
                    : project.progress > 0
                    ? "In Progress"
                    : "Planning"}
                </span>
              </div>

              <div className="progress-label-row">
                <span>Project progress</span>
                <span>{project.progress}%</span>
              </div>

              <div
                className="progress-background"
                role="progressbar"
                aria-valuenow={project.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${project.project_name} progress`}
              >
                <div
                  className="progress-bar"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default Dashboard;
