import MentorshipRequestForm from "../../components/common/MentorshipRequestForm";
import { useEffect, useState } from "react";
import MentorCard from "../../components/cards/MentorCard";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function Recommendations() {
  const [requestingId, setRequestingId] = useState(null);
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const loadRecommendations = async () => {
      try {
        const response = await api.get("/users/mentors");
        if (active) {
          setMentors(
            Array.isArray(response.data)
              ? response.data.filter((mentor) => mentor?.id != null)
              : [],
          );
        }
      } catch {
        if (active) {
          setError(
            "Unable to load mentor recommendations. Please try again later.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRecommendations();
    return () => {
      active = false;
    };
  }, []);

  const requestMentorship = async (alumniId, requestMessage) => {
    try {
      await api.post("/mentorships", {
        studentId: user.id,
        alumniId,
        message: requestMessage,
      });
      setMessage("Mentorship request sent successfully.");
      setRequestingId(null);
    } catch (requestError) {
      setMessage(
        requestError.response?.data?.message ||
          "Unable to send mentorship request.",
      );
    }
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h2>Mentor Recommendations</h2>
          <p>Explore suitable alumni mentors from the current network.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-info">{message}</div>}
      {requestingId != null && <MentorshipRequestForm key={requestingId} onSubmit={(text) => requestMentorship(requestingId, text)} onCancel={() => setRequestingId(null)} />}

      {loading ? (
        <div className="page-loader">
          <div className="spinner-border text-primary" />
          <p>Loading recommendations...</p>
        </div>
      ) : mentors.length ? (
        <div className="row g-4">
          {mentors.map((mentor) => (
            <div className="col-xl-4 col-md-6" key={mentor.id}>
              <MentorCard mentor={mentor} onRequest={setRequestingId} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No mentor recommendations are available yet.
        </div>
      )}
    </>
  );
}
