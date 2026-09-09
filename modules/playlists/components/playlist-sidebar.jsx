"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListMusic } from "lucide-react";
import CreatePlaylistButton from "./create-playlist-button";

/** "My Lists" rail, shared by every /playlists route via the segment layout. */
export default function PlaylistSidebar({ playlists }) {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 lg:flex-shrink-0">
      <div className="flex items-center justify-between px-3 mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          My Lists
        </h2>
        <CreatePlaylistButton />
      </div>

      {playlists.length === 0 ? (
        <p className="px-3 text-sm text-text-muted">No lists yet.</p>
      ) : (
        <nav className="flex flex-col gap-0.5">
          {playlists.map((playlist) => {
            const active = pathname === `/playlists/${playlist.id}`;
            return (
              <Link
                key={playlist.id}
                href={`/playlists/${playlist.id}`}
                className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-bg-elevated text-text-primary font-medium"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <ListMusic className="size-4 flex-shrink-0 text-accent" />
                  <span className="truncate">{playlist.name}</span>
                </span>
                <span className="text-xs font-mono text-text-muted flex-shrink-0">
                  {playlist._count.problems}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </aside>
  );
}
