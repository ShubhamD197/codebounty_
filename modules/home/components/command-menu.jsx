"use client";

import * as React from "react";
import { Search, BookOpen, ListChecks, User, Loader2 } from "lucide-react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { getAllProblems } from "@/modules/problems/actions";

const PAGES = [
  { href: "/patterns", label: "Browse Patterns", icon: BookOpen },
  { href: "/problems", label: "Browse Problems", icon: ListChecks },
  { href: "/playlists", label: "My Playlists", icon: ListChecks },
  { href: "/profile", label: "My Profile", icon: User },
];

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [problems, setProblems] = React.useState(null);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Loaded once, on first open, then filtered in the browser by cmdk.
  // ponytail: fine while the catalogue is small; swap for a server-side
  // search action once it passes a few hundred problems.
  React.useEffect(() => {
    if (!open || problems !== null) return;
    let cancelled = false;
    getAllProblems().then((res) => {
      if (!cancelled) setProblems(res.success ? res.data : []);
    });
    return () => {
      cancelled = true;
    };
  }, [open, problems]);

  const go = (href) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted bg-bg-surface/50 border border-border rounded-lg hover:border-accent hover:text-text-primary transition-all duration-200"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline-block">Search problems...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 font-mono text-[10px] font-medium text-text-muted bg-bg-elevated rounded border border-border">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full max-w-lg overflow-hidden bg-bg-elevated rounded-xl border border-border shadow-2xl shadow-accent/10"
            >
              <Command className="w-full" loop>
                <div className="flex items-center border-b border-border px-3">
                  <Search className="w-5 h-5 text-text-muted mr-2" />
                  <Command.Input
                    placeholder="Search problems by title or number..."
                    className="flex h-14 w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-base"
                  />
                  {problems === null && (
                    <Loader2 className="w-4 h-4 text-text-muted animate-spin" />
                  )}
                </div>
                <Command.List className="max-h-[320px] overflow-y-auto p-2">
                  <Command.Empty className="py-6 text-center text-sm text-text-muted">
                    {problems === null ? "Loading problems..." : "No results found."}
                  </Command.Empty>

                  {problems?.length > 0 && (
                    <Command.Group
                      heading="Problems"
                      className="text-xs text-text-muted px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
                    >
                      {problems.map((problem) => (
                        <Command.Item
                          key={problem.id}
                          // cmdk matches against this string, so the number is
                          // searchable as well as the title.
                          value={`${problem.number} ${problem.title}`}
                          onSelect={() => go(`/problem/${problem.id}`)}
                          className="flex items-center justify-between gap-2 px-2 py-2 text-sm text-text-primary rounded-md cursor-pointer data-[selected=true]:bg-accent/20 data-[selected=true]:text-accent-hover transition-colors"
                        >
                          <span className="truncate">
                            <span className="text-text-muted font-mono mr-1.5">
                              {problem.number}.
                            </span>
                            {problem.title}
                          </span>
                          <span className="text-[10px] font-mono uppercase text-text-muted flex-shrink-0">
                            {problem.difficulty}
                          </span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  <Command.Group
                    heading="Navigation"
                    className="text-xs text-text-muted px-2 py-1.5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
                  >
                    {PAGES.map(({ href, label, icon: Icon }) => (
                      <Command.Item
                        key={href}
                        value={label}
                        onSelect={() => go(href)}
                        className="flex items-center gap-2 px-2 py-2 text-sm text-text-primary rounded-md cursor-pointer data-[selected=true]:bg-accent/20 data-[selected=true]:text-accent-hover transition-colors"
                      >
                        <Icon className="w-4 h-4 text-text-muted" />
                        {label}
                      </Command.Item>
                    ))}
                  </Command.Group>
                </Command.List>
              </Command>
            </motion.div>
          </Command.Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
