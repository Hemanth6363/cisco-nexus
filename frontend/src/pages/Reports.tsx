
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  FolderKanban,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type Project = {
  id: number;
  name: string;
  category?: string | null;
  progress?: number | null;
  status?: string | null;
};

type Task = {
  id: number;
  title: string;
  status: string;
};

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type ReportsProps = {
  onBack: () => void;
};

export default function Reports({ onBack }: ReportsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      const [projectsResult, tasksResult, teamResult] =
        await Promise.all([
          supabase
            .from("projects")
            .select("id, name, category, progress, status")
            .order("id", { ascending: false }),

          supabase
            .from("tasks")
            .select("id, title, status")
            .order("id", { ascending: false }),

          supabase
            .from("team_members")
            .select("id, name, email, role")
            .order("id", { ascending: false }),
        ]);

      if (cancelled) return;

      const loadError =
        projectsResult.error ||
        tasksResult.error ||
        teamResult.error;

      if (loadError) {
        console.error("Reports loading error:", loadError.message);
        setError(loadError.message);
        setLoading(false);
        return;
      }

      setProjects((projectsResult.data ?? []) as Project[]);
      setTasks((tasksResult.data ?? []) as Task[]);
      setTeam((teamResult.data ?? []) as TeamMember[]);
      setLoading(false);
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Completed projects always display 100% progress.
  const getProjectProgress = (project: Project): number => {
    const status = project.status?.toLowerCase();

    if (status === "completed") return 100;

    if (
      project.progress !== undefined &&
      project.progress !== null &&
      Number.isFinite(Number(project.progress))
    ) {
      return Math.min(100, Math.max(0, Number(project.progress)));
    }

    if (status === "in progress") return 50;

    return 0;
  };

  const completedTasks = tasks.filter(
    (task) => task.status?.toLowerCase() === "completed"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status?.toLowerCase() === "in progress"
  ).length;

  const pendingTasks = tasks.filter(
    (task) =>
      task.status?.toLowerCase() !== "completed" &&
      task.status?.toLowerCase() !== "in progress"
  ).length;

  const productivity =
    tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

  const completedProjects = projects.filter(
    (project) =>
      project.status?.toLowerCase() === "completed" ||
      getProjectProgress(project) >= 100
  ).length;

  const activeProjects = projects.filter(
    (project) =>
      project.status?.toLowerCase() !== "completed" &&
      getProjectProgress(project) < 100
  ).length;

  const averageProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce(
            (total, project) => total + getProjectProgress(project),
            0
          ) / projects.length
        )
      : 0;

  return (
    <div className="reports-page">
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #f5f6fa;
        }

        .reports-page {
          min-height: 100vh;
          background: #f5f6fa;
          color: #20243a;
        }

        .reports-header {
          background: #171a2e;
          color: white;
          padding: 25px 35px;
        }

        .reports-header-inner {
          max-width: 1250px;
          margin: auto;
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .reports-back-button {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border: 1px solid #454963;
          background: transparent;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .reports-back-button:hover { background: #303452; }

        .reports-header h1 {
          margin: 0;
          font-size: 27px;
        }

        .reports-header p {
          margin: 6px 0 0;
          color: #aeb1c2;
          font-size: 14px;
        }

        .reports-content {
          max-width: 1250px;
          margin: auto;
          padding: 30px 35px;
        }

        .reports-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 25px;
        }

        .reports-stat-card,
        .reports-card {
          background: white;
          border: 1px solid #e7e7ee;
          border-radius: 12px;
          padding: 22px;
          min-width: 0;
        }

        .reports-stat-icon {
          color: #625cf5;
          margin-bottom: 12px;
        }

        .reports-stat-card p {
          color: #85899a;
          margin: 0;
          font-size: 13px;
        }

        .reports-stat-card h2 {
          margin: 9px 0 0;
          font-size: 28px;
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .reports-card h2 {
          margin: 0 0 20px;
          font-size: 19px;
        }

        .reports-progress-section { margin-bottom: 22px; }

        .reports-progress-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .reports-progress-background,
        .reports-project-progress {
          width: 100%;
          height: 10px;
          background: #eeeeF4;
          border-radius: 20px;
          overflow: hidden;
        }

        .reports-progress-bar,
        .reports-project-progress-bar {
          height: 100%;
          background: #625cf5;
          border-radius: 20px;
          transition: width .3s ease;
        }

        .reports-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid #eeeeF3;
        }

        .reports-row:last-child { border-bottom: none; }

        .reports-row-label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #55596b;
          font-size: 14px;
        }

        .reports-row-number {
          font-weight: bold;
          font-size: 16px;
          flex-shrink: 0;
        }

        .reports-project-list { margin-top: 10px; }

        .reports-project-row {
          padding: 15px 0;
          border-bottom: 1px solid #eeeeF3;
        }

        .reports-project-row:last-child { border-bottom: none; }

        .reports-project-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 8px;
        }

        .reports-project-name {
          font-weight: bold;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .reports-project-status {
          color: #625cf5;
          font-size: 12px;
          text-align: right;
        }

        .reports-project-progress { height: 8px; }

        .reports-project-percentage {
          margin-top: 6px;
          color: #85899a;
          font-size: 12px;
          text-align: right;
        }

        .reports-empty {
          text-align: center;
          color: #85899a;
          padding: 25px 0;
        }

        .reports-error {
          background: #fff1f1;
          border: 1px solid #f3caca;
          color: #a52c2c;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 20px;
          overflow-wrap: anywhere;
        }

        @media (max-width: 950px) {
          .reports-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .reports-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 600px) {
          .reports-header { padding: 20px; }
          .reports-content { padding: 20px; }
          .reports-stats { grid-template-columns: 1fr; }
          .reports-header h1 { font-size: 23px; }
        }
      `}</style>

      <header className="reports-header">
        <div className="reports-header-inner">
          <button
            className="reports-back-button"
            onClick={onBack}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1>Reports</h1>
            <p>Analyze your projects, tasks and team performance</p>
          </div>
        </div>
      </header>

      <main className="reports-content">
        {error && (
          <div className="reports-error">
            <strong>Could not load reports.</strong>
            <p>{error}</p>
            <p>Check your Supabase connection and row-level security policies.</p>
          </div>
        )}

        {loading ? (
          <div className="reports-card">
            <div className="reports-empty">
              Loading report data from Supabase...
            </div>
          </div>
        ) : (
          <>
            <section className="reports-stats">
              <div className="reports-stat-card">
                <FolderKanban className="reports-stat-icon" size={25} />
                <p>Total Projects</p>
                <h2>{projects.length}</h2>
              </div>

              <div className="reports-stat-card">
                <CheckCircle2 className="reports-stat-icon" size={25} />
                <p>Completed Projects</p>
                <h2>{completedProjects}</h2>
              </div>

              <div className="reports-stat-card">
                <Users className="reports-stat-icon" size={25} />
                <p>Team Members</p>
                <h2>{team.length}</h2>
              </div>

              <div className="reports-stat-card">
                <BarChart3 className="reports-stat-icon" size={25} />
                <p>Productivity</p>
                <h2>{productivity}%</h2>
              </div>
            </section>

            <section className="reports-grid">
              <div className="reports-card">
                <h2>Overall Project Progress</h2>

                <div className="reports-progress-section">
                  <div className="reports-progress-header">
                    <span>Average Project Progress</span>
                    <strong>{averageProgress}%</strong>
                  </div>

                  <div className="reports-progress-background">
                    <div
                      className="reports-progress-bar"
                      style={{ width: `${averageProgress}%` }}
                    />
                  </div>
                </div>

                <div className="reports-row">
                  <div className="reports-row-label">
                    <FolderKanban size={18} />
                    Total Projects
                  </div>
                  <span className="reports-row-number">{projects.length}</span>
                </div>

                <div className="reports-row">
                  <div className="reports-row-label">
                    <CheckCircle2 size={18} />
                    Completed Projects
                  </div>
                  <span className="reports-row-number">{completedProjects}</span>
                </div>

                <div className="reports-row">
                  <div className="reports-row-label">
                    <BarChart3 size={18} />
                    Active Projects
                  </div>
                  <span className="reports-row-number">{activeProjects}</span>
                </div>
              </div>

              <div className="reports-card">
                <h2>Task Performance</h2>

                <div className="reports-row">
                  <div className="reports-row-label">
                    <BarChart3 size={18} />
                    Total Tasks
                  </div>
                  <span className="reports-row-number">{tasks.length}</span>
                </div>

                <div className="reports-row">
                  <div className="reports-row-label">
                    <CheckCircle2 size={18} />
                    Completed Tasks
                  </div>
                  <span className="reports-row-number">{completedTasks}</span>
                </div>

                <div className="reports-row">
                  <div className="reports-row-label">
                    <Clock size={18} />
                    In Progress Tasks
                  </div>
                  <span className="reports-row-number">{inProgressTasks}</span>
                </div>

                <div className="reports-row">
                  <div className="reports-row-label">
                    <Clock size={18} />
                    Pending Tasks
                  </div>
                  <span className="reports-row-number">{pendingTasks}</span>
                </div>

                <div className="reports-row">
                  <div className="reports-row-label">
                    <BarChart3 size={18} />
                    Completion Rate
                  </div>
                  <span className="reports-row-number">{productivity}%</span>
                </div>
              </div>

              <div className="reports-card">
                <h2>Project Breakdown</h2>

                {projects.length === 0 ? (
                  <div className="reports-empty">No projects available.</div>
                ) : (
                  <div className="reports-project-list">
                    {projects.map((project) => {
                      const progress = getProjectProgress(project);

                      return (
                        <div className="reports-project-row" key={project.id}>
                          <div className="reports-project-top">
                            <span className="reports-project-name">
                              {project.name || `Project ${project.id}`}
                            </span>
                            <span className="reports-project-status">
                              {project.status || "Planning"}
                            </span>
                          </div>

                          <div className="reports-project-progress">
                            <div
                              className="reports-project-progress-bar"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <div className="reports-project-percentage">
                            {progress}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="reports-card">
                <h2>Team Overview</h2>

                <div className="reports-row">
                  <div className="reports-row-label">
                    <Users size={18} />
                    Total Team Members
                  </div>
                  <span className="reports-row-number">{team.length}</span>
                </div>

                <div className="reports-row">
                  <div className="reports-row-label">
                    <FolderKanban size={18} />
                    Active Projects
                  </div>
                  <span className="reports-row-number">{activeProjects}</span>
                </div>

                <div className="reports-row">
                  <div className="reports-row-label">
                    <CheckCircle2 size={18} />
                    Completed Tasks
                  </div>
                  <span className="reports-row-number">{completedTasks}</span>
                </div>

                <div className="reports-row">
                  <div className="reports-row-label">
                    <BarChart3 size={18} />
                    Average Progress
                  </div>
                  <span className="reports-row-number">{averageProgress}%</span>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
