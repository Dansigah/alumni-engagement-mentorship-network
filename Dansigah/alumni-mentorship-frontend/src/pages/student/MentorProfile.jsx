import MentorshipRequestForm from "../../components/common/MentorshipRequestForm";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";

export default function MentorProfile() {
  const { id } = useParams();
  const [requestingId, setRequestingId] = useState(null);
  const { user } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [profile, setProfile] = useState({});
  const [skills, setSkills] = useState([]);
  const [employment, setEmployment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [mentorResponse, profileResponse, skillResponse, employmentResponse] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/alumni-profiles/${id}`),
          api.get(`/alumni-profiles/${id}/skills`),
          api.get(`/alumni-profiles/${id}/employment`),
        ]);
        if (!active || mentorResponse.data.role !== "ALUMNI") return;
        setMentor(mentorResponse.data);
        setProfile(profileResponse.data || {});
        setSkills(Array.isArray(skillResponse.data) ? skillResponse.data : []);
        setEmployment(Array.isArray(employmentResponse.data) ? employmentResponse.data : []);
      } catch {
        if (active) setError("Unable to load this mentor profile.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  const request = async (requestMessage) => {
    setMessage("");
    try {
      await api.post("/mentorships", {
        studentId: user.id,
        alumniId: Number(id),
        message: requestMessage,
      });
      setMessage("Mentorship request sent successfully.");
      setRequestingId(null);
    } catch (requestError) {
      setMessage(requestError.response?.data?.message || "Unable to send request.");
    }
  };

  if (loading) return <LoadingState message="Loading mentor profile..." />;
  if (error || !mentor) return <ErrorState message={error || "Mentor profile is unavailable."} />;

  return (
    <>
      <PageHeader
        eyebrow="Mentor Profile"
        title={mentor.name}
        description={profile.professionalTitle || "Alumni mentor"}
        action={<Link className="btn btn-outline-primary" to="/student/mentors"><i className="bi bi-arrow-left me-2" />Back to Mentors</Link>}
      />
      {message && <div className="alert alert-info">{message}</div>}
      {requestingId != null && <MentorshipRequestForm key={requestingId} onSubmit={request} onCancel={() => setRequestingId(null)} />}
      <div className="row g-4">
        <div className="col-lg-4">
          <section className="card text-center p-4">
            <div className="profile-avatar">{mentor.name?.[0]}</div>
            <h3>{mentor.name}</h3>
            <p className="text-muted">{profile.currentPosition || "Position not provided"}{profile.currentCompany && ` at ${profile.currentCompany}`}</p>
            <span className={`badge mx-auto mb-3 ${profile.mentoringAvailable ? "status-active" : "text-bg-light"}`}>{profile.mentoringAvailable ? "Available for Mentoring" : "Not currently available"}</span>
            <button className="btn btn-primary" onClick={() => setRequestingId(Number(id))}><i className="bi bi-person-plus me-2" />Request Mentorship</button>
          </section>
          <section className="card p-4 mt-4">
            <h4>Professional Details</h4>
            <dl className="profile-details mb-0">
              <dt>Industry</dt><dd>{profile.industry || "Not provided"}</dd>
              <dt>Experience</dt><dd>{profile.yearsOfExperience != null ? `${profile.yearsOfExperience} years` : "Not provided"}</dd>
              <dt>Location</dt><dd>{profile.location || "Not provided"}</dd>
            </dl>
          </section>
        </div>
        <div className="col-lg-8">
          <section className="card p-4 mb-4">
            <h4>Professional Summary</h4>
            <p className="text-muted mb-0">{profile.professionalSummary || "This Alumni has not added a professional summary yet."}</p>
          </section>
          <section className="card p-4 mb-4">
            <h4>Skills</h4>
            {skills.length ? <div className="d-flex flex-wrap gap-2">{skills.map((skill) => <span className="skill-chip skill-chip-static" key={skill.id}>{skill.name}</span>)}</div> : <EmptyState icon="bi-lightbulb" title="No skills listed" message="Skills have not been added yet." />}
          </section>
          <section className="card p-4">
            <h4>Employment History</h4>
            {employment.length ? employment.map((item) => <article className="employment-item" key={item.id}><div><h5>{item.jobTitle}</h5><p className="mb-1 fw-semibold">{item.companyName}</p><small>{item.startDate} â€” {item.currentlyWorking ? "Present" : item.endDate || "Not specified"}</small>{item.description && <p className="mt-2 mb-0 text-muted">{item.description}</p>}</div></article>) : <EmptyState icon="bi-briefcase" title="No employment history" message="Employment information has not been added yet." />}
          </section>
        </div>
      </div>
    </>
  );
}
