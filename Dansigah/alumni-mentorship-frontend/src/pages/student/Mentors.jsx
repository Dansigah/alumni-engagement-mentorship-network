import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import MentorCard from "../../components/cards/MentorCard";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
export default function Mentors() {
  const { user } = useAuth(),
    [mentors, setMentors] = useState([]),
    [search, setSearch] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get("/users/mentors")
      .then((r) => setMentors(r.data))
      .catch(() => setError("Unable to load mentors. Please try again later."))
      .finally(() => setLoading(false));
  }, []);
  const list = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return mentors;
    return mentors.filter((mentor) =>
      [
        mentor.name,
        mentor.email,
        mentor.professionalTitle,
        mentor.currentCompany,
        mentor.currentPosition,
        mentor.industry,
        mentor.location,
        mentor.yearsOfExperience,
        ...(Array.isArray(mentor.skills) ? mentor.skills : []),
      ].some((value) => String(value ?? "").toLowerCase().includes(term)),
    );
  }, [mentors, search]);
  const request = (id) =>
    api
      .post("/mentorships", {
        studentId: user.id,
        alumniId: id,
        message: "I would like to request mentorship.",
      })
      .then(() => setMessage("Mentorship request sent successfully."))
      .catch((e) =>
        setMessage(e.response?.data?.message || "Unable to send request."),
      );
  return (
    <>
      <div className="page-title">
        <div>
          <h2>Find Mentors</h2>
          <p>Connect with experienced alumni in your network.</p>
        </div>
      </div>
      {message && <div className="alert alert-info">{message}</div>}
      {error && <ErrorState message={error} />}
      <div className="card border-0 shadow-sm p-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-search" />
          </span>
          <input
            className="form-control"
            placeholder="Search mentors by name, skill, company, location or experience"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {loading ? (
        <LoadingState message="Loading alumni mentors..." />
      ) : (
        <div className="row g-4">
          {list.length ? (
            list.map((m) => (
              <div className="col-xl-4 col-md-6" key={m.id}>
                <MentorCard mentor={m} onRequest={request} />
              </div>
            ))
          ) : (
            <div className="col-12">
              <EmptyState icon="bi-people" title="No mentors found" message={search.trim() ? "No mentors found matching your search." : "Alumni mentors will appear here when available."} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
