import { currentUserRole } from "@/modules/auth/actions";
import Navbar from "@/modules/home/components/navbar";
import React from "react";

// This layout reads the Clerk session for every page in the group, so none of
// them can ever be prerendered. Declaring it here rather than on each page
// covers the whole group and keeps the build log free of DYNAMIC_SERVER_USAGE
// errors that were never actionable.
export const dynamic = "force-dynamic";

const RootLayout = async({ children }) => {
  const userRole = await currentUserRole()
  return (
    <main className="flex flex-col min-h-screen max-h-screen">
      <Navbar userRole={userRole}/>
      <div className="flex-1 flex flex-col px-4 pb-4">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background"/>
        {children}
      </div>
    </main>
  );
};

export default RootLayout;