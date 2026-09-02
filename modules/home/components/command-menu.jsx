"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
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
              <Command className="w-full">
                <div className="flex items-center border-b border-border px-3">
                  <Search className="w-5 h-5 text-text-muted mr-2" />
                  <Command.Input
                    placeholder="Search problems, jump to page..."
                    className="flex h-14 w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-base"
                  />
                </div>
                <Command.List className="max-h-[300px] overflow-y-auto p-2">
                  <Command.Empty className="py-6 text-center text-sm text-text-muted">
                    No results found.
                  </Command.Empty>
                  <Command.Group heading="Navigation" className="text-xs text-text-muted px-2 py-1.5">
                    <Command.Item
                      onSelect={() => {
                        router.push("/problems");
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 px-2 py-2 text-sm text-text-primary rounded-md cursor-pointer data-[selected=true]:bg-accent/20 data-[selected=true]:text-accent-hover transition-colors"
                    >
                      Browse Problems
                    </Command.Item>
                    <Command.Item
                      onSelect={() => {
                        router.push("/profile");
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 px-2 py-2 text-sm text-text-primary rounded-md cursor-pointer data-[selected=true]:bg-accent/20 data-[selected=true]:text-accent-hover transition-colors"
                    >
                      My Profile
                    </Command.Item>
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
