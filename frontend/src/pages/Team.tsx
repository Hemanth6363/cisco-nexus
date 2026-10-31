
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  Mail,
  Briefcase,
  Pencil,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
  legacy_id?: string;
};

type TeamProps = {
  onBack: () => void;
};

const roles = [
  "Project Manager",
  "Developer",
  "Designer",
  "Tester",
  "DevOps Engineer",
  "Team Lead",
  "Data Analyst",
  "UI/UX Designer",
];

const teamStyles = `
  * { box-sizing: border-box; }

  .team-page {
    min-height: 100vh;
    background: #f5f6fa;
    color: #20243a;
    font-family: Arial, Helvetica, sans-serif;
    transition: background .2s, color .2s;
  }

  .team-page button,
  .team-page input,
  .team-page select {
    font: inherit;
  }

  .team-page button { cursor: pointer; }

  .team-page .header {
    background: #171a2e;
    color: white;
    padding: 25px 35px;
  }

  .team-page .header-inner {
    max-width: 1250px;
    margin: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }

  .team-page .header-left {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .team-page .back-button {
    width: 42px;
    height: 42px;
    border: 1px solid #454963;
    background: transparent;
    color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .team-page .back-button:hover { background: #303452; }

  .team-page .header h1 {
    margin: 0;
    font-size: 27px;
  }

  .team-page .header p {
    margin: 6px 0 0;
    color: #aeb1c2;
    font-size: 14px;
  }

  .team-page .add-button {
    border: none;
    background: #625cf5;
    color: white;
    padding: 12px 18px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  .team-page .content {
    max-width: 1250px;
    margin: auto;
    padding: 30px 35px;
  }

  .team-page .summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    margin-bottom: 22px;
  }

  .team-page .summary-card,
  .team-page .toolbar,
  .team-page .member-card,
  .team-page .empty {
    background: white;
    border: 1px solid #e7e7ee;
    border-radius: 12px;
  }

  .team-page .summary-card { padding: 22px; }

  .team-page .summary-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .team-page .summary-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: #efefff;
    color: #625cf5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .team-page .summary-card p {
    color: #85899a;
    margin: 0 0 8px;
    font-size: 13px;
  }

  .team-page .summary-card h2 {
    margin: 0;
    font-size: 28px;
  }

  .team-page .toolbar {
    padding: 18px;
    margin-bottom: 22px;
  }

  .team-page .search-box {
    position: relative;
    max-width: 500px;
  }

  .team-page .search-box svg {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: #85899a;
  }

  .team-page .search-input {
    width: 100%;
    padding: 12px 15px 12px 42px;
    border: 1px solid #dddde6;
    border-radius: 8px;
    outline: none;
    font-size: 14px;
    background: white;
    color: #20243a;
  }

  .team-page .search-input:focus,
  .team-page .form-input:focus,
  .team-page .form-select:focus {
    border-color: #625cf5;
  }

  .team-page .members-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .team-page .member-card {
    padding: 22px;
    transition: transform .2s, box-shadow .2s;
    min-width: 0;
  }

  .team-page .member-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,.06);
  }

  .team-page .member-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .team-page .avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #efefff;
    color: #625cf5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    flex-shrink: 0;
  }

  .team-page .member-actions {
    display: flex;
    gap: 7px;
  }

  .team-page .action-button {
    width: 35px;
    height: 35px;
    border: none;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .team-page .edit-button {
    background: #efefff;
    color: #625cf5;
  }

  .team-page .delete-button {
    background: #fff1f1;
    color: #e05252;
  }

  .team-page .member-name {
    margin: 18px 0 5px;
    font-size: 17px;
    overflow-wrap: anywhere;
  }

  .team-page .member-role {
    color: #625cf5;
    font-size: 13px;
    margin-bottom: 15px;
  }

  .team-page .member-detail {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #85899a;
    font-size: 13px;
    margin-top: 9px;
    overflow-wrap: anywhere;
  }

  .team-page .member-detail svg { flex-shrink: 0; }

  .team-page .empty {
    padding: 45px 20px;
    text-align: center;
    color: #85899a;
  }

  .team-page .empty h3 { color: #20243a; }

  .team-page .notice {
    padding: 12px 14px;
    border-radius: 8px;
    margin-bottom: 16px;
    background: #fff1f1;
    color: #a52d2d;
    overflow-wrap: anywhere;
  }

  .team-page .overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,18,35,.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 1000;
    overflow-y: auto;
  }

  .team-page .modal {
    width: 100%;
    max-width: 500px;
    max-height: 92vh;
    overflow-y: auto;
    background: white;
    color: #20243a;
    border-radius: 14px;
    padding: 25px;
    box-shadow: 0 20px 60px rgba(0,0,0,.2);
  }

  .team-page .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 25px;
  }

  .team-page .modal-header h2 {
    margin: 0;
    font-size: 21px;
  }

  .team-page .close-button {
    width: 35px;
    height: 35px;
    border: none;
    background: #f1f1f5;
    color: #20243a;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .team-page .form-group { margin-bottom: 18px; }

  .team-page .form-group label {
    display: block;
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 7px;
  }

  .team-page .form-input,
  .team-page .form-select {
    width: 100%;
    padding: 12px;
    border: 1px solid #dddde6;
    border-radius: 8px;
    outline: none;
    background: white;
    color: #20243a;
    font-size: 14px;
  }

  .team-page .form-actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 25px;
  }

  .team-page .cancel-button,
  .team-page .save-button {
    padding: 11px 17px;
    border-radius: 8px;
    cursor: pointer;
  }

  .team-page .cancel-button {
    border: 1px solid #dddde6;
    background: white;
    color: #20243a;
  }

  .team-page .save-button {
    border: none;
    background: #625cf5;
    color: white;
  }

  .team-page .save-button:disabled {
    opacity: .6;
    cursor: wait;
  }

  /* Dark mode */
  html.dark-mode .team-page {
    background: #111827;
    color: #f3f4f6;
  }

  html.dark-mode .team-page .summary-card,
  html.dark-mode .team-page .toolbar,
  html.dark-mode .team-page .member-card,
  html.dark-mode .team-page .empty,
  html.dark-mode .team-page .modal {
    background: #1f2937;
    color: #f3f4f6;
    border-color: #374151;
  }

  html.dark-mode .team-page .summary-card p,
  html.dark-mode .team-page .member-detail,
  html.dark-mode .team-page .empty,
  html.dark-mode .team-page .empty p {
    color: #aab5c5;
  }

  html.dark-mode .team-page .member-name,
  html.dark-mode .team-page .summary-card h2,
  html.dark-mode .team-page .modal-header h2,
  html.dark-mode .team-page .empty h3 {
    color: #f3f4f6;
  }

  html.dark-mode .team-page .search-input,
  html.dark-mode .team-page .form-input,
  html.dark-mode .team-page .form-select {
    background: #111827;
    color: #f3f4f6;
    border-color: #4b5563;
  }

  html.dark-mode .team-page .search-input::placeholder,
  html.dark-mode .team-page .form-input::placeholder {
    color: #9ca3af;
  }

  html.dark-mode .team-page .close-button,
  html.dark-mode .team-page .cancel-button {
    background: #374151;
    color: #f3f4f6;
    border-color: #4b5563;
  }

  html.dark-mode .team-page .notice {
    background: #451f2a;
    color: #fecaca;
    border: 1px solid #7f1d1d;
  }

  html.dark-mode .team-page .summary-icon,
  html.dark-mode .team-page .avatar,
  html.dark-mode .team-page .edit-button {
    background: #373151;
    color: #c4b5fd;
  }

  html.dark-mode .team-page .delete-button {
    background: #451f2a;
    color: #fca5a5;
  }

  html.dark-mode .team-page option {
    background: #1f2937;
    color: #f3f4f6;
  }

  @media (max-width: 900px) {
    .team-page .members-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .team-page .summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 650px) {
    .team-page .header { padding: 20px; }

    .team-page .header-inner {
      flex-direction: column;
      align-items: flex-start;
    }

    .team-page .add-button {
      width: 100%;
      justify-content: center;
    }

    .team-page .content { padding: 20px; }

    .team-page .summary,
    .team-page .members-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default function Team({ onBack }: TeamProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Developer");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("team_members")
      .select("id, legacy_id, name, email, role")
      .order("created_at", { ascending: true });

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setMembers(
      (data ?? []).map((member) => ({
        ...member,
        id: Number(member.id),
        name: member.name ?? "",
        email: member.email ?? "",
        role: member.role ?? "Developer",
      }))
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setRole("Developer");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (member: Member) => {
    setEditingId(member.id);
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setName("");
    setEmail("");
    setRole("Developer");
    setError("");
  };

  const saveMember = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Please enter both the member name and email.");
      return;
    }

    setSaving(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("Your session has expired. Please sign in again.");
      setSaving(false);
      return;
    }

    const values = {
      name: name.trim(),
      email: email.trim(),
      role,
    };

    const result =
      editingId !== null
        ? await supabase
            .from("team_members")
            .update(values)
            .eq("id", editingId)
            .select("id, legacy_id, name, email, role")
            .single()
        : await supabase
            .from("team_members")
            .insert({
              ...values,
              owner_id: user.id,
              legacy_id: crypto.randomUUID(),
            })
            .select("id, legacy_id, name, email, role")
            .single();

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    const saved = {
      ...result.data,
      id: Number(result.data.id),
    } as Member;

    setMembers((current) =>
      editingId !== null
        ? current.map((member) =>
            member.id === editingId ? saved : member
          )
        : [...current, saved]
    );

    setSaving(false);
    closeModal();
  };

  const deleteMember = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this team member?"
      )
    ) {
      return;
    }

    setError("");

    const { error: deleteError } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMembers((current) =>
      current.filter((member) => member.id !== id)
    );
  };

  const filteredMembers = members.filter((member) =>
    `${member.name} ${member.email} ${member.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const roleCount = new Set(
    members.map((member) => member.role)
  ).size;

  return (
    <div className="team-page">
      <style>{teamStyles}</style>

      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <button
              className="back-button"
              onClick={onBack}
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1>Team</h1>
              <p>Manage your project team members</p>
            </div>
          </div>

          <button className="add-button" onClick={openAddModal}>
            <Plus size={18} />
            Add Member
          </button>
        </div>
      </header>

      <main className="content">
        {error && !showModal && (
          <div className="notice" role="alert">
            {error}
          </div>
        )}

        <div className="summary">
          <div className="summary-card">
            <div className="summary-top">
              <div>
                <p>Total Members</p>
                <h2>{members.length}</h2>
              </div>
              <div className="summary-icon">
                <Users size={21} />
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-top">
              <div>
                <p>Team Roles</p>
                <h2>{roleCount}</h2>
              </div>
              <div className="summary-icon">
                <Briefcase size={21} />
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-top">
              <div>
                <p>Search Results</p>
                <h2>{filteredMembers.length}</h2>
              </div>
              <div className="summary-icon">
                <Search size={21} />
              </div>
            </div>
          </div>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              className="search-input"
              placeholder="Search team members..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search team members"
            />
          </div>
        </div>

        {loading ? (
          <div className="empty">Loading team members…</div>
        ) : filteredMembers.length === 0 ? (
          <div className="empty">
            <Users size={48} color="#625cf5" />
            <h3>No team members found</h3>
            <p>Try another search or add a new member.</p>
          </div>
        ) : (
          <div className="members-grid">
            {filteredMembers.map((member) => {
              const initials = member.name
                .split(" ")
                .map((word) => word[0] ?? "")
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div className="member-card" key={member.id}>
                  <div className="member-top">
                    <div className="avatar">{initials}</div>

                    <div className="member-actions">
                      <button
                        className="action-button edit-button"
                        onClick={() => openEditModal(member)}
                        title="Edit member"
                        aria-label={`Edit ${member.name}`}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="action-button delete-button"
                        onClick={() => void deleteMember(member.id)}
                        title="Delete member"
                        aria-label={`Delete ${member.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="member-name">{member.name}</h3>
                  <div className="member-role">{member.role}</div>

                  <div className="member-detail">
                    <Mail size={15} />
                    {member.email}
                  </div>

                  <div className="member-detail">
                    <Briefcase size={15} />
                    {member.role}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showModal && (
        <div className="overlay" onClick={closeModal}>
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {editingId !== null
                  ? "Edit Team Member"
                  : "Add Team Member"}
              </h2>

              <button
                className="close-button"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="notice" role="alert">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="member-name">Name</label>
              <input
                id="member-name"
                className="form-input"
                placeholder="Enter member name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="member-email">Email</label>
              <input
                id="member-email"
                className="form-input"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="member-role">Role</label>
              <select
                id="member-role"
                className="form-select"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button
                className="cancel-button"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="save-button"
                onClick={() => void saveMember()}
                disabled={saving}
              >
                {saving
                  ? "Saving…"
                  : editingId !== null
                    ? "Save Changes"
                    : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
