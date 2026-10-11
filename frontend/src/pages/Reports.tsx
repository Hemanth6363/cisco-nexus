import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  FolderKanban,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";

type Project = {
  id?: number;
  name?: string;
  title?: string;
  category?: string;
  progress?: number;
  status?: string;
};

type Task = {
  id?: number;
  title?: string;
  name?: string;
  status?: string;
};

type TeamMember = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
};

type ReportsProps = {
  onBack: () => void;
};

export default function Reports({
  onBack,
}: ReportsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const savedProjects = localStorage.getItem(
        "cisco-nexus-projects"
      );

      if (savedProjects) {
        const data = JSON.parse(savedProjects);

        if (Array.isArray(data)) {
          setProjects(data);
        }
      }
    } catch {
      setProjects([]);
    }

    try {
      const savedTasks = localStorage.getItem(
        "cisco-nexus-tasks"
      );

      if (savedTasks) {
        const data = JSON.parse(savedTasks);

        if (Array.isArray(data)) {
          setTasks(data);
        }
      }
    } catch {
      setTasks([]);
    }

    try {
      const savedTeam = localStorage.getItem(
        "cisco-nexus-team"
      );

      if (savedTeam) {
        const data = JSON.parse(savedTeam);

        if (Array.isArray(data)) {
          setTeam(data);
        }
      }
    } catch {
      setTeam([]);
    }
  };

  /* --------------------------------
     PROJECT PROGRESS
  -------------------------------- */

  const getProjectProgress = (
    project: Project
  ) => {
    if (
      project.progress !== undefined &&
      project.progress !== null &&
      !isNaN(Number(project.progress))
    ) {
      return Math.min(
        100,
        Math.max(0, Number(project.progress))
      );
    }

    const status =
      project.status?.toLowerCase();

    if (status === "completed") {
      return 100;
    }

    if (status === "in progress") {
      return 50;
    }

    return 0;
  };

  /* --------------------------------
     TASK CALCULATIONS
  -------------------------------- */

  const completedTasks = tasks.filter(
    (task) =>
      task.status?.toLowerCase() === "completed"
  ).length;

  const pendingTasks = tasks.filter(
    (task) =>
      task.status?.toLowerCase() !== "completed"
  ).length;

  const productivity =
    tasks.length > 0
      ? Math.round(
          (completedTasks / tasks.length) * 100
        )
      : 0;

  /* --------------------------------
     PROJECT CALCULATIONS
  -------------------------------- */

  const completedProjects = projects.filter(
    (project) =>
      project.status?.toLowerCase() ===
        "completed" ||
      getProjectProgress(project) >= 100
  ).length;

  const averageProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce(
            (total, project) =>
              total +
              getProjectProgress(project),
            0
          ) / projects.length
        )
      : 0;

  const activeProjects = projects.filter(
    (project) =>
      getProjectProgress(project) < 100
  ).length;

  return (
    <div className="reports-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

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

        /* HEADER */

        .header {
          background: #171a2e;
          color: white;
          padding: 25px 35px;
        }

        .header-inner {
          max-width: 1250px;
          margin: auto;
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .back-button {
          width: 42px;
          height: 42px;
          border: 1px solid #454963;
          background: transparent;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .back-button:hover {
          background: #303452;
        }

        .header h1 {
          margin: 0;
          font-size: 27px;
        }

        .header p {
          margin: 6px 0 0;
          color: #aeb1c2;
          font-size: 14px;
        }

        /* CONTENT */

        .content {
          max-width: 1250px;
          margin: auto;
          padding: 30px 35px;
        }

        /* STATS */

        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 25px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e7e7ee;
          border-radius: 12px;
          padding: 22px;
        }

        .stat-icon {
          color: #625cf5;
          margin-bottom: 12px;
        }

        .stat-card p {
          color: #85899a;
          margin: 0;
          font-size: 13px;
        }

        .stat-card h2 {
          margin: 9px 0 0;
          font-size: 28px;
        }

        /* REPORT GRID */

        .report-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .card {
          background: white;
          border: 1px solid #e7e7ee;
          border-radius: 12px;
          padding: 25px;
        }

        .card h2 {
          margin: 0 0 20px;
          font-size: 19px;
        }

        /* PROJECT PROGRESS */

        .progress-section {
          margin-bottom: 22px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .progress-background {
          width: 100%;
          height: 10px;
          background: #eeeeF4;
          border-radius: 20px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: #625cf5;
          border-radius: 20px;
          transition: width 0.4s ease;
        }

        /* ROWS */

        .task-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid #eeeeF3;
        }

        .task-row:last-child {
          border-bottom: none;
        }

        .task-label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #55596b;
          font-size: 14px;
        }

        .task-number {
          font-weight: bold;
          font-size: 16px;
        }

        /* PROJECT BREAKDOWN */

        .project-list {
          margin-top: 10px;
        }

        .project-row {
          padding: 15px 0;
          border-bottom: 1px solid #eeeeF3;
        }

        .project-row:last-child {
          border-bottom: none;
        }

        .project-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 8px;
        }

        .project-name {
          font-weight: bold;
          font-size: 14px;
        }

        .project-status {
          color: #625cf5;
          font-size: 12px;
        }

        .project-progress {
          height: 8px;
          background: #eeeeF4;
          border-radius: 20px;
          overflow: hidden;
        }

        .project-progress-bar {
          height: 100%;
          background: #625cf5;
          border-radius: 20px;
          transition: width 0.4s ease;
        }

        .project-percentage {
          margin-top: 6px;
          color: #85899a;
          font-size: 12px;
          text-align: right;
        }

        .empty {
          text-align: center;
          color: #85899a;
          padding: 25px 0;
        }

        /* MOBILE */

        @media (max-width: 950px) {
          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .report-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .header {
            padding: 20px;
          }

          .content {
            padding: 20px;
          }

          .stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HEADER */}

      <header className="header">
        <div className="header-inner">
          <button
            className="back-button"
            onClick={onBack}
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1>Reports</h1>

            <p>
              Analyze your projects, tasks and team
              performance
            </p>
          </div>
        </div>
      </header>

      {/* CONTENT */}

      <main className="content">

        {/* SUMMARY CARDS */}

        <div className="stats">

          <div className="stat-card">
            <FolderKanban
              className="stat-icon"
              size={25}
            />

            <p>Total Projects</p>

            <h2>{projects.length}</h2>
          </div>

          <div className="stat-card">
            <CheckCircle2
              className="stat-icon"
              size={25}
            />

            <p>Completed Projects</p>

            <h2>{completedProjects}</h2>
          </div>

          <div className="stat-card">
            <Users
              className="stat-icon"
              size={25}
            />

            <p>Team Members</p>

            <h2>{team.length}</h2>
          </div>

          <div className="stat-card">
            <BarChart3
              className="stat-icon"
              size={25}
            />

            <p>Productivity</p>

            <h2>{productivity}%</h2>
          </div>

        </div>

        {/* REPORT CARDS */}

        <div className="report-grid">

          {/* OVERALL PROJECT PROGRESS */}

          <div className="card">
            <h2>
              Overall Project Progress
            </h2>

            <div className="progress-section">

              <div className="progress-header">
                <span>
                  Average Project Progress
                </span>

                <strong>
                  {averageProgress}%
                </strong>
              </div>

              <div className="progress-background">
                <div
                  className="progress-bar"
                  style={{
                    width: `${averageProgress}%`,
                  }}
                />
              </div>

            </div>

            <div className="task-row">
              <div className="task-label">
                <FolderKanban size={18} />
                Total Projects
              </div>

              <span className="task-number">
                {projects.length}
              </span>
            </div>

            <div className="task-row">
              <div className="task-label">
                <CheckCircle2 size={18} />
                Completed Projects
              </div>

              <span className="task-number">
                {completedProjects}
              </span>
            </div>

            <div className="task-row">
              <div className="task-label">
                <BarChart3 size={18} />
                Active Projects
              </div>

              <span className="task-number">
                {activeProjects}
              </span>
            </div>
          </div>

          {/* TASK PERFORMANCE */}

          <div className="card">
            <h2>Task Performance</h2>

            <div className="task-row">
              <div className="task-label">
                <BarChart3 size={18} />
                Total Tasks
              </div>

              <span className="task-number">
                {tasks.length}
              </span>
            </div>

            <div className="task-row">
              <div className="task-label">
                <CheckCircle2 size={18} />
                Completed Tasks
              </div>

              <span className="task-number">
                {completedTasks}
              </span>
            </div>

            <div className="task-row">
              <div className="task-label">
                <Clock size={18} />
                Pending Tasks
              </div>

              <span className="task-number">
                {pendingTasks}
              </span>
            </div>

            <div className="task-row">
              <div className="task-label">
                <BarChart3 size={18} />
                Completion Rate
              </div>

              <span className="task-number">
                {productivity}%
              </span>
            </div>
          </div>

          {/* PROJECT BREAKDOWN */}

          <div className="card">
            <h2>Project Breakdown</h2>

            {projects.length === 0 ? (
              <div className="empty">
                No projects available.
              </div>
            ) : (
              <div className="project-list">

                {projects.map(
                  (project, index) => {
                    const name =
                      project.name ||
                      project.title ||
                      `Project ${index + 1}`;

                    const progress =
                      getProjectProgress(
                        project
                      );

                    return (
                      <div
                        className="project-row"
                        key={
                          project.id ??
                          `${name}-${index}`
                        }
                      >

                        <div className="project-top">

                          <span className="project-name">
                            {name}
                          </span>

                          <span className="project-status">
                            {project.status ||
                              "Planning"}
                          </span>

                        </div>

                        <div className="project-progress">

                          <div
                            className="project-progress-bar"
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                        <div className="project-percentage">
                          {progress}%
                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}
          </div>

          {/* TEAM OVERVIEW */}

          <div className="card">
            <h2>Team Overview</h2>

            <div className="task-row">
              <div className="task-label">
                <Users size={18} />
                Total Team Members
              </div>

              <span className="task-number">
                {team.length}
              </span>
            </div>

            <div className="task-row">
              <div className="task-label">
                <FolderKanban size={18} />
                Active Projects
              </div>

              <span className="task-number">
                {activeProjects}
              </span>
            </div>

            <div className="task-row">
              <div className="task-label">
                <CheckCircle2 size={18} />
                Completed Tasks
              </div>

              <span className="task-number">
                {completedTasks}
              </span>
            </div>

            <div className="task-row">
              <div className="task-label">
                <BarChart3 size={18} />
                Average Progress
              </div>

              <span className="task-number">
                {averageProgress}%
              </span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}