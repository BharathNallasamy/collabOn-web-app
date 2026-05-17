import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layouts = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
      {/* Persistent left sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Persistent top navbar */}
        <Navbar />

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layouts;
