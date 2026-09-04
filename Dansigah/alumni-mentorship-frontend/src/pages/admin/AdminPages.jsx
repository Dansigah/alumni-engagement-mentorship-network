import ResourceTable from "../../components/admin/ResourceTable";
const users = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", badge: true },
  ],
  requests = [
    { key: "id", label: "ID" },
    { key: "studentId", label: "Student ID" },
    { key: "alumniId", label: "Alumni ID" },
    { key: "message", label: "Message" },
    { key: "status", label: "Status", badge: true },
  ],
  refs = [
    { key: "id", label: "ID" },
    { key: "studentId", label: "Student ID" },
    { key: "alumniId", label: "Alumni ID" },
    { key: "company", label: "Company" },
    { key: "position", label: "Position" },
    { key: "status", label: "Status", badge: true },
  ],
  sessions = [
    { key: "id", label: "ID" },
    { key: "studentId", label: "Student ID" },
    { key: "alumniId", label: "Alumni ID" },
    { key: "title", label: "Title" },
    { key: "sessionDate", label: "Session Date" },
    { key: "status", label: "Status", badge: true },
  ];
export const AdminUsers = () => (
  <ResourceTable
    title="Users"
    subtitle="All registered network users."
    path="/admin/users"
    columns={users}
  />
);
export const AdminStudents = () => (
  <ResourceTable
    title="Students"
    subtitle="Registered student accounts."
    path="/admin/students"
    columns={users}
  />
);
export const AdminMentorships = () => (
  <ResourceTable
    title="Mentorship Requests"
    subtitle="All mentorship activity."
    path="/admin/mentorships"
    columns={requests}
  />
);
export const AdminReferrals = () => (
  <ResourceTable
    title="Referral Requests"
    subtitle="All referral activity."
    path="/admin/referrals"
    columns={refs}
  />
);
export const AdminSessions = () => (
  <ResourceTable
    title="Mentorship Sessions"
    subtitle="All scheduled mentorship sessions."
    path="/sessions"
    columns={sessions}
  />
);
export const AdminReports = () => (
  <ResourceTable
    title="Reports"
    subtitle="Current system statistics."
    path="/admin/reports"
    columns={[{ key: "totalUsers", label: "Total Users" }]}
  />
);
