
import { useEffect, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  LogOut,
  Save,
  User,
  Bell,
  Moon,
  Download,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  applyTheme,
  saveThemePreference,
} from "../lib/theme";

type SettingsProps = {
  onBack: () => void;
};

type BackupData = {
  projects: unknown[];
  tasks: unknown[];
  team_members: unknown[];
};

type Preferences = {
  notifications?: boolean;
  darkMode?: boolean;
  [key: string]: unknown;
};

const preferenceKey = (userId: string) =>
  `cisco-nexus-preferences-${userId}`;

export default function Settings({ onBack }: SettingsProps) {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark-mode")
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load the signed-in user's account and saved preferences.
  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setError("");

      try {
        const { data, error: authError } =
          await supabase.auth.getUser();

        if (cancelled) return;

        if (authError || !data.user) {
          setError(
            authError?.message ??
              "Unable to load your account. Please sign in again."
          );
          setLoading(false);
          return;
        }

        const user = data.user;
        setUserId(user.id);
        setName(
          typeof user.user_metadata?.name === "string"
            ? user.user_metadata.name
            : ""
        );
        setEmail(user.email ?? "");

        let preferences: Preferences = {};

        try {
          const saved = localStorage.getItem(
            preferenceKey(user.id)
          );

          if (saved) {
            preferences = JSON.parse(saved);
          }
        } catch {
          preferences = {};
        }

        const savedDarkMode =
          typeof preferences.darkMode === "boolean"
            ? preferences.darkMode
            : document.documentElement.classList.contains(
                "dark-mode"
              );

        setNotifications(preferences.notifications !== false);
        setDarkMode(savedDarkMode);
        applyTheme(savedDarkMode);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load your settings."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  // Apply the shared theme across the website.
  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  const colors = {
    surface: darkMode ? "#1f2937" : "#ffffff",
    surfaceAlt: darkMode ? "#273449" : "#f8fafc",
    page: darkMode ? "#111827" : "#f4f7fb",
    text: darkMode ? "#f3f4f6" : "#172b4d",
    muted: darkMode ? "#b8c4d4" : "#64748b",
    border: darkMode ? "#374151" : "#e2e8f0",
    input: darkMode ? "#111827" : "#ffffff",
    primary: "#625cf5",
  };

  const cardStyle: CSSProperties = {
    background: colors.surface,
    color: colors.text,
    padding: "24px",
    borderRadius: "14px",
    marginBottom: "20px",
    border: `1px solid ${colors.border}`,
    boxShadow: darkMode
      ? "0 3px 12px rgba(0,0,0,0.15)"
      : "0 3px 12px rgba(16,36,58,0.04)",
  };

  const inputStyle: CSSProperties = {
    boxSizing: "border-box",
    display: "block",
    width: "100%",
    padding: "12px",
    margin: "8px 0 18px",
    border: `1px solid ${colors.border}`,
    borderRadius: "8px",
    background: colors.input,
    color: colors.text,
    fontSize: "14px",
  };

  const buttonStyle: CSSProperties = {
    width: "100%",
    padding: "13px",
    borderRadius: "8px",
    fontWeight: 650,
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    border: "none",
  };

  // Save preferences without discarding other saved settings.
  const savePreferences = async (
    nextNotifications: boolean,
    nextDarkMode: boolean
  ) => {
    setError("");

    try {
      if (!userId) {
        throw new Error(
          "Please sign in again to save your preferences."
        );
      }

      const key = preferenceKey(userId);
      let existing: Preferences = {};

      try {
        const saved = localStorage.getItem(key);
        if (saved) existing = JSON.parse(saved);
      } catch {
        existing = {};
      }

      localStorage.setItem(
        key,
        JSON.stringify({
          ...existing,
          notifications: nextNotifications,
          darkMode: nextDarkMode,
        })
      );

      saveThemePreference(userId, nextDarkMode);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save preferences in this browser."
      );
    }
  };

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    setMessage("");
    void savePreferences(checked, darkMode);
  };

  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    applyTheme(checked);
    setMessage("");
    void savePreferences(notifications, checked);
  };

  // Update the user's display name in Supabase Authentication.
  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { data, error: authError } =
        await supabase.auth.getUser();

      if (authError || !data.user) {
        throw new Error(
          "Please sign in again before saving settings."
        );
      }

      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error("Please enter your name.");
      }

      const { error: updateError } =
        await supabase.auth.updateUser({
          data: { name: trimmedName },
        });

      if (updateError) throw updateError;

      setName(trimmedName);
      setMessage("Profile saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // Export the three existing application tables as a JSON file.
  const handleDownloadBackup = async () => {
    setBackingUp(true);
    setMessage("");
    setError("");

    try {
      const { data: userData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !userData.user) {
        throw new Error(
          "Please sign in again before creating a backup."
        );
      }

      const [
        projectsResult,
        tasksResult,
        teamResult,
      ] = await Promise.all([
        supabase.from("projects").select("*"),
        supabase.from("tasks").select("*"),
        supabase.from("team_members").select("*"),
      ]);

      const backupError =
        projectsResult.error ||
        tasksResult.error ||
        teamResult.error;

      if (backupError) throw backupError;

      const data: BackupData = {
        projects: projectsResult.data ?? [],
        tasks: tasksResult.data ?? [],
        team_members: teamResult.data ?? [],
      };

      const backup = {
        application: "Cisco Nexus",
        formatVersion: 2,
        exportedAt: new Date().toISOString(),
        data,
      };

      const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `cisco-nexus-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      setMessage("Your database backup download has started.");
    } catch (err) {
      setError(
        err instanceof Error
          ? `Backup failed: ${err.message}`
          : "Could not create a backup."
      );
    } finally {
      setBackingUp(false);
    }
  };

  // Supabase's auth-state listener in App.tsx should handle
  // redirecting the user after sign-out.
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) {
      return;
    }

    setLoggingOut(true);
    setError("");
    setMessage("");

    try {
      const { error: signOutError } =
        await supabase.auth.signOut();

      if (signOutError) throw signOutError;
    } catch (err) {
      setError(
        err instanceof Error
          ? `Could not log out: ${err.message}`
          : "Could not log out."
      );
      setLoggingOut(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.page,
        color: colors.text,
        padding: "30px",
        fontFamily: "Arial, sans-serif",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          <button
            onClick={onBack}
            aria-label="Go back"
            style={{
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              color: colors.text,
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 style={{ margin: 0 }}>Settings</h1>
            <p style={{ margin: "5px 0 0", color: colors.muted }}>
              Manage your Cisco Nexus account
            </p>
          </div>
        </header>

        {message && (
          <div
            role="status"
            style={{
              background: darkMode ? "#193d31" : "#e9f8ef",
              color: darkMode ? "#b8f0d0" : "#176b3a",
              padding: "12px 15px",
              borderRadius: "8px",
              marginBottom: "18px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              background: darkMode ? "#48272d" : "#fff1f1",
              color: darkMode ? "#ffc5cc" : "#a52c2c",
              padding: "12px 15px",
              borderRadius: "8px",
              marginBottom: "18px",
              overflowWrap: "anywhere",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <section style={cardStyle}>
            Loading account settings...
          </section>
        ) : (
          <>
            {/* Profile */}
            <section style={cardStyle}>
              <h2
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <User size={20} />
                Profile
              </h2>

              <label htmlFor="profile-name">Name</label>
              <input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                style={inputStyle}
                autoComplete="name"
              />

              <label htmlFor="profile-email">Account Email</label>
              <input
                id="profile-email"
                type="email"
                value={email}
                readOnly
                style={{ ...inputStyle, opacity: 0.75 }}
                autoComplete="email"
              />

              <p style={{ color: colors.muted, fontSize: "13px" }}>
                Your account email is managed by Supabase
                Authentication.
              </p>

              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: colors.primary,
                  color: "#ffffff",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  cursor: saving ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </section>

            {/* Preferences */}
            <section style={cardStyle}>
              <h2>Preferences</h2>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  padding: "15px 0",
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <div>
                  <Bell size={18} />
                  <strong style={{ marginLeft: "10px" }}>
                    Notifications
                  </strong>
                  <p
                    style={{
                      margin: "5px 0 0 28px",
                      color: colors.muted,
                    }}
                  >
                    Save your notification preference in this browser.
                  </p>
                </div>

                <input
                  type="checkbox"
                  aria-label="Enable notifications"
                  checked={notifications}
                  onChange={(event) =>
                    handleNotificationsChange(event.target.checked)
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  padding: "15px 0",
                }}
              >
                <div>
                  <Moon size={18} />
                  <strong style={{ marginLeft: "10px" }}>
                    Dark Mode
                  </strong>
                  <p
                    style={{
                      margin: "5px 0 0 28px",
                      color: colors.muted,
                    }}
                  >
                    Use a dark appearance across the website.
                  </p>
                </div>

                <input
                  type="checkbox"
                  aria-label="Enable dark mode"
                  checked={darkMode}
                  onChange={(event) =>
                    handleDarkModeChange(event.target.checked)
                  }
                />
              </div>
            </section>

            {/* Backup */}
            <section style={cardStyle}>
              <h2
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <ShieldCheck size={21} />
                Data Backup
              </h2>

              <p style={{ color: colors.muted, lineHeight: 1.6 }}>
                Download a JSON backup of the projects, tasks, and
                team members your signed-in account is permitted to
                access. Keep the backup file private.
              </p>

              <button
                onClick={handleDownloadBackup}
                disabled={backingUp}
                style={{
                  ...buttonStyle,
                  background: colors.primary,
                  color: "#ffffff",
                  opacity: backingUp ? 0.7 : 1,
                }}
              >
                <Download size={18} />
                {backingUp
                  ? "Preparing Backup..."
                  : "Download Backup"}
              </button>

              <p style={{ color: colors.muted, fontSize: "12px" }}>
                This exports data; it does not modify database records.
              </p>
            </section>

            {/* Account */}
            <section style={cardStyle}>
              <h2>Account</h2>

              <p style={{ color: colors.muted, lineHeight: 1.6 }}>
                Logging out ends your session. Your saved database
                records will not be deleted.
              </p>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  ...buttonStyle,
                  background: "#ef4444",
                  color: "#ffffff",
                  opacity: loggingOut ? 0.7 : 1,
                }}
              >
                <LogOut size={18} />
                {loggingOut ? "Logging Out..." : "Logout"}
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
