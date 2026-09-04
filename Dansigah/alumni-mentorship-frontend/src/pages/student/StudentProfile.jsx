import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";
export default function StudentProfile() {
  const { user, updateUser } = useAuth(),
    [profile, setProfile] = useState(null),
    [form, setForm] = useState({ name: "", email: "" }),
    [editing, setEditing] = useState(false),
    [message, setMessage] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api.get(`/users/${user.id}`)
      .then((r) => {
        if (!active) return;
        setProfile(r.data);
        setForm({ name: r.data.name, email: r.data.email });
      })
      .catch(() => active && setError("Unable to load your profile."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user.id]);
  const save = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/users/${user.id}`, form);
      setProfile(data);
      updateUser(data);
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (e) {
      setMessage(e.response?.data?.message || "Unable to update profile.");
    }
  };
  const cancel = () => {
    setForm({ name: profile.name || "", email: profile.email || "" });
    setMessage("");
    setEditing(false);
  };
  if (loading) return <LoadingState message="Loading your profile..." />;
  if (error || !profile) return <ErrorState message={error || "Profile information is unavailable."} />;
  return (
    <>
      <div className="page-title">
        <div>
          <h2>My Profile</h2>
          <p>Manage your personal information.</p>
        </div>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            <i className="bi bi-pencil-square me-2" />
            Edit Profile
          </button>
        )}
      </div>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm text-center p-4">
            <div className="profile-avatar">{profile.name[0]}</div>
            <h3>{profile.name}</h3>
            <span className="badge text-bg-primary-subtle text-primary">
              {profile.role}
            </span>
            <hr />
            <p>
              <i className="bi bi-envelope me-2 text-primary" />
              {profile.email}
            </p>
            <p className="mb-0 text-muted">User ID: {profile.id}</p>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4">
            <h4 className="mb-4">Account Information</h4>
            {editing ? (
              <form onSubmit={save}>
                <label className="form-label">Full Name</label>
                <input
                  className="form-control mb-3"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <label className="form-label">Email</label>
                <input
                  className="form-control mb-3"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <label className="form-label">Role</label>
                <input
                  className="form-control mb-4"
                  disabled
                  value={profile.role}
                />
                <div className="text-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-2"
                    onClick={cancel}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            ) : (
              <div className="row g-4">
                <div className="col-md-6">
                  <small className="text-muted">Full Name</small>
                  <p className="fw-semibold">{profile.name}</p>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">Email Address</small>
                  <p className="fw-semibold">{profile.email}</p>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">Account Role</small>
                  <p className="fw-semibold">{profile.role}</p>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">User ID</small>
                  <p className="fw-semibold">{profile.id}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
