import { currentUserRole } from "@/modules/auth/actions";
import Navbar from "@/modules/home/components/navbar";
import React from "react";

// This layout reads the Clerk session for every page in the group, so none of
// them can ever be prerendered. Declaring it here rather than on each page
// covers the whole group and keeps the build log free of DYNAMIC_SERVER_USAGE
// errors that were never actionable.
export const dynamic = "force-dynamic";

/**
 * Page chrome for the whole app.
 *
 * Deliberately holds no padding or width of its own. It used to add `px-4` on
 * top of each page's own horizontal padding, so every page was padded twice,
 * and it capped `<main>` at `max-h-screen` while its children asked for
 * `min-h-screen` — two rules that cannot both hold. Spacing now lives in one
 * place, PageShell, and pages opt out of it only when they are full-bleed.
 */
const RootLayout = async ({ children }) => {
  const userRole = await currentUserRole();

  return (
    <div className="min-h-screen bg-bg-base">
      <Navbar userRole={userRole} />
      <main>{children}</main>
    </div>
  );
};

export default RootLayout;
