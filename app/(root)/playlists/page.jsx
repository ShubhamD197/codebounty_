import { ListMusic } from "lucide-react";
import { getUserPlaylists } from "@/modules/playlists/actions";
import CreatePlaylistButton from "@/modules/playlists/components/create-playlist-button";
import { Button } from "@/components/ui/button";
import PlaylistCard from "@/modules/playlists/components/playlist-card";

export const dynamic = "force-dynamic";

const PlaylistsPage = async () => {
  const { data: playlists } = await getUserPlaylists();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-3">
        Playlists
      </h1>
      <p className="text-text-muted mb-10 max-w-2xl">
        Your own study lists. Save a problem from its page, then work through the
        list and watch the progress fill in.
      </p>

      {playlists.length === 0 ? (
        <div className="py-24 flex flex-col items-center text-center border border-border rounded-xl bg-bg-surface">
          <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center mb-6">
            <ListMusic className="h-8 w-8 text-text-muted" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No playlists yet
          </h2>
          <p className="text-text-muted max-w-sm mb-6">
            Create a list for a pattern you are drilling, or for problems you want
            to revisit before an interview.
          </p>
          <CreatePlaylistButton trigger={<Button>Create a playlist</Button>} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
