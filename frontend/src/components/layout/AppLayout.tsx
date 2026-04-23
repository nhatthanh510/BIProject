import { useState } from "react";
import { Outlet } from "react-router";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
