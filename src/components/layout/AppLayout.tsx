import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      <Sidebar />

      {/* Main */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 px-4 py-4 lg:px-8 lg:py-8 pb-24 lg:pb-8">
          <div key={pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
