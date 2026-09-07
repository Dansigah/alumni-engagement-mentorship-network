import TimeInput, { toApiTime } from "../../components/common/TimeInput";
import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";

const emptyForm = { studentId: "", topic: "", date: "", hour: "", minute: "", period: "AM", mode: "ONLINE", meetingLink: "", venue: "", notes: "" };

const matchingStudents = (students, search) => {
  const term = search.trim().toLowerCase();
  return students.filter((student) => student.id != null &&
    [student.name, student.email].some((value) => String(value ?? "").toLowerCase().includes(term)));
};
const timeOf = (session) => {
  const time = session.sessionTime?.slice(0, 5) || session.sessionDate?.slice(11, 16);
  if (!time || !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) return "Time not scheduled";
  const [hour, minute] = time.split(":");
  return `${String(Number(hour) % 12 || 12).padStart(2, "0")}:${minute} ${Number(hour) < 12 ? "AM" : "PM"}`;
};
export default function Sessions() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [people, setPeople] = useState({});
  const [acceptedStudents, setAcceptedStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudents, setShowStudents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const sessionResponse = await api.get(`/sessions/user/${user.id}`);
      const sessions = Array.isArray(sessionResponse.data) ? sessionResponse.data : [];
      setRows(sessions);

      if (user.role === "ALUMNI") {
        const { data } = await api.get("/sessions/accepted-students");
        const students = Array.isArray(data) ? data : [];
        setAcceptedStudents(students);
        setPeople(Object.fromEntries(students.map((student) => [student.id, student])));
      } else {
        const alumniIds = [...new Set(sessions.map((session) => session.alumniId).filter(Boolean))];
        const responses = await Promise.all(alumniIds.map((id) => api.get(`/users/${id}`)));
        setPeople(Object.fromEntries(responses.map((response) => [response.data.id, response.data])));
      }
    } catch {
      setError("Unable to load mentorship sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user.id, user.role]);

  const change = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const selectedStudent = acceptedStudents.find((student) => student.id != null && String(student.id) === form.studentId);
  const suggestions = matchingStudents(acceptedStudents, selectedStudent ? "" : studentSearch);
  const selectStudent = (student) => {
    change("studentId", String(student.id));
    setStudentSearch(student.name || student.email || `Student #${student.id}`);
    setShowStudents(false);
  };
  const create = async (event) => {
    event.preventDefault();
    if (!selectedStudent) { setError("Select a student from the accepted-student suggestions."); return; }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const time = toApiTime(form.hour, form.minute, form.period);
      await api.post("/sessions", {
        studentId: Number(form.studentId),
        alumniId: user.id,
        topic: form.topic,
        sessionDate: `${form.date}T${time}`,
        sessionTime: time,
        mode: form.mode,
        meetingLink: form.mode === "ONLINE" ? form.meetingLink : null,
        venue: form.mode === "PHYSICAL" ? form.venue : null,
        notes: form.notes,
      });
      setForm(emptyForm);
      setStudentSearch("");
      setShowStudents(false);
      setSuccess("Session scheduled successfully.");
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to schedule session.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    if (updatingId != null) return;
    setUpdatingId(id);
    setError("");
    setSuccess("");
    try {
      await api.put(`/sessions/${id}/status?status=${status}`);
      setSuccess(`Session marked ${status.toLowerCase()}.`);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update session.");
    } finally {
      setUpdatingId(null);
    }
  };

  const dateOf = (session) => session.sessionDate?.slice(0, 10) || "Date not scheduled";

  return (
    <>
      <div className="page-title"><div><h2>Mentorship Sessions</h2><p>View and manage your mentoring sessions.</p></div></div>
      {error && <ErrorState message={error} onRetry={load} />}
      {success && <div className="alert alert-success">{success}</div>}

      {user.role === "ALUMNI" && (
        <section className="card border-0 shadow-sm p-4 mb-4">
          <h4>Schedule a Session</h4>
          {acceptedStudents.length ? (
            <form className="row g-3" onSubmit={create}>
              <div className="col-md-6">
                <label className="form-label" htmlFor="session-student-search">Student</label>
                <div className="position-relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setShowStudents(false); }}>
                  <div className="input-group">
                    <input id="session-student-search" className="form-control" type="text" autoComplete="off" required
                      placeholder="Search accepted students by name or email" value={studentSearch}
                      aria-controls="session-student-suggestions" aria-expanded={showStudents}
                      onFocus={() => setShowStudents(true)}
                      onKeyDown={(e) => { if (e.key === "Escape") setShowStudents(false); }}
                      onChange={(e) => { setStudentSearch(e.target.value); change("studentId", ""); setShowStudents(true); }} />
                    <button type="button" className="btn btn-outline-secondary" aria-label="Show student suggestions"
                      aria-expanded={showStudents} aria-controls="session-student-suggestions" onClick={() => setShowStudents((open) => !open)}>
                      <i className="bi bi-chevron-down" aria-hidden="true" />
                    </button>
                  </div>
                  {showStudents && <div id="session-student-suggestions" className="list-group position-absolute w-100 shadow-sm"
                    style={{ zIndex: 5, maxHeight: "240px", overflowY: "auto" }}>
                    {suggestions.length ? suggestions.map((student) => (
                      <button key={student.id} type="button" className="list-group-item list-group-item-action"
                        onClick={() => selectStudent(student)}>
                        <span className="d-block fw-semibold">{student.name || `Student #${student.id}`}</span>
                        {student.email && <small className="text-muted text-break">{student.email}</small>}
                      </button>
                    )) : <div className="list-group-item text-muted">No matching accepted students.</div>}
                  </div>}
                </div>
                {studentSearch && !selectedStudent && <small className="text-muted">Choose a suggestion to select the student.</small>}
              </div>
              <div className="col-md-6"><label className="form-label">Session Topic</label><input className="form-control" required value={form.topic} onChange={(e) => change("topic", e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label">Date</label><input className="form-control" required type="date" value={form.date} onChange={(e) => change("date", e.target.value)} /></div>
              <div className="col-md-4">
                <TimeInput value={form} onChange={change} />
              </div>
              <div className="col-md-4"><label className="form-label">Mode</label><select className="form-select" value={form.mode} onChange={(e) => change("mode", e.target.value)}><option value="ONLINE">Online</option><option value="PHYSICAL">Physical</option></select></div>
              {form.mode === "ONLINE" ? <div className="col-12"><label className="form-label">Meeting Link</label><input className="form-control" required type="url" placeholder="https://..." value={form.meetingLink} onChange={(e) => change("meetingLink", e.target.value)} /></div> : <div className="col-12"><label className="form-label">Venue</label><input className="form-control" required value={form.venue} onChange={(e) => change("venue", e.target.value)} /></div>}
              <div className="col-12"><label className="form-label">Notes (optional)</label><textarea className="form-control" value={form.notes} onChange={(e) => change("notes", e.target.value)} /></div>
              <div className="col-12"><button className="btn btn-primary" disabled={saving || !selectedStudent}><i className="bi bi-calendar-plus me-2" />{saving ? "Scheduling..." : "Schedule Session"}</button></div>
            </form>
          ) : <EmptyState icon="bi-person-check" title="No accepted students" message="Accept a mentorship request before scheduling a session." />}
        </section>
      )}

      {loading ? <LoadingState message="Loading mentorship sessions..." /> : rows.length ? (
        <div className="row g-4">{rows.map((session) => {
          const person = people[user.role === "STUDENT" ? session.alumniId : session.studentId];
          const status = String(session.status || "SCHEDULED").toUpperCase();
          return <div className="col-lg-6" key={session.id}><article className="card border-0 shadow-sm h-100 p-4">
            <div className="d-flex justify-content-between"><div className="session-icon"><i className="bi bi-calendar-check" /></div><span className={`badge status-${status.toLowerCase()}`}>{status}</span></div>
            <h4 className="mt-3">{session.topic || session.title || "Mentorship Session"}</h4>
            <p className="fw-semibold mb-2">{user.role === "STUDENT" ? `Mentor: ${person?.name || `Alumni #${session.alumniId}`}` : `Student: ${person?.name || `Student #${session.studentId}`}`}</p>
            <p className="mb-2"><i className="bi bi-clock me-2 text-primary" />{dateOf(session)} at {timeOf(session)}</p>
            <p className="mb-2"><i className="bi bi-geo-alt me-2 text-primary" />{session.mode || "Mode not provided"}</p>
            {session.mode === "ONLINE" && session.meetingLink && <a className="btn btn-sm btn-outline-primary align-self-start mb-3" href={session.meetingLink} target="_blank" rel="noreferrer">Join Meeting</a>}
            {session.mode === "PHYSICAL" && <p className="text-muted">Venue: {session.venue}</p>}
            {(session.notes || session.description) && <p className="text-muted">{session.notes || session.description}</p>}
            {user.role === "ALUMNI" && status === "SCHEDULED" && <div className="mt-auto pt-2"><button className="btn btn-sm btn-success me-2" disabled={updatingId === session.id} onClick={() => updateStatus(session.id, "COMPLETED")}>Mark Completed</button><button className="btn btn-sm btn-outline-danger" disabled={updatingId === session.id} onClick={() => updateStatus(session.id, "CANCELLED")}>Cancel</button></div>}
          </article></div>;
        })}</div>
      ) : <EmptyState icon="bi-calendar-x" title="No sessions yet" message="Scheduled sessions will appear here." />}
    </>
  );
}
