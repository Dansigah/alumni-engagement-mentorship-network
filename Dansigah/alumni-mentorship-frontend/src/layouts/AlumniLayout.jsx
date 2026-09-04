import RoleLayout from "./RoleLayout";
const links = [
  ["dashboard", "Dashboard", "bi-grid"],
  ["profile", "Profile", "bi-person"],
  ["mentorships", "Mentorship Requests", "bi-chat-dots"],
  ["sessions", "Sessions", "bi-calendar-check"],
  ["referrals", "Referral Requests", "bi-briefcase"],
  ["events", "Events", "bi-calendar-event"],
  ["notifications", "Notifications", "bi-bell"],
].map(([p, label, icon]) => ({ to: `/alumni/${p}`, label, icon }));
export default function AlumniLayout() {
  return <RoleLayout role="ALUMNI" links={links} />;
}
