import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";

const PAGE_ORDER = [
  "/",
  "/transactions",
  "/budgets",
  "/savings",
  "/categories",
  "/reports",
  "/settings",
];

export function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const currentIndex = PAGE_ORDER.indexOf(pathname);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < PAGE_ORDER.length - 1) {
        navigate(PAGE_ORDER[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        navigate(PAGE_ORDER[currentIndex - 1]);
      }
    },
    preventScrollOnSwipe: false,
    trackMouse: false,
    delta: 80, // min px to register as a swipe
    swipeDuration: 500,
  });

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      <Sidebar />

      {/* Main */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <TopBar />
        <main
          {...handlers}
          className="flex-1 px-4 py-4 lg:px-8 lg:py-8 pb-24 lg:pb-8"
        >
          <div key={pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
