import { redirect } from "next/navigation";
import { getUserPlaylists } from "@/modules/playlists/actions";
import PlaylistSidebar from "@/modules/playlists/components/playlist-sidebar";

export const dynamic = "force-dynamic";

/**
 * The sidebar is a layout, not a page component, so switching between lists
 * re-renders only the detail pane and the rail keeps its scroll position.
 */
const PlaylistsLayout = async ({ children }) => {
  const { success, data: playlists } = await getUserPlaylists();

  if (!success) redirect("/sign-in");

  return (
    <div className="w-full min-h-screen bg-bg-base pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        <PlaylistSidebar playlists={playlists} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
};

export default PlaylistsLayout;
