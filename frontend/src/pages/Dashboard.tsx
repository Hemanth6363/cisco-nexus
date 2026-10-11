import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  Plus,
  ArrowUpRight,
} from "lucide-react";

type DashboardProps = {
  onNavigateToProjects: () => void;
  onNavigateToTasks: () => void;
  onNavigateToTeam: () => void;
  onNavigateToReports: () => void;
  onNavigateToSettings: () => void;
};

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
  status?: string;
};

type TeamMember = {
  id?: number;
  name?: string;
};

function Dashboard({
  onNavigateToProjects,
  onNavigateToTasks,
  onNavigateToTeam,
  onNavigateToReports,
  onNavigateToSettings,
}: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
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

  const completedTasks = tasks.filter(
    (task) =>
      task.status?.toLowerCase() === "completed"
  ).length;

  const productivity =
    tasks.length > 0
      ? Math.round(
          (completedTasks / tasks.length) * 100
        )
      : 0;

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

  const recentProjects = projects.slice(-3).reverse();

  return (
    <div className="dashboard">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #f5f6fa;
        }

        .dashboard {
          min-height: 100vh;
          display: flex;
          background: #f5f6fa;
          color: #20243a;
        }

        /* SIDEBAR */

        .sidebar {
          width: 270px;
          min-height: 100vh;
          background: #171a2e;
          color: white;
          padding: 28px 20px;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
        }

        .logo {
          font-size: 26px;
          font-weight: bold;
          padding: 5px 12px 38px;
        }

        .logo span {
          color: #625cf5;
        }

        .menu-title {
          color: #8e92a8;
          font-size: 12px;
          margin: 0 12px 12px;
          letter-spacing: 1px;
        }

        .menu {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .menu-button {
          width: 100%;
          border: none;
          background: transparent;
          color: #c4c7d7;
          padding: 14px 14px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 15px;
          cursor: pointer;
          text-align: left;
        }

        .menu-button:hover {
          background: #292d49;
          color: white;
        }

        .menu-button.active {
          background: #343957;
          color: white;
        }

        /* MAIN */

        .main {
          margin-left: 270px;
          width: calc(100% - 270px);
          padding: 32px;
        }

        .top-card {
          background: white;
          border: 1px solid #e7e7ee;
          border-radius: 12px;
          padding: 25px 27px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 27px;
        }

        .top-card h1 {
          margin: 0;
          font-size: 28px;
        }

        .top-card p {
          margin: 7px 0 0;
          color: #85899a;
        }

        .create-button {
          border: none;
          background: #625cf5;
          color: white;
          padding: 13px 18px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .create-button:hover {
          background: #514bea;
        }

        /* STATS */

        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 27px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e7e7ee;
          border-radius: 12px;
          padding: 25px;
        }

        .stat-icon {
          color: #625cf5;
          margin-bottom: 18px;
        }

        .stat-title {
          color: #85899a;
          font-size: 14px;
          margin-bottom: 7px;
        }

        .stat-value {
          font-size: 31px;
          font-weight: bold;
        }

        /* RECENT PROJECTS */

        .projects-card {
          background: white;
          border: 1px solid #e7e7ee;
          border-radius: 12px;
          padding: 27px;
        }

        .projects-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .projects-header h2 {
          margin: 0;
          font-size: 21px;
        }

        .view-all {
          border: none;
          background: transparent;
          color: #625cf5;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          font-size: 14px;
        }

        .project-row {
          padding: 17px 0;
          border-bottom: 1px solid #eeeeF3;
        }

        .project-row:last-child {
          border-bottom: none;
        }

        .project-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 9px;
        }

        .project-name {
          font-weight: bold;
          font-size: 15px;
        }

        .project-category {
          color: #85899a;
          font-size: 13px;
          margin-top: 5px;
        }

        .status {
          background: #efefff;
          color: #625cf5;
          padding: 9px 12px;
          border-radius: 20px;
          font-size: 12px;
          white-space: nowrap;
          height: fit-content;
        }

        .progress-background {
          height: 8px;
          background: #eeeeF4;
          border-radius: 20px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: #625cf5;
          border-radius: 20px;
          transition: width .3s ease;
        }

        .empty-projects {
          padding: 45px 10px;
          text-align: center;
          color: #85899a;
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {
          .stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 750px) {
          .sidebar {
            width: 80px;
            padding: 20px 10px;
          }

          .logo {
            font-size: 0;
            text-align: center;
          }

          .logo::after {
            content: "CN";
            font-size: 20px;
          }

          .menu-title {
            display: none;
          }

          .menu-button {
            justify-content: center;
            padding: 14px;
          }

          .menu-button span {
            display: none;
          }

          .main {
            margin-left: 80px;
            width: calc(100% - 80px);
            padding: 20px;
          }

          .top-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 18px;
          }

          .create-button {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 550px) {
          .stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="logo">
          Cisco <span>Nexus</span>
        </div>

        <div className="menu-title">
          MENU
        </div>

        <nav className="menu">

          <button className="menu-button active">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          <button
            className="menu-button"
            onClick={onNavigateToProjects}
          >
            <FolderKanban size={19} />
            <span>Projects</span>
          </button>

          <button
            className="menu-button"
            onClick={onNavigateToTasks}
          >
            <CheckSquare size={19} />
            <span>Tasks</span>
          </button>

          <button
            className="menu-button"
            onClick={onNavigateToTeam}
          >
            <Users size={19} />
            <span>Team</span>
          </button>

          <button
            className="menu-button"
            onClick={onNavigateToReports}
          >
            <BarChart3 size={19} />
            <span>Reports</span>
          </button>

          <button
            className="menu-button"
            onClick={onNavigateToSettings}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

        </nav>
      </aside>

      {/* MAIN */}

      <main className="main">

        {/* HEADER */}

        <section className="top-card">
          <div>
            <h1>Dashboard</h1>

            <p>
              Welcome back! Here's your project
              overview.
            </p>
          </div>

          <button
            className="create-button"
            onClick={onNavigateToProjects}
          >
            <Plus size={18} />
            Create Project
          </button>
        </section>

        {/* STATISTICS */}

        <section className="stats">

          <div className="stat-card">
            <FolderKanban
              className="stat-icon"
              size={31}
            />

            <div className="stat-title">
              Total Projects
            </div>

            <div className="stat-value">
              {projects.length}
            </div>
          </div>

          <div className="stat-card">
            <CheckSquare
              className="stat-icon"
              size={31}
            />

            <div className="stat-title">
              Tasks Completed
            </div>

            <div className="stat-value">
              {completedTasks}
            </div>
          </div>

          <div className="stat-card">
            <Users
              className="stat-icon"
              size={31}
            />

            <div className="stat-title">
              Team Members
            </div>

            <div className="stat-value">
              {team.length}
            </div>
          </div>

          <div className="stat-card">
            <BarChart3
              className="stat-icon"
              size={31}
            />

            <div className="stat-title">
              Productivity
            </div>

            <div className="stat-value">
              {productivity}%
            </div>
          </div>

        </section>

        {/* RECENT PROJECTS */}

        <section className="projects-card">

          <div className="projects-header">
            <h2>Recent Projects</h2>

            <button
              className="view-all"
              onClick={onNavigateToProjects}
            >
              View all
              <ArrowUpRight size={16} />
            </button>
          </div>

          {recentProjects.length === 0 ? (
            <div className="empty-projects">
              <FolderKanban
                size={45}
                color="#625cf5"
              />

              <p>
                No projects yet. Create your first
                project to get started.
              </p>
            </div>
          ) : (
            recentProjects.map(
              (project, index) => {
                const name =
                  project.name ||
                  project.title ||
                  `Project ${index + 1}`;

                const progress =
                  getProjectProgress(project);

                return (
                  <div
                    className="project-row"
                    key={
                      project.id ??
                      `${name}-${index}`
                    }
                  >
                    <div className="project-top">

                      <div>
                        <div className="project-name">
                          {name}
                        </div>

                        <div className="project-category">
                          {project.category ||
                            "General"}
                        </div>
                      </div>

                      <div className="status">
                        {project.status ||
                          "Planning"}
                      </div>

                    </div>

                    <div className="progress-background">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )
          )}

        </section>

      </main>
    </div>
  );
}

export default Dashboard;