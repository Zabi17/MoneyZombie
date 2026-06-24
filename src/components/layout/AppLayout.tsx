import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
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
  const directionRef = useRef<1 | -1>(1);
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

  const currentIndex = PAGE_ORDER.indexOf(pathname);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < PAGE_ORDER.length - 1) {
        directionRef.current = 1;
        navigate(PAGE_ORDER[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        directionRef.current = -1;
        navigate(PAGE_ORDER[currentIndex - 1]);
      }
    },
    preventScrollOnSwipe: false,
    trackMouse: false,
    delta: 80,
    swipeDuration: 500,
  });

  const variants = {
    enter: (dir: number) => ({
      x: isDesktop ? 0 : dir * 80,
      opacity: isDesktop ? 0 : 1,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: isDesktop ? 0 : dir * -80,
      opacity: isDesktop ? 0 : 1,
    }),
  };

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
          className="flex-1 px-4 py-4 lg:px-8 lg:py-8 pb-24 lg:pb-8 overflow-hidden"
        >
          <AnimatePresence mode="wait" custom={directionRef.current}>
            <motion.div
              key={pathname}
              custom={directionRef.current}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 350, damping: 35 },
                opacity: { duration: 0.12 },
              }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
