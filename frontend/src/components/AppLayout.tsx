
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import {
  applyTheme,
  saveThemePreference,
} from "../lib/theme";

import "./AppLayout.css";

export type PageName =
  | "Dashboard"
  | "Projects"
  | "Tasks"
  | "Team"
  | "Reports"
  | "Settings";

type AppLayoutProps = {
  currentPage: PageName;
  onNavigate: (page: PageName) => void;
  children: ReactNode;
};

const navigation = [
  { label: "Dashboard" as const, icon: LayoutDashboard },
  { label: "Projects" as const, icon: FolderKanban },
  { label: "Tasks" as const, icon: CheckSquare },
  { label: "Team" as const, icon: Users },
  { label: "Reports" as const, icon: BarChart3 },
  { label: "Settings" as const, icon: Settings },
];

const descriptions: Record<PageName, string> = {
  Dashboard: "Here's what's happening with your workspace today.",
  Projects: "Plan, organize, and track your projects.",
  Tasks: "Manage tasks, priorities, and deadlines.",
  Team: "Manage your team and collaborate effectively.",
  Reports: "Track performance and monitor project progress.",
  Settings: "Manage your account and application preferences.",
};

export default function AppLayout({
  currentPage,
  onNavigate,
  children,
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark-mode")
  );

  const [themeError, setThemeError] = useState("");
  const [themeSaving, setThemeSaving] = useState(false);

  // Synchronize the theme button with Settings and other components.
  useEffect(() => {
    const root = document.documentElement;

    const syncTheme = () => {
      setDarkMode(root.classList.contains("dark-mode"));
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const navigate = (page: PageName) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  // Toggle the global theme and save the user's preference.
  const toggleTheme = async () => {
    if (themeSaving) return;

    const nextTheme =
      !document.documentElement.classList.contains("dark-mode");

    setThemeError("");
    setDarkMode(nextTheme);
    applyTheme(nextTheme);
    setThemeSaving(true);

    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        throw new Error(
          "Theme changed, but sign in again to save your preference."
        );
      }

      saveThemePreference(data.user.id, nextTheme);
    } catch (err) {
      setThemeError(
        err instanceof Error
          ? err.message
          : "Could not save the theme preference."
      );
    } finally {
      setThemeSaving(false);
    }
  };

  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
          type="button"
        />
      )}

      <aside
        className={`app-sidebar ${
          mobileMenuOpen ? "app-sidebar-open" : ""
        }`}
      >
        <div className="app-brand">
          <div className="app-brand-mark">C</div>

          <div className="app-brand-text">
            <strong>Cisco Nexus</strong>
            <span>PROJECT WORKSPACE</span>
          </div>

          <button
            className="sidebar-close"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav
          className="sidebar-navigation"
          aria-label="Main navigation"
        >
          {navigation.map(({ label, icon: Icon }) => {
            const active = currentPage === label;

            return (
              <button
                key={label}
                className={`sidebar-nav-item ${
                  active ? "sidebar-nav-active" : ""
                }`}
                onClick={() => navigate(label)}
                aria-current={active ? "page" : undefined}
                type="button"
              >
                <Icon size={19} strokeWidth={1.9} />
                <span>{label}</span>
                {active && <ChevronRight size={16} />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-icon">
            <BarChart3 size={19} />
          </div>

          <div>
            <strong>Stay on track</strong>
            <p>Keep your projects moving forward.</p>
          </div>
        </div>

        <div className="sidebar-version">
          Cisco Nexus · Workspace
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              type="button"
            >
              <Menu size={22} />
            </button>

            <div className="topbar-heading">
              <div className="topbar-breadcrumb">
                Workspace
                <ChevronRight size={14} />
                <span>{currentPage}</span>
              </div>

              <h1>{currentPage}</h1>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-search">
              <Search size={17} />
              <span>Project workspace</span>
            </div>

            <button
              className="topbar-icon-button theme-toggle"
              onClick={() => void toggleTheme()}
              disabled={themeSaving}
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              type="button"
            >
              {darkMode ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            <button
              className="topbar-icon-button"
              aria-label="Notifications"
              title="Notifications"
              type="button"
            >
              <Bell size={19} />
              <span className="notification-dot" />
            </button>

            <div className="topbar-avatar" title="Your workspace">
              CN
            </div>
          </div>
        </header>

        <div className="app-page-heading">
          <p>{descriptions[currentPage]}</p>

          {themeError && (
            <p className="theme-error" role="alert">
              {themeError}
            </p>
          )}
        </div>

        <main className="app-page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
