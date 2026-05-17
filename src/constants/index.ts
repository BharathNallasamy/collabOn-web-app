// ── Pagination ─────────────────────────────────────────────────────────────────
export const ITEMS_PER_PAGE = 7;

// ── Shared academic constants ──────────────────────────────────────────────────
export const PROGRAM_TYPES = ["UG", "PG", "PHD", "Diploma", "Integrated"] as const;
export type ProgramType = (typeof PROGRAM_TYPES)[number];

export const DEPARTMENTS = [
  "Tamil", "English", "Commerce", "Computer Science", "Mathematics",
  "Physics", "Chemistry", "Biology", "Electronics & Comm.",
] as const;

export const ACADEMIC_YEARS = ["2025-2026", "2024-2025", "2023-2024"] as const;

export const STATUS_OPTIONS = ["Active", "Inactive"] as const;

// ── Departments page ───────────────────────────────────────────────────────────
export const INSTITUTIONS = ["RGEC", "XX University", "Rajiv Gandhi Engineering College", "SREC", "PSG College"] as const;
export const STREAMS      = ["Engineering", "Technology", "Arts and Science", "Commerce", "Management", "Science", "Humanities"] as const;
export const DEGREE_NAMES = ["B.Tech", "M.Tech", "B.Sc", "M.Sc", "BCA", "MCA", "B.Com", "M.Com", "MBA", "BBA", "B.A", "M.A"] as const;

// ── Subjects page ──────────────────────────────────────────────────────────────
export const SUBJECT_TYPES  = ["Major", "Allied", "Elective", "Core", "Foundation", "Skill-Based"] as const;
export const CURRICULA_OPTS = ["R-2024", "R-2021", "R-2020", "R-2019", "R-2018"] as const;
export const YEAR_OPTS      = ["1st Year", "2nd Year", "3rd Year", "4th Year"] as const;
export const SEMESTER_OPTS  = ["Sem I", "Sem II", "Sem III", "Sem IV", "Sem V", "Sem VI", "Sem VII", "Sem VIII"] as const;
