import { useCallback, useEffect, useState } from "react";
import api from "../../api/client";
import PageHeader from "../../components/common/PageHeader";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";

export default function AdminAlumni({ pendingOnly = false }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(
        pendingOnly ? "/admin/alumni/pending" : "/admin/alumni",
      );
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setError("Unable to load Alumni accounts.");
    } finally {
      setLoading(false);
    }
  }, [pendingOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (id, path, message) => {
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await api.put(path);
      setSuccess(message);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update account.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <LoadingState message="Loading Alumni accounts..." />;

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title={pendingOnly ? "Pending Alumni" : "Alumni Accounts"}
        description={
          pendingOnly
            ? "Review newly registered Alumni before they can access mentorship features."
            : "View verification and account status for all Alumni."
        }
      />
      {error && <ErrorState message={error} onRetry={load} />}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="card table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Verification</th>
              <th>Account</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((alumni) => {
              const busy = busyId === alumni.id;
              return (
                <tr key={alumni.id}>
                  <td className="fw-semibold">{alumni.name}</td>
                  <td>{alumni.email}</td>
                  <td><span className={`badge status-${alumni.verificationStatus?.toLowerCase()}`}>{alumni.verificationStatus}</span></td>
                  <td><span className={`badge status-${alumni.accountStatus?.toLowerCase()}`}>{alumni.accountStatus}</span></td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      {alumni.verificationStatus !== "APPROVED" && (
                        <button className="btn btn-sm btn-success" disabled={busy} onClick={() => update(alumni.id, `/admin/alumni/${alumni.id}/approve`, "Alumni account approved.")}>Approve</button>
                      )}
                      {alumni.verificationStatus !== "REJECTED" && (
                        <button className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => update(alumni.id, `/admin/alumni/${alumni.id}/reject`, "Alumni registration rejected.")}>Reject</button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={busy}
                        onClick={() => {
                          const next = alumni.accountStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
                          update(alumni.id, `/admin/users/${alumni.id}/account-status?status=${next}`, `Account ${next.toLowerCase()}.`);
                        }}
                      >
                        {alumni.accountStatus === "ACTIVE" ? "Suspend" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan="5"><EmptyState icon="bi-person-check" title={pendingOnly ? "No pending Alumni" : "No Alumni accounts"} message="There are no matching accounts at this time." /></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
