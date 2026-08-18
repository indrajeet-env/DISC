"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Package,
  Truck,
  BellRing,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  onTabChange,
  alertCount = 0,
}) {
  const [open, setOpen] = useState(false);

  const navigationItems = [
    {
      label: "Dashboard",
      value: "dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Inventory",
      value: "inventory",
      icon: Package,
    },
    {
      label: "Shipments",
      value: "shipments",
      icon: Truck,
    },
    {
      label: "Alerts",
      value: "alerts",
      icon: BellRing,
    },
  ];

  const handleNavigation = (value) => {
    onTabChange(value);

    // Close mobile sidebar after navigation
    setOpen(false);
  };

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}
      <motion.aside
        initial={false}
        animate={{
          width: open ? "256px" : "72px",
        }}
        transition={{
          duration: 0.25,
          ease: "easeInOut",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="
          hidden md:flex
          h-screen
          sticky top-0
          flex-col
          shrink-0
          overflow-hidden
          bg-slate-900
          text-white
          border-r border-slate-800
          z-50
        "
      >
        {/* =====================================================
            HEADER / LOGO
        ====================================================== */}
        <div className="h-[88px] shrink-0 border-b border-slate-800 flex items-center px-4">

          <div className="flex items-center gap-3 min-w-max">

            {/* Logo */}
            <div className="w-9 h-9 shrink-0 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                DC
              </span>
            </div>

            {/* Brand */}
            <motion.div
              initial={false}
              animate={{
                opacity: open ? 1 : 0,
                x: open ? 0 : -8,
              }}
              transition={{
                duration: 0.2,
              }}
              className="whitespace-nowrap"
            >
              <h1 className="text-xl font-bold tracking-tight">
                DrugChain
              </h1>

              <p className="text-slate-400 text-[10px] mt-0.5 uppercase tracking-wider font-semibold">
                Supply Chain Intelligence
              </p>
            </motion.div>

          </div>
        </div>


        {/* =====================================================
            NAVIGATION
        ====================================================== */}
        <nav className="flex-1 px-3 py-6 space-y-2">

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;

            return (
              <button
                key={item.value}
                onClick={() => handleNavigation(item.value)}
                title={!open ? item.label : undefined}
                className={`
                  relative
                  w-full
                  h-11
                  flex
                  items-center
                  rounded-lg
                  transition-colors
                  duration-150
                  group
                  ${
                    open
                      ? "justify-start px-3 gap-3"
                      : "justify-center px-0"
                  }
                  ${
                    isActive
                      ? "bg-blue-600/10 text-blue-400"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarItem"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon */}
                <Icon
                  className={`
                    w-5 h-5
                    shrink-0
                    transition-transform
                    duration-150
                    ${
                      isActive
                        ? "text-blue-400"
                        : "text-slate-400 group-hover:text-white"
                    }
                  `}
                />

                {/* Label */}
                <motion.span
                  initial={false}
                  animate={{
                    opacity: open ? 1 : 0,
                    width: open ? "auto" : 0,
                    x: open ? 0 : -8,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="
                    overflow-hidden
                    whitespace-nowrap
                    text-sm
                    font-medium
                    text-left
                  "
                >
                  {item.label}
                </motion.span>

                {/* Alert count */}
                {item.value === "alerts" && alertCount > 0 && (
                  <motion.span
                    initial={false}
                    animate={{
                      opacity: open ? 1 : 0,
                      scale: open ? 1 : 0.5,
                    }}
                    className="
                      ml-auto
                      min-w-5
                      h-5
                      px-1.5
                      flex
                      items-center
                      justify-center
                      bg-red-600
                      text-white
                      text-[10px]
                      font-bold
                      rounded-full
                    "
                  >
                    {alertCount}
                  </motion.span>
                )}

                {/* Collapsed alert badge */}
                {item.value === "alerts" && alertCount > 0 && !open && (
                  <span
                    className="
                      absolute
                      top-1
                      right-1
                      min-w-4
                      h-4
                      px-1
                      flex
                      items-center
                      justify-center
                      bg-red-600
                      text-white
                      text-[9px]
                      font-bold
                      rounded-full
                    "
                  >
                    {alertCount > 99 ? "99+" : alertCount}
                  </span>
                )}

              </button>
            );
          })}

        </nav>


        {/* =====================================================
            SYSTEM STATUS
        ====================================================== */}
        <div className="p-3 border-t border-slate-800">

          <div
            className={`
              h-10
              rounded-lg
              bg-slate-800/50
              flex
              items-center
              transition-all
              ${
                open
                  ? "px-3 gap-3"
                  : "justify-center"
              }
            `}
          >

            <div className="
              w-2.5
              h-2.5
              shrink-0
              bg-emerald-500
              rounded-full
              animate-pulse
              shadow-[0_0_8px_rgba(16,185,129,0.5)]
            " />

            <motion.span
              initial={false}
              animate={{
                opacity: open ? 1 : 0,
                width: open ? "auto" : 0,
              }}
              className="
                overflow-hidden
                whitespace-nowrap
                text-xs
                font-medium
                text-slate-300
              "
            >
              System Operational
            </motion.span>

          </div>

        </div>

      </motion.aside>


      {/* =====================================================
          MOBILE SIDEBAR
      ====================================================== */}
      <div className="md:hidden">

        {/* Mobile top bar */}
        <div className="
          fixed
          top-0
          left-0
          right-0
          h-14
          bg-slate-900
          flex
          items-center
          justify-between
          px-4
          z-40
          border-b
          border-slate-800
        ">

          <div className="flex items-center gap-2">

            <div className="
              w-8
              h-8
              bg-blue-600
              rounded-lg
              flex
              items-center
              justify-center
            ">
              <span className="text-white font-bold text-xs">
                DC
              </span>
            </div>

            <span className="text-white font-bold">
              DrugChain
            </span>

          </div>

          <button
            onClick={() => setOpen(true)}
            className="
              w-9
              h-9
              flex
              items-center
              justify-center
              rounded-lg
              text-slate-300
              hover:bg-slate-800
              hover:text-white
            "
          >
            <Menu className="w-5 h-5" />
          </button>

        </div>


        {/* Mobile drawer */}
        <AnimatePresence>
          {open && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="
                  fixed
                  inset-0
                  bg-black/50
                  z-40
                "
              />

              {/* Drawer */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{
                  duration: 0.25,
                  ease: "easeInOut",
                }}
                className="
                  fixed
                  left-0
                  top-0
                  bottom-0
                  w-72
                  bg-slate-900
                  text-white
                  z-50
                  flex
                  flex-col
                  shadow-2xl
                "
              >

                {/* Mobile header */}
                <div className="
                  h-16
                  px-5
                  flex
                  items-center
                  justify-between
                  border-b
                  border-slate-800
                ">

                  <div className="flex items-center gap-3">

                    <div className="
                      w-9
                      h-9
                      bg-blue-600
                      rounded-lg
                      flex
                      items-center
                      justify-center
                    ">
                      <span className="font-bold text-sm">
                        DC
                      </span>
                    </div>

                    <span className="text-xl font-bold">
                      DrugChain
                    </span>

                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    className="
                      w-9
                      h-9
                      flex
                      items-center
                      justify-center
                      rounded-lg
                      text-slate-400
                      hover:text-white
                      hover:bg-slate-800
                    "
                  >
                    <X className="w-5 h-5" />
                  </button>

                </div>


                {/* Mobile navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">

                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.value;

                    return (
                      <button
                        key={item.value}
                        onClick={() =>
                          handleNavigation(item.value)
                        }
                        className={`
                          relative
                          w-full
                          flex
                          items-center
                          gap-3
                          px-3
                          py-3
                          rounded-lg
                          font-medium
                          ${
                            isActive
                              ? "bg-blue-600/10 text-blue-400"
                              : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          }
                        `}
                      >

                        {isActive && (
                          <div className="
                            absolute
                            left-0
                            top-2
                            bottom-2
                            w-1
                            bg-blue-500
                            rounded-r-full
                          " />
                        )}

                        <Icon className="w-5 h-5 shrink-0" />

                        <span className="flex-1 text-left">
                          {item.label}
                        </span>

                        {item.value === "alerts" &&
                          alertCount > 0 && (
                            <span className="
                              px-2
                              py-0.5
                              bg-red-600
                              text-white
                              text-xs
                              font-bold
                              rounded-full
                            ">
                              {alertCount}
                            </span>
                          )}

                      </button>
                    );
                  })}

                </nav>


                {/* Mobile status */}
                <div className="p-4 border-t border-slate-800">

                  <div className="
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    bg-slate-800/50
                    rounded-lg
                  ">

                    <div className="
                      w-2.5
                      h-2.5
                      bg-emerald-500
                      rounded-full
                      animate-pulse
                    " />

                    <span className="
                      text-xs
                      font-medium
                      text-slate-300
                    ">
                      System Operational
                    </span>

                  </div>

                </div>

              </motion.aside>
            </>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}