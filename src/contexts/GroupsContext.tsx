import React, { createContext, useContext, useState } from "react";

import { type Group, RIGHTS_MODULES, REPORT_MODULES, makeDefaultPerms } from "../types/groups";

// Re-export types only
export type { PermMap, Group } from "../types/groups";

// ── Seed groups — replace with API call when backend is ready ─────────────────
const SEED_GROUPS: Group[] = [
  {
    id: 1,
    name: "Management Group",
    rightsPerms: makeDefaultPerms(RIGHTS_MODULES),
    reportPerms: makeDefaultPerms(REPORT_MODULES),
  },
  {
    id: 2,
    name: "Admin Group",
    rightsPerms: makeDefaultPerms(RIGHTS_MODULES),
    reportPerms: makeDefaultPerms(REPORT_MODULES),
  },
  {
    id: 3,
    name: "Faculty Group",
    rightsPerms: makeDefaultPerms(RIGHTS_MODULES),
    reportPerms: makeDefaultPerms(REPORT_MODULES),
  },
  {
    id: 4,
    name: "Student Group",
    rightsPerms: makeDefaultPerms(RIGHTS_MODULES),
    reportPerms: makeDefaultPerms(REPORT_MODULES),
  },
  {
    id: 5,
    name: "IT Department",
    rightsPerms: makeDefaultPerms(RIGHTS_MODULES),
    reportPerms: makeDefaultPerms(REPORT_MODULES),
  },
  {
    id: 6,
    name: "Finance Group",
    rightsPerms: makeDefaultPerms(RIGHTS_MODULES),
    reportPerms: makeDefaultPerms(REPORT_MODULES),
  },
  {
    id: 7,
    name: "HR Group",
    rightsPerms: makeDefaultPerms(RIGHTS_MODULES),
    reportPerms: makeDefaultPerms(REPORT_MODULES),
  },
  {
    id: 8,
    name: "Academic Group",
    rightsPerms: makeDefaultPerms(RIGHTS_MODULES),
    reportPerms: makeDefaultPerms(REPORT_MODULES),
  },
  {
    id: 9,
    name: "Library Group",
    rightsPerms: makeDefaultPerms(RIGHTS_MODULES),
    reportPerms: makeDefaultPerms(REPORT_MODULES),
  },
  {
    id: 10,
    name: "Sports Group",
    rightsPerms: makeDefaultPerms(RIGHTS_MODULES),
    reportPerms: makeDefaultPerms(REPORT_MODULES),
  },
  {
    id: 11,
    name: "Cultural Group",
    rightsPerms: makeDefaultPerms(RIGHTS_MODULES),
    reportPerms: makeDefaultPerms(REPORT_MODULES),
  },
  {
    id: 12,
    name: "Research Group",
    rightsPerms: makeDefaultPerms(RIGHTS_MODULES),
    reportPerms: makeDefaultPerms(REPORT_MODULES),
  },
  {
    id: 13,
    name: "Alumni Group",
    rightsPerms: makeDefaultPerms(RIGHTS_MODULES),
    reportPerms: makeDefaultPerms(REPORT_MODULES),
  },
  {
    id: 14,
    name: "Guest Group",
    rightsPerms: makeDefaultPerms(RIGHTS_MODULES),
    reportPerms: makeDefaultPerms(REPORT_MODULES),
  },
];

// ── Context ───────────────────────────────────────────────────────────────────
interface GroupsContextType {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
}

const GroupsContext = createContext<GroupsContextType | null>(null);

export const GroupsProvider = ({ children }: { children: React.ReactNode }) => {
  const [groups, setGroups] = useState<Group[]>(SEED_GROUPS);
  return <GroupsContext.Provider value={{ groups, setGroups }}>{children}</GroupsContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGroups = (): GroupsContextType => {
  const ctx = useContext(GroupsContext);
  if (!ctx) throw new Error("useGroups must be used within a GroupsProvider");
  return ctx;
};
