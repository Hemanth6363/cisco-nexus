import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {

  const [isLoggedIn, setIsLoggedIn] =
    useState(
      localStorage.getItem(
        "cisco-nexus-auth"
      ) === "true"
    );

  const [currentPage, setCurrentPage] =
    useState("Dashboard");

  const [selectedProjectId, setSelectedProjectId] =
    useState<number | null>(null);

  const [dashboardKey, setDashboardKey] =
    useState(0);

  const handleLogin = () => {

    setIsLoggedIn(true);

    setCurrentPage("Dashboard");

  };

  const goToDashboard = () => {

    setDashboardKey(
      (previous) => previous + 1
    );

    setCurrentPage("Dashboard");

  };

  const openProject = (
    projectId: number
  ) => {

    setSelectedProjectId(projectId);

    setCurrentPage(
      "ProjectDetails"
    );

  };

  if (!isLoggedIn) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );

  }

  if (currentPage === "Projects") {

    return (
      <Projects
        onBack={goToDashboard}
        onOpenProject={openProject}
      />
    );

  }

  if (
    currentPage === "ProjectDetails" &&
    selectedProjectId !== null
  ) {

    return (
      <ProjectDetails
        projectId={selectedProjectId}
        onBack={() =>
          setCurrentPage("Projects")
        }
      />
    );

  }

  if (currentPage === "Tasks") {

    return (
      <Tasks
        onBack={goToDashboard}
      />
    );

  }

  if (currentPage === "Team") {

    return (
      <Team
        onBack={goToDashboard}
      />
    );

  }

  if (currentPage === "Reports") {

    return (
      <Reports
        onBack={goToDashboard}
      />
    );

  }

  if (currentPage === "Settings") {

    return (
      <Settings
        onBack={goToDashboard}
      />
    );

  }

  return (
    <Dashboard
      key={dashboardKey}

      onNavigateToProjects={() =>
        setCurrentPage("Projects")
      }

      onNavigateToTasks={() =>
        setCurrentPage("Tasks")
      }

      onNavigateToTeam={() =>
        setCurrentPage("Team")
      }

      onNavigateToReports={() =>
        setCurrentPage("Reports")
      }

      onNavigateToSettings={() =>
        setCurrentPage("Settings")
      }
    />
  );
}

export default App;