export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Editor" | "Viewer";
  department: string;
  avatar: string;
  joinedDate: string;
  status: "active" | "invited" | "deactivated";
}

export const teamMembers: TeamMember[] = [
  {
    id: "member-001",
    name: "Marcus Rivera",
    email: "marcus@mavionix.io",
    role: "Owner",
    department: "Engineering",
    avatar: "MR",
    joinedDate: "2023-06-01",
    status: "active",
  },
  {
    id: "member-002",
    name: "Aisha Patel",
    email: "aisha@mavionix.io",
    role: "Admin",
    department: "Design",
    avatar: "AP",
    joinedDate: "2023-07-15",
    status: "active",
  },
  {
    id: "member-003",
    name: "Jordan Kim",
    email: "jordan@mavionix.io",
    role: "Editor",
    department: "Business Development",
    avatar: "JK",
    joinedDate: "2023-08-20",
    status: "active",
  },
  {
    id: "member-004",
    name: "Sarah Chen",
    email: "sarah@mavionix.io",
    role: "Editor",
    department: "Operations",
    avatar: "SC",
    joinedDate: "2024-01-05",
    status: "active",
  },
  {
    id: "member-005",
    name: "Tomas Vasquez",
    email: "tomas@mavionix.io",
    role: "Viewer",
    department: "Marketing",
    avatar: "TV",
    joinedDate: "2024-01-10",
    status: "invited",
  },
  {
    id: "member-006",
    name: "Priya Nair",
    email: "priya@mavionix.io",
    role: "Editor",
    department: "Engineering",
    avatar: "PN",
    joinedDate: "2023-09-12",
    status: "deactivated",
  },
];
