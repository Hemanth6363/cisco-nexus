
import { useState } from "react";
import {
  LogIn,
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type LoginProps = {
  onLogin: () => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const handleSubmit = async () => {
    setErrorMessage("");
    setNotice("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    if (isSignup && !name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (isSignup && password.length < 8) {
      setErrorMessage("Use a password with at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
          },
        });

        if (error) throw error;

        if (data.session) {
          onLogin();
        } else {
          setNotice(
            "Account created. Check your email to confirm it, then sign in."
          );
          setIsSignup(false);
          setPassword("");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        onLogin();
      }
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Arial, Helvetica, sans-serif; }
        .login-page {
          min-height: 100vh; background: #171a2e; display: flex;
          align-items: center; justify-content: center; padding: 25px;
        }
        .login-container { width: 100%; max-width: 430px; }
        .brand { text-align: center; margin-bottom: 25px; }
        .brand h1 { margin: 0; color: white; font-size: 32px; letter-spacing: -1px; }
        .brand h1 span { color: #625cf5; }
        .brand p { color: #aeb1c2; margin: 8px 0 0; font-size: 14px; }
        .login-card {
          background: white; border-radius: 16px; padding: 32px;
          box-shadow: 0 20px 50px rgba(0,0,0,.25);
        }
        .card-header { text-align: center; margin-bottom: 25px; }
        .icon-box {
          width: 55px; height: 55px; background: #efefff; color: #625cf5;
          border-radius: 14px; display: flex; align-items: center;
          justify-content: center; margin: 0 auto 15px;
        }
        .card-header h2 { margin: 0; font-size: 24px; color: #20243a; }
        .card-header p { margin: 7px 0 0; color: #85899a; font-size: 14px; }
        .form-group { margin-bottom: 17px; }
        .form-group label {
          display: block; font-size: 13px; font-weight: bold;
          color: #303348; margin-bottom: 7px;
        }
        .input-wrapper { position: relative; }
        .input-icon {
          position: absolute; left: 13px; top: 50%;
          transform: translateY(-50%); color: #85899a;
        }
        .form-input {
          width: 100%; height: 46px; border: 1px solid #dddde6;
          border-radius: 8px; padding: 0 42px; outline: none; font-size: 14px;
        }
        .form-input:focus {
          border-color: #625cf5; box-shadow: 0 0 0 3px rgba(98,92,245,.1);
        }
        .password-button {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%); border: none; background: transparent;
          color: #85899a; cursor: pointer; display: flex;
        }
        .submit-button {
          width: 100%; min-height: 46px; border: none; border-radius: 8px;
          background: #625cf5; color: white; font-size: 15px; font-weight: bold;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 8px; margin-top: 8px;
        }
        .submit-button:disabled { opacity: .65; cursor: wait; }
        .switch-text { text-align: center; margin: 22px 0 0; color: #85899a; font-size: 13px; }
        .switch-button {
          border: none; background: transparent; color: #625cf5;
          font-weight: bold; cursor: pointer; font-size: 13px;
        }
        .security-note {
          margin-top: 20px; padding: 12px; background: #f7f7fb;
          border-radius: 8px; text-align: center; color: #85899a;
          font-size: 11px; line-height: 1.5;
        }
        @media (max-width: 500px) {
          .login-page { padding: 15px; }
          .login-card { padding: 25px 20px; }
        }
      `}</style>

      <div className="login-container">
        <div className="brand">
          <h1>Cisco <span>Nexus</span></h1>
          <p>Project Management System</p>
        </div>

        <div className="login-card">
          <div className="card-header">
            <div className="icon-box">
              {isSignup ? <UserPlus size={27} /> : <LogIn size={27} />}
            </div>
            <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
            <p>
              {isSignup
                ? "Create your Cisco Nexus account"
                : "Sign in to continue to Cisco Nexus"}
            </p>
          </div>

          {isSignup && (
            <div className="form-group">
              <label htmlFor="signup-name">Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  id="signup-name"
                  className="form-input"
                  autoComplete="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="login-email"
                className="form-input"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="login-password"
                className="form-input"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                className="password-button"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <p role="alert" style={{ color: "#dc2626", fontSize: 13 }}>
              {errorMessage}
            </p>
          )}
          {notice && (
            <p role="status" style={{ color: "#166534", fontSize: 13 }}>
              {notice}
            </p>
          )}

          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? <><UserPlus size={18} /> Create Account</>
                : <><LogIn size={18} /> Sign In</>}
          </button>

          <p className="switch-text">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              className="switch-button"
              type="button"
              onClick={() => {
                setIsSignup((value) => !value);
                setName("");
                setEmail("");
                setPassword("");
                setErrorMessage("");
                setNotice("");
              }}
            >
              {isSignup ? "Sign In" : "Create Account"}
            </button>
          </p>

          <div className="security-note">
            Account passwords are managed by Supabase Authentication.
          </div>
        </div>
      </div>
    </div>
  );
}
