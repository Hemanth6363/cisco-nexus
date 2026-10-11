import { useState } from "react";
import { ArrowLeft, LogOut, Save, User, Bell, Moon } from "lucide-react";

type SettingsProps = {
  onBack: () => void;
};

export default function Settings({ onBack }: SettingsProps) {
  const savedUser = localStorage.getItem("cisco-nexus-user");

  let userName = "User";
  let userEmail = "";

  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      userName = user.name;
      userEmail = user.email;
    } catch {
      // ignore
    }
  }

  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = () => {
    const saved = localStorage.getItem("cisco-nexus-user");

    if (saved) {
      try {
        const user = JSON.parse(saved);

        user.name = name;
        user.email = email;

        localStorage.setItem(
          "cisco-nexus-user",
          JSON.stringify(user)
        );
      } catch {
        // ignore
      }
    }

    alert("Settings saved successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem("cisco-nexus-auth");

    window.location.reload();
  };

  const handleClearData = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to delete all application data?"
    );

    if (!confirmClear) return;

    localStorage.clear();

    window.location.reload();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode ? "#171a2e" : "#f5f6fa",
        color: darkMode ? "white" : "#20243a",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          <button
            onClick={onBack}
            style={{
              border: "none",
              background: "white",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 style={{ margin: 0 }}>
              Settings
            </h1>

            <p
              style={{
                margin: "5px 0 0",
                color: darkMode ? "#aaa" : "#777",
              }}
            >
              Manage your Cisco Nexus account
            </p>
          </div>
        </div>

        {/* Profile */}
        <div
          style={{
            background: darkMode ? "#242842" : "white",
            padding: "25px",
            borderRadius: "14px",
            marginBottom: "20px",
          }}
        >
          <h2>
            <User size={20} style={{ verticalAlign: "middle" }} />{" "}
            Profile
          </h2>

          <label>Name</label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              margin: "8px 0 18px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          />

          <label>Email</label>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              margin: "8px 0 18px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          />

          <button
            onClick={handleSave}
            style={{
              background: "#625cf5",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>

        {/* Preferences */}
        <div
          style={{
            background: darkMode ? "#242842" : "white",
            padding: "25px",
            borderRadius: "14px",
            marginBottom: "20px",
          }}
        >
          <h2>Preferences</h2>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "15px 0",
              borderBottom: "1px solid #ddd",
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
                  color: "#888",
                }}
              >
                Receive project notifications
              </p>
            </div>

            <input
              type="checkbox"
              checked={notifications}
              onChange={() =>
                setNotifications(!notifications)
              }
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
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
                  color: "#888",
                }}
              >
                Use dark appearance
              </p>
            </div>

            <input
              type="checkbox"
              checked={darkMode}
              onChange={() =>
                setDarkMode(!darkMode)
              }
            />
          </div>
        </div>

        {/* Account */}
        <div
          style={{
            background: darkMode ? "#242842" : "white",
            padding: "25px",
            borderRadius: "14px",
            marginBottom: "20px",
          }}
        >
          <h2>Account</h2>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: "#ef4444",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <LogOut size={18} />
            Logout
          </button>

          <button
            onClick={handleClearData}
            style={{
              width: "100%",
              padding: "13px",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              background: "transparent",
              color: "#ef4444",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Clear All Application Data
          </button>
        </div>

      </div>
    </div>
  );
}