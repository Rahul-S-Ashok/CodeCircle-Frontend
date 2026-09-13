import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
