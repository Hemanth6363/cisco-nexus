import { useEffect, useState } from "react";
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

type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type TeamProps = {
  onBack: () => void;
};

const defaultMembers: Member[] = [
  {
    id: 1,
    name: "Hemanth Gowda",
    email: "hemanth@example.com",
    role: "Project Manager",
  },
];

export default function Team({
  onBack,
}: TeamProps) {
  const [members, setMembers] =
    useState<Member[]>([]);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [role, setRole] =
    useState("Developer");

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = () => {
    try {
      const saved =
        localStorage.getItem(
          "cisco-nexus-team"
        );

      if (saved) {
        const data = JSON.parse(saved);

        if (Array.isArray(data)) {
          setMembers(data);
          return;
        }
      }
    } catch {
      console.log(
        "Could not load team members"
      );
    }

    setMembers(defaultMembers);

    localStorage.setItem(
      "cisco-nexus-team",
      JSON.stringify(defaultMembers)
    );
  };

  const saveMembers = (
    updated: Member[]
  ) => {
    setMembers(updated);

    localStorage.setItem(
      "cisco-nexus-team",
      JSON.stringify(updated)
    );
  };

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setRole("Developer");
    setShowModal(true);
  };

  const openEditModal = (
    member: Member
  ) => {
    setEditingId(member.id);
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setName("");
    setEmail("");
    setRole("Developer");
  };

  const saveMember = () => {
    if (!name.trim()) {
      alert(
        "Please enter the member name."
      );
      return;
    }

    if (!email.trim()) {
      alert(
        "Please enter the email."
      );
      return;
    }

    if (editingId !== null) {
      const updated =
        members.map((member) =>
          member.id === editingId
            ? {
                ...member,
                name: name.trim(),
                email: email.trim(),
                role,
              }
            : member
        );

      saveMembers(updated);

      closeModal();

      alert(
        "Team member updated successfully!"
      );

      return;
    }

    const newMember: Member = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      role,
    };

    saveMembers([
      ...members,
      newMember,
    ]);

    closeModal();

    alert(
      "Team member added successfully!"
    );
  };

  const deleteMember = (
    id: number
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to remove this team member?"
      );

    if (!confirmed) {
      return;
    }

    const updated =
      members.filter(
        (member) =>
          member.id !== id
      );

    saveMembers(updated);
  };

  const filteredMembers =
    members.filter(
      (member) =>
        member.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        member.email
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        member.role
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  const roleCount = new Set(
    members.map(
      (member) => member.role
    )
  ).size;

  return (
    <div className="team-page">

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #f5f6fa;
        }

        .team-page {
          min-height: 100vh;
          background: #f5f6fa;
          color: #20243a;
        }

        .header {
          background: #171a2e;
          color: white;
          padding: 25px 35px;
        }

        .header-inner {
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

        .summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 22px;
        }

        .summary-card {
          background: white;
          border: 1px solid #e7e7ee;
          border-radius: 12px;
          padding: 22px;
        }

        .summary-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .summary-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #efefff;
          color: #625cf5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .summary-card p {
          color: #85899a;
          margin: 0 0 8px;
          font-size: 13px;
        }

        .summary-card h2 {
          margin: 0;
          font-size: 28px;
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
          max-width: 500px;
        }

        .search-box svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #85899a;
        }

        .search-input {
          width: 100%;
          padding: 12px 15px 12px 42px;
          border: 1px solid #dddde6;
          border-radius: 8px;
          outline: none;
          font-size: 14px;
        }

        .search-input:focus {
          border-color: #625cf5;
        }

        .members-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .member-card {
          background: white;
          border: 1px solid #e7e7ee;
          border-radius: 12px;
          padding: 22px;
          transition: 0.2s;
        }

        .member-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 8px 25px rgba(0,0,0,0.06);
        }

        .member-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .avatar {
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
        }

        .member-actions {
          display: flex;
          gap: 7px;
        }

        .action-button {
          width: 35px;
          height: 35px;
          border: none;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .edit-button {
          background: #efefff;
          color: #625cf5;
        }

        .delete-button {
          background: #fff1f1;
          color: #e05252;
        }

        .edit-button:hover {
          background: #e1e0ff;
        }

        .delete-button:hover {
          background: #ffe1e1;
        }

        .member-name {
          margin: 18px 0 5px;
          font-size: 17px;
        }

        .member-role {
          color: #625cf5;
          font-size: 13px;
          margin-bottom: 15px;
        }

        .member-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #85899a;
          font-size: 13px;
          margin-top: 9px;
          word-break: break-word;
        }

        .empty {
          background: white;
          border: 1px solid #e7e7ee;
          border-radius: 12px;
          padding: 60px 20px;
          text-align: center;
          color: #85899a;
        }

        .empty h3 {
          color: #20243a;
          margin: 15px 0 8px;
        }

        .overlay {
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
          box-shadow:
            0 20px 60px rgba(0,0,0,0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .modal-header h2 {
          margin: 0;
        }

        .close-button {
          width: 35px;
          height: 35px;
          border: none;
          background: #f1f1f5;
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
          font-size: 13px;
          font-weight: bold;
          margin-bottom: 7px;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 12px;
          border: 1px solid #dddde6;
          border-radius: 8px;
          outline: none;
          background: white;
          font-size: 14px;
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

        .save-button:hover {
          background: #514bea;
        }

        @media (max-width: 900px) {
          .members-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .summary {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 650px) {
          .header {
            padding: 20px;
          }

          .header-inner {
            flex-direction: column;
            align-items: flex-start;
          }

          .add-button {
            width: 100%;
            justify-content: center;
          }

          .content {
            padding: 20px;
          }

          .summary {
            grid-template-columns: 1fr;
          }

          .members-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HEADER */}

      <header className="header">

        <div className="header-inner">

          <div className="header-left">

            <button
              className="back-button"
              onClick={onBack}
            >
              <ArrowLeft size={20} />
            </button>

            <div>

              <h1>
                Team
              </h1>

              <p>
                Manage your project team members
              </p>

            </div>

          </div>

          <button
            className="add-button"
            onClick={openAddModal}
          >
            <Plus size={18} />
            Add Member
          </button>

        </div>

      </header>

      <main className="content">

        {/* SUMMARY */}

        <div className="summary">

          <div className="summary-card">

            <div className="summary-top">

              <div>
                <p>
                  Total Members
                </p>

                <h2>
                  {members.length}
                </h2>
              </div>

              <div className="summary-icon">
                <Users size={21} />
              </div>

            </div>

          </div>

          <div className="summary-card">

            <div className="summary-top">

              <div>
                <p>
                  Team Roles
                </p>

                <h2>
                  {roleCount}
                </h2>
              </div>

              <div className="summary-icon">
                <Briefcase size={21} />
              </div>

            </div>

          </div>

          <div className="summary-card">

            <div className="summary-top">

              <div>
                <p>
                  Search Results
                </p>

                <h2>
                  {filteredMembers.length}
                </h2>
              </div>

              <div className="summary-icon">
                <Search size={21} />
              </div>

            </div>

          </div>

        </div>

        {/* SEARCH */}

        <div className="toolbar">

          <div className="search-box">

            <Search size={18} />

            <input
              className="search-input"
              placeholder="Search team members..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>

        {/* MEMBERS */}

        {filteredMembers.length === 0 ? (

          <div className="empty">

            <Users
              size={48}
              color="#625cf5"
            />

            <h3>
              No team members found
            </h3>

            <p>
              Try another search or add
              a new member.
            </p>

          </div>

        ) : (

          <div className="members-grid">

            {filteredMembers.map(
              (member) => {

                const initials =
                  member.name
                    .split(" ")
                    .map(
                      (word) =>
                        word[0]
                    )
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                return (

                  <div
                    className="member-card"
                    key={member.id}
                  >

                    <div className="member-top">

                      <div className="avatar">
                        {initials}
                      </div>

                      <div className="member-actions">

                        <button
                          className="action-button edit-button"
                          onClick={() =>
                            openEditModal(
                              member
                            )
                          }
                          title="Edit member"
                        >
                          <Pencil
                            size={16}
                          />
                        </button>

                        <button
                          className="action-button delete-button"
                          onClick={() =>
                            deleteMember(
                              member.id
                            )
                          }
                          title="Delete member"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </div>

                    </div>

                    <h3 className="member-name">
                      {member.name}
                    </h3>

                    <div className="member-role">
                      {member.role}
                    </div>

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
              }
            )}

          </div>

        )}

      </main>

      {/* ADD / EDIT MODAL */}

      {showModal && (

        <div
          className="overlay"
          onClick={closeModal}
        >

          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
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
              >
                <X size={18} />
              </button>

            </div>

            <div className="form-group">

              <label>
                Name
              </label>

              <input
                className="form-input"
                placeholder="Enter member name"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
              />

            </div>

            <div className="form-group">

              <label>
                Email
              </label>

              <input
                className="form-input"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
              />

            </div>

            <div className="form-group">

              <label>
                Role
              </label>

              <select
                className="form-select"
                value={role}
                onChange={(event) =>
                  setRole(
                    event.target.value
                  )
                }
              >

                <option value="Project Manager">
                  Project Manager
                </option>

                <option value="Developer">
                  Developer
                </option>

                <option value="Designer">
                  Designer
                </option>

                <option value="Tester">
                  Tester
                </option>

                <option value="DevOps Engineer">
                  DevOps Engineer
                </option>

                <option value="Team Lead">
                  Team Lead
                </option>

                <option value="Data Analyst">
                  Data Analyst
                </option>

                <option value="UI/UX Designer">
                  UI/UX Designer
                </option>

              </select>

            </div>

            <div className="form-actions">

              <button
                className="cancel-button"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                className="save-button"
                onClick={saveMember}
              >
                {editingId !== null
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