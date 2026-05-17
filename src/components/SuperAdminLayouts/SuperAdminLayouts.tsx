import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSidebar";
import Navbar from "../Layouts/Navbar";

const SuperAdminLayouts = () => (
  <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
    <SuperAdminSidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

export default SuperAdminLayouts;
