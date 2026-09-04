import { useEffect, useRef, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";

const emptyProfile = {
  professionalTitle: "", currentCompany: "", currentPosition: "", industry: "",
  yearsOfExperience: "", location: "", professionalSummary: "", linkedinUrl: "",
  mentoringAvailable: false, availabilityNote: "",
};
const emptyEmployment = {
  companyName: "", jobTitle: "", startDate: "", endDate: "",
  currentlyWorking: false, description: "",
};

export default function AlumniProfile() {
  const { user, updateUser } = useAuth();
  const [personal, setPersonal] = useState({ name: "", email: "" });
  const [profile, setProfile] = useState(emptyProfile);
  const [skills, setSkills] = useState([]);
  const [employment, setEmployment] = useState([]);
  const [skillName, setSkillName] = useState("");
  const [employmentForm, setEmploymentForm] = useState(emptyEmployment);
  const [editingEmployment, setEditingEmployment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const saved = useRef({ personal: { name: "", email: "" }, profile: emptyProfile });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [userResponse, profileResponse, skillResponse, employmentResponse] = await Promise.all([
        api.get(`/users/${user.id}`),
        api.get(`/alumni-profiles/${user.id}`),
        api.get(`/alumni-profiles/${user.id}/skills`),
        api.get(`/alumni-profiles/${user.id}/employment`),
      ]);
      const loadedPersonal = { name: userResponse.data.name || "", email: userResponse.data.email || "" };
      const loadedProfile = { ...emptyProfile, ...profileResponse.data, yearsOfExperience: profileResponse.data.yearsOfExperience ?? "" };
      setPersonal(loadedPersonal);
      setProfile(loadedProfile);
      saved.current = { personal: loadedPersonal, profile: loadedProfile };
      setSkills(Array.isArray(skillResponse.data) ? skillResponse.data : []);
      setEmployment(Array.isArray(employmentResponse.data) ? employmentResponse.data : []);
    } catch {
      setError("Unable to load your professional profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user.id]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const [userResponse, profileResponse] = await Promise.all([
        api.put(`/users/${user.id}`, personal),
        api.put(`/alumni-profiles/${user.id}`, {
          ...profile,
          yearsOfExperience: profile.yearsOfExperience === "" ? null : Number(profile.yearsOfExperience),
        }),
      ]);
      const updatedPersonal = { name: userResponse.data.name || "", email: userResponse.data.email || "" };
      const updatedProfile = { ...emptyProfile, ...profileResponse.data, yearsOfExperience: profileResponse.data.yearsOfExperience ?? "" };
      updateUser({ ...user, name: updatedPersonal.name, email: updatedPersonal.email });
      setPersonal(updatedPersonal);
      setProfile(updatedProfile);
      saved.current = { personal: updatedPersonal, profile: updatedProfile };
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post(`/alumni-profiles/${user.id}/skills`, { name: skillName });
      setSkills((current) => [...current, data].sort((a, b) => a.name.localeCompare(b.name)));
      setSkillName("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to add skill.");
    }
  };

  const removeSkill = async (skillId) => {
    setError("");
    try {
      await api.delete(`/alumni-profiles/skills/${skillId}`);
      setSkills((current) => current.filter((skill) => skill.id !== skillId));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to remove skill.");
    }
  };

  const saveEmployment = async (event) => {
    event.preventDefault();
    setError("");
    const payload = { ...employmentForm, endDate: employmentForm.currentlyWorking ? null : employmentForm.endDate || null };
    try {
      if (editingEmployment) {
        await api.put(`/alumni-profiles/employment/${editingEmployment}`, payload);
      } else {
        await api.post(`/alumni-profiles/${user.id}/employment`, payload);
      }
      setEmploymentForm(emptyEmployment);
      setEditingEmployment(null);
      const { data } = await api.get(`/alumni-profiles/${user.id}/employment`);
      setEmployment(data);
      setSuccess("Employment history updated.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save employment record.");
    }
  };

  const editEmployment = (item) => {
    setEditingEmployment(item.id);
    setEmploymentForm({
      companyName: item.companyName || "", jobTitle: item.jobTitle || "",
      startDate: item.startDate || "", endDate: item.endDate || "",
      currentlyWorking: Boolean(item.currentlyWorking), description: item.description || "",
    });
  };

  const deleteEmployment = async (id) => {
    setError("");
    try {
      await api.delete(`/alumni-profiles/employment/${id}`);
      setEmployment((current) => current.filter((item) => item.id !== id));
      setSuccess("Employment record deleted.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete employment record.");
    }
  };

  const updateAvailability = async () => {
    setError("");
    try {
      const { data } = await api.put(`/alumni-profiles/${user.id}/availability`, {
        mentoringAvailable: profile.mentoringAvailable,
        availabilityNote: profile.availabilityNote,
      });
      const updatedProfile = { ...profile, ...data };
      setProfile(updatedProfile);
      saved.current = { ...saved.current, profile: updatedProfile };
      setSuccess("Mentoring availability updated.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update availability.");
    }
  };

  const cancelEditing = () => {
    setPersonal({ ...saved.current.personal });
    setProfile({ ...saved.current.profile });
    setSkillName("");
    setEmploymentForm(emptyEmployment);
    setEditingEmployment(null);
    setError("");
    setEditing(false);
  };

  const displayValue = (value) => value === null || value === undefined || value === "" ? "Not provided" : value;
  const linkedInHref = (() => {
    if (!profile.linkedinUrl) return "";
    try {
      const url = new URL(profile.linkedinUrl);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  })();
  if (loading) return <LoadingState message="Loading your professional profile..." />;

  return (
    <>
      <PageHeader eyebrow="Alumni Profile" title="My Professional Profile" description="Keep your information current so students can understand your experience and mentoring availability." action={!editing && <button className="btn btn-primary" onClick={() => { setSuccess(""); setEditing(true); }}><i className="bi bi-pencil-square me-2" />Edit Profile</button>} />
      {error && <ErrorState message={error} onRetry={load} />}
      {success && <div className="alert alert-success">{success}</div>}

      {editing ? <form onSubmit={saveProfile}>
        <section className="card profile-section mb-4">
          <div className="card-header-clean"><div><h4>Personal Information</h4><p>Your account name and email address</p></div></div>
          <div className="card-body row g-3">
            <div className="col-md-6"><label className="form-label">Full Name</label><input className="form-control" required value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} /></div>
            <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" type="email" required value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} /></div>
          </div>
        </section>

        <section className="card profile-section mb-4">
          <div className="card-header-clean"><div><h4>Professional Information</h4><p>Information visible on your mentor profile</p></div></div>
          <div className="card-body row g-3">
            {[["professionalTitle","Professional Title"],["currentCompany","Current Company"],["currentPosition","Current Position"],["industry","Industry"],["location","Location"]].map(([key,label]) => (
              <div className="col-md-6" key={key}><label className="form-label">{label}</label><input className="form-control" value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} /></div>
            ))}
            <div className="col-md-6"><label className="form-label">Years of Experience</label><input className="form-control" type="number" min="0" value={profile.yearsOfExperience} onChange={(e) => setProfile({ ...profile, yearsOfExperience: e.target.value })} /></div>
            <div className="col-12"><label className="form-label">LinkedIn URL</label><input className="form-control" type="url" placeholder="https://www.linkedin.com/in/..." value={profile.linkedinUrl} onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })} /></div>
            <div className="col-12"><label className="form-label">Professional Summary</label><textarea className="form-control" rows="4" value={profile.professionalSummary} onChange={(e) => setProfile({ ...profile, professionalSummary: e.target.value })} /></div>
            <div className="col-12 text-end"><button type="button" className="btn btn-outline-secondary me-2" disabled={saving} onClick={cancelEditing}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button></div>
          </div>
        </section>
      </form> : <>
        <section className="card profile-section mb-4">
          <div className="card-header-clean"><div><h4>Personal Information</h4><p>Your account name and email address</p></div></div>
          <div className="card-body"><dl className="row profile-details mb-0"><div className="col-md-6"><dt>Full Name</dt><dd>{displayValue(personal.name)}</dd></div><div className="col-md-6"><dt>Email</dt><dd>{displayValue(personal.email)}</dd></div></dl></div>
        </section>
        <section className="card profile-section mb-4">
          <div className="card-header-clean"><div><h4>Professional Information</h4><p>Information visible on your mentor profile</p></div></div>
          <div className="card-body"><dl className="row profile-details mb-0">
            <div className="col-md-6"><dt>Professional Title</dt><dd>{displayValue(profile.professionalTitle)}</dd></div><div className="col-md-6"><dt>Current Company</dt><dd>{displayValue(profile.currentCompany)}</dd></div>
            <div className="col-md-6"><dt>Current Position</dt><dd>{displayValue(profile.currentPosition)}</dd></div><div className="col-md-6"><dt>Industry</dt><dd>{displayValue(profile.industry)}</dd></div>
            <div className="col-md-6"><dt>Location</dt><dd>{displayValue(profile.location)}</dd></div><div className="col-md-6"><dt>Years of Experience</dt><dd>{displayValue(profile.yearsOfExperience)}</dd></div>
            <div className="col-12"><dt>LinkedIn</dt><dd>{linkedInHref ? <a href={linkedInHref} target="_blank" rel="noopener noreferrer">{profile.linkedinUrl}</a> : displayValue(profile.linkedinUrl)}</dd></div>
            <div className="col-12"><dt>Professional Summary</dt><dd className="profile-summary">{displayValue(profile.professionalSummary)}</dd></div>
          </dl></div>
        </section>
      </>}

      <section className="card profile-section mb-4">
        <div className="card-header-clean"><div><h4>Skills</h4><p>Add the areas where you can guide students</p></div></div>
        <div className="card-body">
          {editing && <form className="d-flex gap-2 mb-3" onSubmit={addSkill}><input className="form-control" maxLength="100" required placeholder="Add a skill" value={skillName} onChange={(e) => setSkillName(e.target.value)} /><button className="btn btn-primary flex-shrink-0">Add Skill</button></form>}
          {skills.length ? <div className="d-flex flex-wrap gap-2">{skills.map((skill) => <span className={`skill-chip${editing ? "" : " skill-chip-static"}`} key={skill.id}>{skill.name}{editing && <button type="button" onClick={() => removeSkill(skill.id)} aria-label={`Remove ${skill.name}`}><i className="bi bi-x" /></button>}</span>)}</div> : <EmptyState icon="bi-lightbulb" title="No skills added" message={editing ? "Add your first professional skill above." : "No professional skills have been added yet."} />}
        </div>
      </section>

      <section className="card profile-section mb-4">
        <div className="card-header-clean"><div><h4>Employment History</h4><p>Share your current and previous professional experience</p></div></div>
        <div className="card-body">
          {editing && <form className="row g-3 employment-form" onSubmit={saveEmployment}>
            <div className="col-md-6"><label className="form-label">Company</label><input className="form-control" required value={employmentForm.companyName} onChange={(e) => setEmploymentForm({ ...employmentForm, companyName: e.target.value })} /></div>
            <div className="col-md-6"><label className="form-label">Job Title</label><input className="form-control" required value={employmentForm.jobTitle} onChange={(e) => setEmploymentForm({ ...employmentForm, jobTitle: e.target.value })} /></div>
            <div className="col-md-4"><label className="form-label">Start Date</label><input className="form-control" type="date" required value={employmentForm.startDate} onChange={(e) => setEmploymentForm({ ...employmentForm, startDate: e.target.value })} /></div>
            <div className="col-md-4"><label className="form-label">End Date</label><input className="form-control" type="date" disabled={employmentForm.currentlyWorking} value={employmentForm.endDate} onChange={(e) => setEmploymentForm({ ...employmentForm, endDate: e.target.value })} /></div>
            <div className="col-md-4 d-flex align-items-end pb-2"><div className="form-check form-switch"><input className="form-check-input" type="checkbox" id="currentlyWorking" checked={employmentForm.currentlyWorking} onChange={(e) => setEmploymentForm({ ...employmentForm, currentlyWorking: e.target.checked, endDate: e.target.checked ? "" : employmentForm.endDate })} /><label className="form-check-label" htmlFor="currentlyWorking">Currently working here</label></div></div>
            <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows="2" value={employmentForm.description} onChange={(e) => setEmploymentForm({ ...employmentForm, description: e.target.value })} /></div>
            <div className="col-12"><button className="btn btn-primary">{editingEmployment ? "Update Employment" : "Add Employment"}</button>{editingEmployment && <button type="button" className="btn btn-outline-secondary ms-2" onClick={() => { setEditingEmployment(null); setEmploymentForm(emptyEmployment); }}>Cancel</button>}</div>
          </form>}
          {editing && <hr className="my-4" />}
          {employment.length ? employment.map((item) => <article className="employment-item" key={item.id}><div><h5>{item.jobTitle}</h5><p className="mb-1 fw-semibold">{item.companyName}</p><small>{item.startDate} — {item.currentlyWorking ? "Present" : item.endDate || "Not specified"}</small>{item.description && <p className="mt-2 mb-0 text-muted">{item.description}</p>}</div>{editing && <div><button className="btn btn-sm btn-outline-primary me-2" onClick={() => editEmployment(item)}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => deleteEmployment(item.id)}>Delete</button></div>}</article>) : <EmptyState icon="bi-briefcase" title="No employment history" message={editing ? "Add your first employment record using the form above." : "No employment history has been added yet."} />}
        </div>
      </section>

      <section className="card profile-section availability-panel">
        <div className="card-body d-md-flex align-items-center justify-content-between gap-4">
          <div><h4>Mentoring Availability</h4><p className="text-muted mb-md-0">Let students know whether you are currently available to mentor.</p></div>
          {editing ? <div className="availability-controls"><div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" id="mentoringAvailable" checked={profile.mentoringAvailable} onChange={(e) => setProfile({ ...profile, mentoringAvailable: e.target.checked })} /><label className="form-check-label fw-semibold" htmlFor="mentoringAvailable">{profile.mentoringAvailable ? "Available for Mentoring" : "Not Available"}</label></div><input className="form-control mb-2" placeholder="Optional availability note" value={profile.availabilityNote} onChange={(e) => setProfile({ ...profile, availabilityNote: e.target.value })} /><button type="button" className="btn btn-primary" onClick={updateAvailability}>Update Availability</button></div> : <div className="availability-controls"><p className="fw-semibold mb-1">{profile.mentoringAvailable ? "Available for Mentoring" : "Not Available"}</p><p className="text-muted mb-0">{displayValue(profile.availabilityNote)}</p></div>}
        </div>
      </section>
    </>
  );
}
