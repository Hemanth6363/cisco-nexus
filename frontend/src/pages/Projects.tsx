import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  FolderKanban,
  X,
} from "lucide-react";

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

const defaultProjects: Project[] = [
  {
    id: 1,
    name: "Website Redesign",
    category: "Development",
    progress: 75,
    status: "In Progress",
  },
  {
    id: 2,
    name: "Mobile App",
    category: "Development",
    progress: 50,
    status: "In Progress",
  },
  {
    id: 3,
    name: "Marketing Campaign",
    category: "Marketing",
    progress: 100,
    status: "Completed",
  },
  {
    id: 4,
    name: "Cloud Migration",
    category: "Infrastructure",
    progress: 25,
    status: "Planning",
  },
];

export default function Projects({
  onBack,
  onOpenProject,
}: ProjectsProps) {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [projectName, setProjectName] =
    useState("");

  const [category, setCategory] =
    useState("Development");

  const [progress, setProgress] =
    useState("0");

  const [status, setStatus] =
    useState("Planning");

  useEffect(() => {
    const savedProjects = localStorage.getItem(
      "cisco-nexus-projects"
    );

    if (savedProjects) {
      try {
        const data = JSON.parse(savedProjects);

        if (Array.isArray(data)) {
          setProjects(data);
          return;
        }
      } catch {
        // Ignore invalid data
      }
    }

    setProjects(defaultProjects);

    localStorage.setItem(
      "cisco-nexus-projects",
      JSON.stringify(defaultProjects)
    );
  }, []);

  const saveProjects = (
    updatedProjects: Project[]
  ) => {
    setProjects(updatedProjects);

    localStorage.setItem(
      "cisco-nexus-projects",
      JSON.stringify(updatedProjects)
    );
  };

  const addProject = () => {
    if (!projectName.trim()) {
      alert("Please enter a project name.");
      return;
    }

    const newProject: Project = {
      id: Date.now(),
      name: projectName.trim(),
      category,
      progress: Number(progress),
      status,
    };

    saveProjects([
      ...projects,
      newProject,
    ]);

    setProjectName("");
    setCategory("Development");
    setProgress("0");
    setStatus("Planning");
    setShowModal(false);
  };

  const deleteProject = (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    const updatedProjects =
      projects.filter(
        (project) =>
          project.id !== id
      );

    saveProjects(updatedProjects);
  };

  const filteredProjects =
    projects.filter(
      (project) =>
        project.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        project.category
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        project.status
          .toLowerCase()
          .includes(search.toLowerCase())
    );

  return (
    <div className="projects-page">

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #f5f6fa;
        }

        .projects-page {
          min-height: 100vh;
          background: #f5f6fa;
          color: #20243a;
        }

        .projects-header {
          background: #171a2e;
          color: white;
          padding: 25px 35px;
        }

        .header-content {
          max-width: 1250px;
          margin: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .back-button {
          border: 1px solid #454963;
          background: transparent;
          color: white;
          width: 42px;
          height: 42px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .back-button:hover {
          background: #303452;
        }

        .header-title {
          margin: 0;
          font-size: 27px;
        }

        .header-subtitle {
          margin: 6px 0 0;
          color: #aeb1c2;
          font-size: 14px;
        }

        .add-button {
          border: none;
          background: #625cf5;
          color: white;
          padding: 12px 18px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .add-button:hover {
          background: #514bea;
        }

        .content {
          max-width: 1250px;
          margin: auto;
          padding: 30px 35px;
        }

        .toolbar {
          background: white;
          border: 1px solid #e7e7ee;
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 22px;
        }

        .search-box {
          position: relative;
          max-width: 450px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #85899a;
        }

        .search-input {
          width: 100%;
          border: 1px solid #dddde6;
          border-radius: 8px;
          padding: 12px 15px 12px 42px;
          font-size: 14px;
          outline: none;
        }

        .search-input:focus {
          border-color: #625cf5;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .project-card {
          background: white;
          border: 1px solid #e7e7ee;
          border-radius: 12px;
          padding: 22px;
          transition: 0.2s;
          cursor: pointer;
        }

        .project-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border-color: #625cf5;
        }

        .project-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
        }

        .project-title-area {
          display: flex;
          gap: 13px;
          flex: 1;
        }

        .project-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #efefff;
          color: #625cf5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .project-name {
          margin: 0;
          font-size: 17px;
        }

        .project-category {
          margin-top: 6px;
          color: #85899a;
          font-size: 13px;
        }

        .delete-button {
          border: none;
          background: #fff1f1;
          color: #e05252;
          width: 35px;
          height: 35px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .delete-button:hover {
          background: #ffe1e1;
        }

        .status-row {
          margin-top: 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status {
          padding: 6px 11px;
          border-radius: 20px;
          font-size: 12px;
          background: #efefff;
          color: #625cf5;
        }

        .progress-text {
          color: #666a7c;
          font-size: 13px;
        }

        .progress-background {
          height: 9px;
          background: #eeeeF4;
          border-radius: 20px;
          overflow: hidden;
          margin-top: 12px;
        }

        .progress-bar {
          height: 100%;
          background: #625cf5;
          border-radius: 20px;
          transition: width 0.3s;
        }

        .click-hint {
          margin-top: 15px;
          font-size: 12px;
          color: #85899a;
        }

        .empty-state {
          background: white;
          border: 1px solid #e7e7ee;
          border-radius: 12px;
          padding: 60px 20px;
          text-align: center;
          color: #85899a;
        }

        .empty-state h3 {
          color: #20243a;
          margin: 15px 0 8px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15,18,35,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 100;
        }

        .modal {
          width: 100%;
          max-width: 500px;
          background: white;
          border-radius: 14px;
          padding: 25px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 21px;
        }

        .close-button {
          border: none;
          background: #f1f1f5;
          width: 35px;
          height: 35px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 7px;
          font-size: 13px;
          font-weight: bold;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 12px;
          border: 1px solid #dddde6;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          background: white;
        }

        .form-input:focus,
        .form-select:focus {
          border-color: #625cf5;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 25px;
        }

        .cancel-button {
          border: 1px solid #dddde6;
          background: white;
          color: #55596b;
          padding: 11px 17px;
          border-radius: 8px;
          cursor: pointer;
        }

        .save-button {
          border: none;
          background: #625cf5;
          color: white;
          padding: 11px 18px;
          border-radius: 8px;
          cursor: pointer;
        }

        @media (max-width: 850px) {
          .projects-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .projects-header {
            padding: 20px;
          }

          .header-content {
            align-items: flex-start;
            flex-direction: column;
          }

          .content {
            padding: 20px;
          }

          .add-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <header className="projects-header">
        <div className="header-content">

          <div className="header-left">

            <button
              className="back-button"
              onClick={onBack}
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="header-title">
                Projects
              </h1>

              <p className="header-subtitle">
                Manage and track all your projects
              </p>
            </div>

          </div>

          <button
            className="add-button"
            onClick={() =>
              setShowModal(true)
            }
          >
            <Plus size={18} />
            Add Project
          </button>

        </div>
      </header>

      <main className="content">

        <div className="toolbar">

          <div className="search-box">

            <Search
              className="search-icon"
              size={18}
            />

            <input
              className="search-input"
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>

        {filteredProjects.length === 0 ? (

          <div className="empty-state">

            <FolderKanban
              size={48}
              color="#625cf5"
            />

            <h3>
              No projects found
            </h3>

            <p>
              Try another search or create a new
              project.
            </p>

          </div>

        ) : (

          <div className="projects-grid">

            {filteredProjects.map(
              (project) => (

                <div
                  className="project-card"
                  key={project.id}
                  onClick={() =>
                    onOpenProject(project.id)
                  }
                >

                  <div className="project-card-header">

                    <div className="project-title-area">

                      <div className="project-icon">
                        <FolderKanban
                          size={21}
                        />
                      </div>

                      <div>

                        <h3 className="project-name">
                          {project.name}
                        </h3>

                        <div className="project-category">
                          {project.category}
                        </div>

                      </div>

                    </div>

                    <button
                      className="delete-button"
                      onClick={(event) => {
                        event.stopPropagation();

                        deleteProject(
                          project.id
                        );
                      }}
                      title="Delete project"
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>

                  <div className="status-row">

                    <span className="status">
                      {project.status}
                    </span>

                    <span className="progress-text">
                      {project.progress}%
                    </span>

                  </div>

                  <div className="progress-background">

                    <div
                      className="progress-bar"
                      style={{
                        width:
                          `${project.progress}%`,
                      }}
                    />

                  </div>

                  <div className="click-hint">
                    Click to view project details →
                  </div>

                </div>

              )
            )}

          </div>

        )}

      </main>

      {showModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowModal(false)
          }
        >

          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <h2>
                Create New Project
              </h2>

              <button
                className="close-button"
                onClick={() =>
                  setShowModal(false)
                }
              >
                <X size={18} />
              </button>

            </div>

            <div className="form-group">

              <label>
                Project Name
              </label>

              <input
                className="form-input"
                type="text"
                placeholder="Enter project name"
                value={projectName}
                onChange={(event) =>
                  setProjectName(
                    event.target.value
                  )
                }
              />

            </div>

            <div className="form-group">

              <label>
                Category
              </label>

              <select
                className="form-select"
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
              >
                <option value="Development">
                  Development
                </option>

                <option value="Design">
                  Design
                </option>

                <option value="Marketing">
                  Marketing
                </option>

                <option value="Infrastructure">
                  Infrastructure
                </option>

                <option value="Research">
                  Research
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

            </div>

            <div className="form-group">

              <label>
                Progress (%)
              </label>

              <input
                className="form-input"
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(event) => {

                  const value =
                    Math.min(
                      100,
                      Math.max(
                        0,
                        Number(
                          event.target.value
                        )
                      )
                    );

                  setProgress(
                    String(value)
                  );

                }}
              />

            </div>

            <div className="form-group">

              <label>
                Status
              </label>

              <select
                className="form-select"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
              >

                <option value="Planning">
                  Planning
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="On Hold">
                  On Hold
                </option>

                <option value="Completed">
                  Completed
                </option>

              </select>

            </div>

            <div className="form-actions">

              <button
                className="cancel-button"
                onClick={() =>
                  setShowModal(false)
                }
              >
                Cancel
              </button>

              <button
                className="save-button"
                onClick={addProject}
              >
                Create Project
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}