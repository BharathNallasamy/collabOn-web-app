import React, { createContext, useContext, useState, ReactNode } from "react";

import { type EmployeeItem } from "../types/interfaces";
import { SEED_EMPLOYEES as INITIAL_EMPLOYEES } from "../types/mockData";

interface StaffContextType {
  employees: EmployeeItem[];
  addEmployee: (employee: Omit<EmployeeItem, "id" | "employeeId" | "dateOfJoining" | "status">) => void;
  bulkAddEmployees: (newEmployees: EmployeeItem[]) => void;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const StaffProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<EmployeeItem[]>(INITIAL_EMPLOYEES);

  const addEmployee = (data: Omit<EmployeeItem, "id" | "employeeId" | "dateOfJoining" | "status">) => {
    const newEmp: EmployeeItem = {
      ...data,
      id: Date.now(),
      employeeId: `EMP${String(employees.length + 1).padStart(3, "0")}`,
      dateOfJoining: new Date().toISOString().split("T")[0],
      status: "Active",
    };
    setEmployees((prev) => [newEmp, ...prev]);
  };

  const bulkAddEmployees = (newEmployees: EmployeeItem[]) => {
    setEmployees((prev) => [...newEmployees, ...prev]);
  };

  return (
    <StaffContext.Provider value={{ employees, addEmployee, bulkAddEmployees }}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error("useStaff must be used within a StaffProvider");
  }
  return context;
};
