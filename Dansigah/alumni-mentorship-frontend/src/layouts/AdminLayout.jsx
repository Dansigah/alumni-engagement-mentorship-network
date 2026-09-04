import RoleLayout from "./RoleLayout";
const links = [
  ["dashboard", "Dashboard", "bi-grid"],
  ["users", "Users", "bi-people"],
  ["students", "Students", "bi-mortarboard"],
  ["alumni", "Alumni", "bi-person-badge"],
  ["pending-alumni", "Pending Alumni", "bi-person-check"],
  ["mentorships", "Mentorships", "bi-chat"],
  ["referrals", "Referrals", "bi-briefcase"],
  ["sessions", "Sessions", "bi-calendar-check"],
  ["events", "Events", "bi-calendar-event"],
  ["notifications", "Notifications", "bi-bell"],
  ["reports", "Reports", "bi-bar-chart"],
].map(([p, label, icon]) => ({ to: `/admin/${p}`, label, icon }));
export default function AdminLayout() {
  return <RoleLayout role="ADMIN" links={links} />;
}
