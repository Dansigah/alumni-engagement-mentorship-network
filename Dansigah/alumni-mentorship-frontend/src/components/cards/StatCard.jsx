export default function StatCard({ icon, label, value, color = "primary" }) {
  return (
    <div className="col-xl-3 col-md-6">
      <div className="card border-0 shadow-sm h-100 stat-card">
        <div className="card-body d-flex align-items-center gap-3">
          <div className={`icon-box bg-${color}-subtle text-${color}`}>
            <i className={`bi ${icon} fs-4`} />
          </div>
          <div>
            <p className="text-muted mb-1">{label}</p>
            <h3 className="fw-bold mb-0">{value ?? 0}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
