import Link from "next/link";
import { ListMusic } from "lucide-react";

/** Card used on /playlists and on the profile page, so the two stay identical. */
export default function PlaylistCard({ playlist }) {
  return (
    <Link
      href={`/playlists/${playlist.id}`}
      className="group flex flex-col rounded-xl border border-border bg-bg-surface p-5 transition-colors hover:border-accent/50 hover:bg-bg-elevated"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-accent/10 p-2.5">
          <ListMusic className="size-5 text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
            {playlist.name}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {playlist._count?.problems ?? playlist.problems?.length ?? 0} problems
          </p>
        </div>
      </div>
      {playlist.description && (
        <p className="mt-3 text-sm text-text-secondary line-clamp-2">
          {playlist.description}
        </p>
      )}
    </Link>
  );
}
