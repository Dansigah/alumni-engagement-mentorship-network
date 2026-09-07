import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";
const detailGroups = [
  ["Academic Information", [["courseProgram", "Course / Program", "text", 255], ["department", "Department", "text", 255], ["joiningYear", "Joining Year", "number"], ["expectedCompletionYear", "Expected Completion Year", "number"]]],
  ["Professional / Career", [["careerInterests", "Career Interests", "textarea", 2000]]],
  ["About", [["bio", "Short Bio / About", "textarea", 3000]]],
  ["Links", [["linkedinUrl", "LinkedIn URL", "url", 500], ["githubUrl", "GitHub URL", "url", 500]]],
];
const detailForm = (value = {}) => Object.fromEntries([
  ...detailGroups.flatMap(([, fields]) => fields.map(([key]) => [key, value[key] ?? ""])),
  ["skills", Array.isArray(value.skills) ? [...value.skills] : []],
]);
export default function StudentProfile() {
  const [details, setDetails] = useState(detailForm);
  const [draft, setDraft] = useState(detailForm);
  const [skillName, setSkillName] = useState("");
  const [saving, setSaving] = useState(false);
  const { user, updateUser } = useAuth(),
    [profile, setProfile] = useState(null),
    [form, setForm] = useState({ name: "", email: "" }),
    [editing, setEditing] = useState(false),
    [message, setMessage] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([api.get(`/users/${user.id}`), api.get(`/student-profiles/${user.id}`)])
      .then(([r, student]) => {
        if (!active) return;
        setProfile(r.data);
        setForm({ name: r.data.name || "", email: r.data.email || "" });
        setDetails(detailForm(student.data));
        setDraft(detailForm(student.data));
      })
      .catch(() => active && setError("Unable to load your profile."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user.id]);
  const addSkill = () => {
    const name = skillName.trim();
    if (!name || name.length > 100) {
      setMessage("Enter a skill of 1 to 100 characters.");
      return;
    }
    if (draft.skills.some((skill) => skill.toLowerCase() === name.toLowerCase())) {
      setMessage("This skill has already been added.");
      return;
    }
    setDraft({ ...draft, skills: [...draft.skills, name] });
    setSkillName("");
    setMessage("");
  };
  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (skillName.trim()) { setMessage("Add the entered skill or clear it before saving."); return; }
    if (!form.name.trim() || !form.email.trim()) { setMessage("Full Name and Email are required."); return; }
    for (const [section, fields] of detailGroups) {
      if (section !== "Links" && fields.some(([key]) => key !== "expectedCompletionYear" && !String(draft[key]).trim())) {
        setMessage("Complete all core profile fields before saving.");
        return;
      }
    }
    if (!draft.skills.length) { setMessage("Add at least one skill."); return; }
    const payload = Object.fromEntries(Object.entries(draft).map(([key, value]) =>
      [key, typeof value === "string" ? value.trim() : value]));
    payload.joiningYear = Number(payload.joiningYear);
    payload.expectedCompletionYear = payload.expectedCompletionYear === "" ? null : Number(payload.expectedCompletionYear);
    setSaving(true);
    setMessage("");
    let detailsSaved = false;
    try {
      const { data: student } = await api.put(`/student-profiles/${user.id}`, payload);
      setDetails(detailForm(student));
      setDraft(detailForm(student));
      detailsSaved = true;
      const { data } = await api.put(`/users/${user.id}`, { name: form.name.trim(), email: form.email.trim() });
      setProfile(data);
      updateUser(data);
      setForm({ name: data.name || "", email: data.email || "" });
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (e) {
      setMessage((detailsSaved ? "Student details saved, but account update failed. " : "") +
        (e.response?.data?.message || "Unable to update profile."));
    } finally {
      setSaving(false);
    }
  };
  const cancel = () => {
    setForm({ name: profile.name || "", email: profile.email || "" });
    setDraft(detailForm(details));
    setSkillName("");
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
            <div className="profile-avatar">{profile.name?.[0] || "?"}</div>
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
                <fieldset disabled={saving}>
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
                {detailGroups.map(([section, fields]) => (
                  <section className="mb-4" key={section}>
                    <h5>{section}</h5>
                    {fields.map(([key, label, type, maxLength]) => (
                      <div className="mb-3" key={key}>
                        <label className="form-label" htmlFor={key}>{label}{section === "Links" || key === "expectedCompletionYear" ? " (optional)" : ""}</label>
                        {type === "textarea" ? <textarea id={key} className="form-control" rows="3" required maxLength={maxLength}
                          value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} /> :
                          <input id={key} className="form-control" type={type} required={section !== "Links" && key !== "expectedCompletionYear"} maxLength={maxLength}
                            min={key === "joiningYear" ? 1900 : key === "expectedCompletionYear" ? Math.max(1900, Number(draft.joiningYear) || 1900) : undefined}
                            max={key === "joiningYear" ? new Date().getFullYear() + 1 : key === "expectedCompletionYear" ? new Date().getFullYear() + 15 : undefined}
                            step={type === "number" ? 1 : undefined}
                            value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />}
                      </div>
                    ))}
                    {section === "Professional / Career" && <>
                      <label className="form-label" htmlFor="student-skill">Skills</label>
                      <div className="d-flex gap-2 mb-3">
                        <input id="student-skill" className="form-control" maxLength={100} placeholder="Add a skill"
                          value={skillName} onChange={(e) => setSkillName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
                        <button type="button" className="btn btn-primary flex-shrink-0" onClick={addSkill}>Add Skill</button>
                      </div>
                      <div className="d-flex flex-wrap gap-2">{draft.skills.map((skill) => (
                        <span className="skill-chip" key={skill}>{skill}<button type="button" aria-label={`Remove ${skill}`}
                          onClick={() => setDraft({ ...draft, skills: draft.skills.filter((value) => value !== skill) })}><i className="bi bi-x" /></button></span>
                      ))}</div>
                    </>}
                  </section>
                ))}
                <div className="text-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-2"
                    onClick={cancel}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary">{saving ? "Saving..." : "Save Changes"}</button>
                </div>
                </fieldset>
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
                {detailGroups.map(([section, fields]) => (
                  <section className="col-12" key={section}>
                    <h5>{section}</h5>
                    <div className="row g-3">{fields.map(([key, label]) => (
                      <div className="col-md-6" key={key}>
                        <small className="text-muted">{label}</small>
                        <p className="fw-semibold text-break" style={{ whiteSpace: "pre-wrap" }}>{details[key] || "Not provided"}</p>
                      </div>
                    ))}</div>
                    {section === "Professional / Career" && <>
                      <small className="text-muted">Skills</small>
                      {details.skills.length ? <div className="d-flex flex-wrap gap-2 mt-2">{details.skills.map((skill) =>
                        <span className="skill-chip skill-chip-static" key={skill}>{skill}</span>)}</div> : <p>Not provided</p>}
                    </>}
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
