import { useEffect, useState } from "react";
import api from "../../api/client";
import PageHeader from "../common/PageHeader";
import LoadingState from "../common/LoadingState";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
export default function ResourceTable({ title, subtitle, path, columns }) {
  const [rows, setRows] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get(path)
      .then((r) => setRows(r.data))
      .catch(() => setError("Unable to load records."))
      .finally(() => setLoading(false));
  }, [path]);
  return (
    <>
      <PageHeader eyebrow="Administration" title={title} description={subtitle} />
      {error && <ErrorState message={error} />}
      <div className="card border-0 shadow-sm table-responsive">
        {loading ? (
          <LoadingState message={`Loading ${title.toLowerCase()}...`} />
        ) : (
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((r, i) => (
                  <tr key={r.id || i}>
                    {columns.map((c) => (
                      <td key={c.key}>
                        {c.badge ? (
                          <span
                            className={`badge status-${String(r[c.key] || "").toLowerCase()}`}
                          >
                            {r[c.key]}
                          </span>
                        ) : (
                          String(r[c.key] ?? "—")
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={columns.length}><EmptyState title="No records found" message="New records will appear here automatically." /></td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
