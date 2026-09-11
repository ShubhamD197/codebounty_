import { redirect } from "next/navigation";
import { getUserPlaylists } from "@/modules/playlists/actions";
import PlaylistSidebar from "@/modules/playlists/components/playlist-sidebar";
import PageShell from "@/components/page-shell";

export const dynamic = "force-dynamic";

/**
 * The sidebar is a layout, not a page component, so switching between lists
 * re-renders only the detail pane and the rail keeps its scroll position.
 */
const PlaylistsLayout = async ({ children }) => {
  const { success, data: playlists } = await getUserPlaylists();

  if (!success) redirect("/sign-in");

  return (
    <PageShell width="wide">
      <div className="flex flex-col gap-10 lg:flex-row">
        <PlaylistSidebar playlists={playlists} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </PageShell>
  );
};

export default PlaylistsLayout;
