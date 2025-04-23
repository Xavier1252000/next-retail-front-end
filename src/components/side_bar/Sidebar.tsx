// "use client";
// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { usePermissions } from "./use-permissions";
// import { useAuth } from "@/context/authContext";
// import { div } from "motion/react-client";

// interface SubModule {
//   name: string;
//   to: string;
//   icon?: string;
// }

// interface HeadModule {
//   name: string;
//   to: string;
//   icon?: string;
//   subModules: SubModule[];
// }

// const Sidebar = () => {
//   const { response, loading } = usePermissions();
//   const [userPermissions, setUserPermissions] = useState<HeadModule[]>([]);
//   const [activeModule, setActiveModule] = useState<string | null>(null);
//   const {isLoggedIn} = useAuth();


//   useEffect(() => {
//     if (!loading && response?.response?.data?.userPermissions) {
//       const permissions = response.response.data.userPermissions;
//       console.log("✅ Raw userPermissions from backend:", response);
  
//       const formattedPermissions = permissions.map((perm: any) => ({
//         name: perm.headModule?.name ?? "Unnamed Module",
//         to: perm.headModule?.to ?? "#",
//         icon: perm.headModule?.icon ?? "",
//         subModules: (perm.subModules ?? []).map((sub: any) => ({
//           name: sub.name ?? "Unnamed Submodule",
//           to: sub.to ?? "#",
//         })),
//       }));
  
//       setUserPermissions(formattedPermissions);
//     }
//   }, [loading, response]);

//   console.log(isLoggedIn, "======================================================")

//   if(!isLoggedIn) return <div></div>

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div className="w-64 bg-gradient-to-b from-blue-900 to-indigo-900 text-white h-full p-4 shadow-xl flex flex-col rounded-lg font-medium">
//       <div className="flex items-center justify-center mb-6">
//         <span className="text-2xl font-semibold tracking-wide">The App</span>
//       </div>
//       <ul>
//         {userPermissions.map((module) => (
//           <li
//             key={module.to}
//             className="relative"
//             onMouseEnter={() => setActiveModule(module.to)}
//             onMouseLeave={() => setActiveModule(null)}
//           >
//             <Link
//               href={module.to}
//               className="flex items-center p-3 gap-3 rounded-lg hover:bg-indigo-800 transition duration-300"
//             >
//               {module.icon}
//               <span><b>{module.name}</b></span>
//             </Link>
//             {module.subModules.length > 0 && activeModule === module.to && (
//               <ul className="space-y-1 py-2">
//                 {module.subModules.map((sub) => (
//                   <li key={sub.to} className="pl-6">
//                     <Link
//                       href={sub.to}
//                       className="block p-2 hover:bg-indigo-700 rounded-lg transition duration-300"
//                     >
//                       {sub.name}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </li>
//         ))}
//       </ul>
//       <div className="mt-auto p-3 text-center border-t border-indigo-700">
//         <span className="text-gray-300">Account</span>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;








// ------------------------------------------------

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePermissions } from "./use-permissions";
import { useAuth } from "@/context/authContext";
import {
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  Menu,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SubModule {
  name: string;
  to: string;
  icon?: string;
}

interface HeadModule {
  name: string;
  to: string;
  icon?: string;
  subModules: SubModule[];
}

const Sidebar = () => {
  const { response, loading } = usePermissions();
  const [userPermissions, setUserPermissions] = useState<HeadModule[]>([]);
  const [openModules, setOpenModules] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!loading && response?.response?.data?.userPermissions) {
      const permissions = response.response.data.userPermissions;
      const formattedPermissions = permissions.map((perm: any) => ({
        name: perm.headModule?.name ?? "Unnamed Module",
        to: perm.headModule?.to ?? "#",
        icon: perm.headModule?.icon ?? "",
        subModules: (perm.subModules ?? []).map((sub: any) => ({
          name: sub.name ?? "Unnamed Submodule",
          to: sub.to ?? "#",
        })),
      }));
      setUserPermissions(formattedPermissions);
    }
  }, [loading, response]);

  if (!isLoggedIn) return <></>;
  if (loading) return <div>Loading...</div>;

  const toggleModule = (moduleTo: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleTo]: !prev[moduleTo],
    }));
  };

  return (
    <div className="fixed top-5 left-0 h-screen z-40">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 left-4 z-50 p-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 rounded-lg shadow-sm transition"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-72" : "w-16"
        } transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 text-gray-900 h-full p-4 shadow-md rounded-r-2xl flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-6">
          <LayoutDashboard className="w-6 h-6 text-indigo-500" />
          {isSidebarOpen && (
            <span className="text-xl font-semibold tracking-wide">
              The App
            </span>
          )}
        </div>

        {/* Modules */}
        <ul className="flex-1 space-y-1 overflow-y-auto">
          {userPermissions.map((module) => {
            const hasSubModules = module.subModules.length > 0;
            return (
              <li key={module.to}>
                <div
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 transition-all cursor-pointer"
                  onClick={() => hasSubModules && toggleModule(module.to)}
                >
                  <Link
                    href={module.to}
                    className="flex items-center gap-2 w-full"
                  >
                    <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                    {isSidebarOpen && <span>{module.name}</span>}
                  </Link>

                  {isSidebarOpen && hasSubModules && (
                    <span className="ml-2">
                      {openModules[module.to] ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </span>
                  )}
                </div>

                {/* Submodules */}
                <AnimatePresence>
                  {openModules[module.to] && hasSubModules && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="ml-6 mt-1 space-y-1 overflow-hidden"
                    >
                      {module.subModules.map((sub) => (
                        <li key={sub.to}>
                          <Link
                            href={sub.to}
                            className="block px-3 py-1 text-sm text-gray-600 rounded-md hover:bg-indigo-50 transition-all"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="mt-4 border-t border-gray-200 pt-3 text-center text-xs text-gray-400">
          {isSidebarOpen && "Account Settings"}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
