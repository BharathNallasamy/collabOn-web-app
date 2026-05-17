import React, { createContext, useContext, useState } from "react";

import { type Role } from "../types/interfaces";
export type { Role };

// ── Seed data — replace with API call when backend is ready ───────────────────
const SEED_ROLES: Role[] = [
  { id: 1, name: "Super Admin", created: "2024-01-10", modified: "2024-06-15" },
  { id: 2, name: "Admin", created: "2024-01-10", modified: "2024-06-15" },
  { id: 3, name: "Faculty", created: "2024-01-12", modified: "2024-05-20" },
  { id: 4, name: "Student", created: "2024-01-12", modified: "2024-05-20" },
  { id: 5, name: "HR Manager", created: "2024-01-15", modified: "2024-06-01" },
  { id: 6, name: "Finance Officer", created: "2024-01-15", modified: "2024-06-01" },
  { id: 7, name: "IT Staff", created: "2024-01-18", modified: "2024-04-10" },
  { id: 8, name: "Librarian", created: "2024-01-18", modified: "2024-04-10" },
  { id: 9, name: "Admissions Officer", created: "2024-01-20", modified: "2024-05-05" },
  { id: 10, name: "Academic Advisor", created: "2024-01-20", modified: "2024-05-05" },
  { id: 11, name: "Department Head", created: "2024-02-01", modified: "2024-06-10" },
  { id: 12, name: "Lab Technician", created: "2024-02-01", modified: "2024-06-10" },
  { id: 13, name: "Sports Coach", created: "2024-02-05", modified: "2024-03-15" },
  { id: 14, name: "Cultural Coordinator", created: "2024-02-05", modified: "2024-03-15" },
  { id: 15, name: "Research Associate", created: "2024-02-10", modified: "2024-06-20" },
  { id: 16, name: "Alumni Coordinator", created: "2024-02-10", modified: "2024-06-20" },
  { id: 17, name: "Guest Lecturer", created: "2024-02-12", modified: "2024-04-25" },
  { id: 18, name: "Exam Controller", created: "2024-02-12", modified: "2024-04-25" },
  { id: 19, name: "Hostel Warden", created: "2024-02-15", modified: "2024-05-30" },
  { id: 20, name: "Security Staff", created: "2024-02-15", modified: "2024-05-30" },
];

// ── Context ───────────────────────────────────────────────────────────────────
interface RolesContextType {
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
}

const RolesContext = createContext<RolesContextType | null>(null);

export const RolesProvider = ({ children }: { children: React.ReactNode }) => {
  const [roles, setRoles] = useState<Role[]>(SEED_ROLES);
  return <RolesContext.Provider value={{ roles, setRoles }}>{children}</RolesContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRoles = (): RolesContextType => {
  const ctx = useContext(RolesContext);
  if (!ctx) throw new Error("useRoles must be used within a RolesProvider");
  return ctx;
};
