import RoleLayout from "./RoleLayout";
const links = [
  ["dashboard", "Dashboard", "bi-grid"],
  ["profile", "My Profile", "bi-person"],
  ["mentors", "Find Mentors", "bi-people"],
  ["recommendations", "Recommendations", "bi-stars"],
  ["mentorship-requests", "Mentorship Requests", "bi-chat-dots"],
  ["sessions", "Sessions", "bi-calendar-check"],
  ["referrals", "Referral Requests", "bi-briefcase"],
  ["events", "Events", "bi-calendar-event"],
  ["notifications", "Notifications", "bi-bell"],
].map(([p, label, icon]) => ({ to: `/student/${p}`, label, icon }));
export default function StudentLayout() {
  return <RoleLayout role="STUDENT" links={links} />;
}
