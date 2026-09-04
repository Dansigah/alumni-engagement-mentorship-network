import { Link } from "react-router-dom";

export default function MentorCard({ mentor, onRequest }) {
  return (
    <div className="mentor-card border rounded-4 p-3 h-100">
      <div className="d-flex align-items-center gap-3 mb-3">
        <div className="avatar">{mentor.name?.[0]?.toUpperCase() || "A"}</div>
        <div>
          <h6 className="fw-bold mb-1">{mentor.name}</h6>
          <p className="text-muted small mb-0">{mentor.professionalTitle || "Alumni Mentor"}</p>
        </div>
      </div>
      <p className="small mb-2"><i className="bi bi-building me-2 text-primary" />{mentor.currentCompany || "Company not provided"}</p>
      <div className="d-flex flex-wrap gap-1 mb-3">
        {(mentor.skills || []).slice(0, 3).map((skill) => <span className="badge text-bg-light" key={skill}>{skill}</span>)}
        <span className={`badge ${mentor.mentoringAvailable ? "status-active" : "text-bg-light"}`}>{mentor.mentoringAvailable ? "Available" : "Availability not set"}</span>
      </div>
      <div className="d-flex gap-2">
        <Link className="btn btn-sm btn-outline-primary" to={`/student/mentors/${mentor.id}`}>View Profile</Link>
        {onRequest && <button className="btn btn-sm btn-primary" onClick={() => onRequest(mentor.id)}>Request Mentorship</button>}
      </div>
    </div>
  );
}
