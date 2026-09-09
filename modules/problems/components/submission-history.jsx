"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, CheckCircle2, XCircle, Clock, AlertTriangle, ChevronRight, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const getStatusConfig = (status) => {
  if (status === "Accepted") return { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", border: "border-success/20", alertBorder: "border-l-success" };
  if (status?.includes("Time")) return { icon: Clock, color: "text-pending", bg: "bg-pending/10", border: "border-pending/20", alertBorder: "border-l-pending" };
  return { icon: XCircle, color: "text-error", bg: "bg-error/10", border: "border-error/20", alertBorder: "border-l-error" };
};

export const SubmissionHistory = ({ submissions = [] }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // On a problem page every row is the same problem, so naming it is noise.
  // On the profile it is the only way to tell the rows apart.
  const showProblem = submissions.some((sub) => sub.problem);
  const columns = showProblem
    ? "grid-cols-[100px_1fr_90px_80px_80px_110px]"
    : "grid-cols-[100px_1fr_80px_80px_120px]";

  if (!submissions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-muted text-center">
        <Code2 className="h-10 w-10 mb-4 opacity-20" />
        <p>No submissions yet.</p>
        <p className="text-xs mt-1">Submit your code to see history here.</p>
      </div>
    );
  }

  return (
    <div className="w-full relative overflow-hidden min-h-[400px]">
      <AnimatePresence mode="wait">
        
        {/* STATE 1: LIST VIEW */}
        {!selectedSubmission ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <div className="flex flex-col border border-border rounded-xl overflow-hidden bg-bg-base">
              <div className={`grid ${columns} gap-2 px-3 py-2 border-b border-border text-[10px] font-semibold text-text-muted uppercase tracking-wider bg-bg-surface`}>
                <div>Status</div>
                <div>{showProblem ? "Problem" : "Language"}</div>
                {showProblem && <div>Language</div>}
                <div>Runtime</div>
                <div>Memory</div>
                <div className="text-right">Date</div>
              </div>
              
              <div className="flex flex-col">
                {submissions.map((sub, idx) => {
                  const conf = getStatusConfig(sub.status);
                  const Icon = conf.icon;
                  const timeStr = sub.performance?.time?.[0] || sub.time || "N/A";
                  const memStr = sub.performance?.memory?.[0] || sub.memory || "N/A";
                  
                  return (
                    <div 
                      key={sub.id || idx}
                      onClick={() => setSelectedSubmission(sub)}
                      className={`grid ${columns} gap-2 px-3 py-2 items-center border-b border-border hover:bg-bg-elevated cursor-pointer transition-colors group text-sm`}
                    >
                      <div className={`flex items-center gap-1.5 ${conf.color} font-medium text-xs`}>
                        <Icon className="h-3.5 w-3.5" />
                        <span className="truncate">{sub.status === "Accepted" ? "Accepted" : "Failed"}</span>
                      </div>
                      {showProblem && (
                        <div className="text-xs text-text-primary truncate group-hover:text-accent transition-colors">
                          <span className="font-mono text-text-muted mr-1">
                            {sub.problem?.number}.
                          </span>
                          {sub.problem?.title ?? "Deleted problem"}
                        </div>
                      )}
                      <div className="font-mono text-xs text-text-secondary group-hover:text-text-primary transition-colors">
                        {sub.language || "Unknown"}
                      </div>
                      <div className="font-mono text-xs text-text-muted">{timeStr}</div>
                      <div className="font-mono text-xs text-text-muted">{memStr}</div>
                      <div className="text-[11px] text-text-muted text-right flex items-center justify-end gap-1">
                        {new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          
          /* STATE 2: DETAIL VIEW */
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col gap-4"
          >
            {/* Back Button */}
            <button 
              onClick={() => setSelectedSubmission(null)}
              className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm font-medium self-start"
            >
              <ArrowLeft className="h-4 w-4" />
              All Submissions
            </button>

            {/* Banner */}
            {(() => {
              const conf = getStatusConfig(selectedSubmission.status);
              const Icon = conf.icon;
              return (
                <div className={`${conf.bg} border border-border border-l-2 ${conf.alertBorder} rounded-lg p-4 flex items-center gap-3`}>
                  <Icon className={`h-6 w-6 ${conf.color}`} />
                  <div>
                    <h3 className={`font-bold ${conf.color} text-base`}>{selectedSubmission.status}</h3>
                    {selectedSubmission.testCases && (
                      <p className={`text-xs ${conf.color} opacity-80 mt-0.5`}>
                        {selectedSubmission.testCases.filter(tc => tc.passed).length} / {selectedSubmission.testCases.length} testcases passed
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg-elevated border border-border rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs font-medium text-text-muted mb-2">Runtime</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-text-primary font-mono">
                    {selectedSubmission.performance?.time?.[0] || selectedSubmission.time || "N/A"}
                  </span>
                </div>
              </div>
              <div className="bg-bg-elevated border border-border rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs font-medium text-text-muted mb-2">Memory</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-text-primary font-mono">
                    {selectedSubmission.performance?.memory?.[0] || selectedSubmission.memory || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Code Block */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs font-medium text-text-muted">Submitted Code</span>
              <div className="bg-bg-elevated border border-border rounded-xl overflow-hidden p-4">
                <pre className="text-xs font-mono text-text-primary overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  <code>{typeof selectedSubmission.sourceCode === 'string' 
                          ? selectedSubmission.sourceCode 
                          : JSON.stringify(selectedSubmission.sourceCode, null, 2) || "No code found."}</code>
                </pre>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};