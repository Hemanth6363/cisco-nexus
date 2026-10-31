
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import { loadSavedTheme, applyTheme } from "./lib/theme";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import AppLayout, {
  type PageName,
} from "./components/AppLayout";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [currentPage, setCurrentPage] =
    useState<PageName | "ProjectDetails">("Dashboard");
  const [selectedProjectId, setSelectedProjectId] =
    useState<number | null>(null);
  const [dashboardKey, setDashboardKey] = useState(0);

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;

      setSession(nextSession);

      if (nextSession?.user) {
        loadSavedTheme(nextSession.user.id);
      } else {
        applyTheme(false);
      }

      setCheckingSession(false);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        console.error("Unable to restore session:", error);
      }

      const currentSession = data.session;
      setSession(currentSession);

      if (currentSession?.user) {
        loadSavedTheme(currentSession.user.id);
      } else {
        applyTheme(false);
      }

      setCheckingSession(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const goToDashboard = () => {
    setDashboardKey((previous) => previous + 1);
    setCurrentPage("Dashboard");
  };

  const openProject = (projectId: number) => {
    setSelectedProjectId(projectId);
    setCurrentPage("ProjectDetails");
  };

  const navigate = (page: PageName) => {
    setCurrentPage(page);
  };

  if (checkingSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f4f7fb",
          color: "#172b4d",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Checking your session...
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={goToDashboard} />;
  }

  const layoutPage: PageName =
    currentPage === "ProjectDetails" ? "Projects" : currentPage;

  let pageContent;

  switch (currentPage) {
    case "Projects":
      pageContent = (
        <Projects
          onBack={goToDashboard}
          onOpenProject={openProject}
        />
      );
      break;

    case "ProjectDetails":
      pageContent =
        selectedProjectId !== null ? (
          <ProjectDetails
            projectId={selectedProjectId}
            onBack={() => setCurrentPage("Projects")}
          />
        ) : (
          <Projects
            onBack={goToDashboard}
            onOpenProject={openProject}
          />
        );
      break;

    case "Tasks":
      pageContent = <Tasks onBack={goToDashboard} />;
      break;

    case "Team":
      pageContent = <Team onBack={goToDashboard} />;
      break;

    case "Reports":
      pageContent = <Reports onBack={goToDashboard} />;
      break;

    case "Settings":
      pageContent = <Settings onBack={goToDashboard} />;
      break;

    default:
      pageContent = (
        <Dashboard
          key={dashboardKey}
          onNavigateToProjects={() => setCurrentPage("Projects")}
          onNavigateToTasks={() => setCurrentPage("Tasks")}
          onNavigateToTeam={() => setCurrentPage("Team")}
          onNavigateToReports={() => setCurrentPage("Reports")}
          onNavigateToSettings={() => setCurrentPage("Settings")}
        />
      );
  }

  return (
    <AppLayout
      currentPage={layoutPage}
      onNavigate={navigate}
    >
      {pageContent}
    </AppLayout>
  );
}

export default App;
