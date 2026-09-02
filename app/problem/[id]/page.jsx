"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Send,
  Code,
  FileText,
  Lightbulb,
  Trophy,
  ArrowLeft,
  Loader2,
  Terminal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  runCode,
  submitCode,
  getAllSubmissionByCurrentUserForProblem,
  getProblemById,
} from "@/modules/problems/actions";
import { getJudge0LanguageId } from "@/lib/judge0/judge0";
import { SubmissionHistory } from "@/modules/problems/components/submission-history";

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "EASY":
      return "bg-success/10 text-success border-success/20";
    case "MEDIUM":
      return "bg-pending/10 text-pending border-pending/20";
    case "HARD":
      return "bg-error/10 text-error border-error/20";
    default:
      return "bg-bg-elevated text-text-secondary border-border";
  }
};

export default function ProblemIdPage({ params }) {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("JAVASCRIPT");
  const [code, setCode] = useState("");
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [submissionHistory, setSubmissionHistory] = useState([]);

  // Execution states: "IDLE", "RUNNING", "ACCEPTED", "WRONG_ANSWER", "ERROR", "TLE"
  const [executionState, setExecutionState] = useState("IDLE");
  const [executionData, setExecutionData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [problemStatus, setProblemStatus] = useState("unsolved");
  const [activeTab, setActiveTab] = useState("description");
  const [expandedTestCases, setExpandedTestCases] = useState({});

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const resolvedParams = await params;
        const problemData = await getProblemById(resolvedParams.id);
        if (problemData.success) {
          setProblem(problemData.data);
          setCode(problemData.data.codeSnippets[selectedLanguage] || "");
        }
      } catch (error) {
        console.error("Error fetching problem:", error);
      }
    };
    fetchProblem();
  }, [params]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const resolvedParams = await params;
        const history = await getAllSubmissionByCurrentUserForProblem(resolvedParams.id);
        if (history.success) {
          setSubmissionHistory(history.data);
          if (history.data.some(sub => sub.status === "Accepted")) {
            setProblemStatus("solved");
          }
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };
    fetchHistory();
  }, [params]);

  useEffect(() => {
    if (problem && problem.codeSnippets[selectedLanguage]) {
      setCode(problem.codeSnippets[selectedLanguage]);
    }
  }, [selectedLanguage, problem]);

  const processExecutionResponse = (res, isSubmit) => {
    setExecutionData(res);

    // Status can be: "Accepted", "Wrong Answer", "Time Limit Exceeded", "Compilation Error", "Runtime Error" etc.
    let status = res.status || (res.submission && res.submission.status) || "Error";
    let isAccepted = status === "Accepted";

    // If it's a RUN (not submit), verify all tests passed explicitly
    if (!isSubmit && res.submission?.testCases) {
      isAccepted = res.submission.testCases.every((tc) => tc.passed);
      status = isAccepted ? "Accepted" : "Wrong Answer";
      if (!isAccepted && res.submission.testCases.some((tc) => tc.status?.description?.includes("Time"))) {
        status = "Time Limit Exceeded";
      } else if (!isAccepted && res.submission.testCases.some((tc) => tc.status?.id >= 6)) {
        status = "Error"; // Compilation/Runtime
      }
    }

    if (status === "Accepted") {
      setExecutionState("ACCEPTED");
      toast.success(isSubmit ? "Solution Accepted!" : "All test cases passed", {
        className: "bg-success/10 border-success text-success",
      });
      if (isSubmit) setProblemStatus("solved");
    } else if (status === "Wrong Answer") {
      setExecutionState("WRONG_ANSWER");
      toast.error("Wrong Answer");
    } else if (status.includes("Time Limit")) {
      setExecutionState("TLE");
      toast.error("Time Limit Exceeded");
    } else {
      setExecutionState("ERROR");
      toast.error("Execution Failed");
    }
  };

  const handleRun = async () => {
    try {
      setExecutionState("RUNNING");
      const language_id = getJudge0LanguageId(selectedLanguage);
      const res = await runCode(code, language_id, problem.id);

      if (!res.success) {
        setExecutionState("ERROR");
        setExecutionData({ error: res.error || "Failed to run code" });
        return;
      }
      processExecutionResponse(res, false);
    } catch (error) {
      setExecutionState("ERROR");
      setExecutionData({ error: error.message });
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setExecutionState("RUNNING");
      const language_id = getJudge0LanguageId(selectedLanguage);
      const res = await submitCode(code, language_id, problem.id);

      if (!res.success) {
        setExecutionState("ERROR");
        setExecutionData({ error: res.error || "Failed to submit code" });
        setIsSubmitting(false);
        return;
      }

      processExecutionResponse(res, true);

      const resolvedParams = await params;
      const history = await getAllSubmissionByCurrentUserForProblem(resolvedParams.id);
      if (history.success) {
        setSubmissionHistory(history.data);
      }
    } catch (error) {
      setExecutionState("ERROR");
      setExecutionData({ error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTestCase = (idx) => {
    setExpandedTestCases(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg-base">
        <Loader2 className="animate-spin h-6 w-6 text-accent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-bg-base text-text-primary overflow-hidden">
      {/* TOP BAR */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border bg-bg-surface/50 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/problems">
            <Button variant="ghost" size="icon" className="hover:bg-bg-elevated text-text-muted hover:text-text-primary h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight">{problem.title}</h1>
            <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-medium border ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </Badge>
            <AnimatePresence>
              {problemStatus === "solved" && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleRun}
              disabled={executionState === "RUNNING"}
              variant="ghost"
              className="flex items-center gap-2 h-9 text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              {executionState === "RUNNING" && !isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Run
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSubmit}
              disabled={executionState === "RUNNING"}
              className="flex items-center gap-2 h-9 bg-accent hover:bg-accent-hover text-white shadow-[0_0_10px_rgba(139,92,246,0.2)] hover:shadow-[0_0_15px_rgba(167,139,250,0.4)] transition-all border-0"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit
            </Button>
          </motion.div>
        </div>
      </div>

      {/* SPLIT VIEW */}
      <div className="flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* LEFT PANEL: Description */}
          <ResizablePanel defaultSize={40} minSize={30} className="bg-bg-surface flex flex-col h-full border-r border-border">
            <div className="flex border-b border-border px-2">
              {['description', 'submissions', 'hints'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'description' && (
                    <motion.div
                      key="description"
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-8"
                    >
                      <div className="text-text-secondary leading-relaxed text-sm">
                        {problem.description}
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-text-primary">Examples</h3>
                        {problem.examples && Object.values(problem.examples).map((ex, idx) => (
                          <div key={idx} className="bg-bg-elevated p-4 rounded-xl border border-border space-y-3 font-mono text-xs">
                            <div>
                              <span className="text-text-muted block mb-1">Input:</span>
                              <span className="text-text-primary">{ex.input}</span>
                            </div>
                            <div>
                              <span className="text-text-muted block mb-1">Output:</span>
                              <span className="text-text-primary">{ex.output}</span>
                            </div>
                            {ex.explanation && (
                              <div>
                                <span className="text-text-muted block mb-1">Explanation:</span>
                                <span className="text-text-secondary font-sans">{ex.explanation}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {problem.constraints && (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-text-primary">Constraints</h3>
                          <div className="bg-bg-elevated p-4 rounded-xl border border-border">
                            <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap">
                              {problem.constraints}
                            </pre>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'submissions' && (
                    <motion.div key="submissions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      {submissionHistory.length > 0 ? (
                        <SubmissionHistory submissions={submissionHistory} />
                      ) : (
                        <div className="text-center py-12 text-text-muted">No submissions yet.</div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'hints' && (
                    <motion.div key="hints" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="p-4 bg-bg-elevated rounded-xl border border-border text-sm text-text-secondary">
                        {problem.hints || "No hints available for this problem."}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-border hover:bg-accent/50 transition-colors" />

          {/* RIGHT PANEL: Editor + Console */}
          <ResizablePanel defaultSize={60} minSize={30} className="flex flex-col h-full bg-bg-base">

            {/* Editor Area */}
            <div className={`flex-1 flex flex-col transition-colors duration-300 ${isEditorFocused ? 'ring-1 ring-inset ring-accent/30' : ''}`}>
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-bg-surface/30">
                <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
                  <Code className="h-4 w-4" />
                  Code
                </div>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-[140px] h-7 text-xs bg-bg-elevated border-border text-text-secondary focus:ring-accent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JAVASCRIPT">JavaScript</SelectItem>
                    <SelectItem value="PYTHON">Python</SelectItem>
                    <SelectItem value="JAVA">Java</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 relative" onFocus={() => setIsEditorFocused(true)} onBlur={() => setIsEditorFocused(false)}>
                <Editor
                  height="100%"
                  language={selectedLanguage.toLowerCase()}
                  value={code}
                  onChange={(v) => setCode(v || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    padding: { top: 16 },
                    wordWrap: "on",
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    formatOnPaste: true,
                  }}
                />
              </div>
            </div>

            {/* Console Panel */}
            <div className="h-64 shrink-0 border-t border-border bg-bg-surface flex flex-col">
              <div className="flex items-center px-4 py-2 border-b border-border bg-bg-elevated/50">
                <div className="text-xs font-medium text-text-muted flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Console
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4">
                  <AnimatePresence mode="wait">

                    {/* IDLE STATE */}
                    {executionState === "IDLE" && (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="h-full flex flex-col items-center justify-center text-text-muted pt-8"
                      >
                        <Terminal className="h-8 w-8 mb-3 opacity-20" />
                        <p className="text-sm">Run your code to see results here</p>
                      </motion.div>
                    )}

                    {/* RUNNING STATE */}
                    {executionState === "RUNNING" && (
                      <motion.div
                        key="running"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-3 pt-4 pl-2"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                          className="h-3 w-3 rounded-full bg-pending shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                        />
                        <span className="text-sm font-medium text-pending">Executing...</span>
                      </motion.div>
                    )}

                    {/* ACCEPTED STATE */}
                    {executionState === "ACCEPTED" && (
                      <motion.div
                        key="accepted"
                        initial={{ opacity: 0, scale: 0.98, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          initial={{ boxShadow: "0 0 0 rgba(34,197,94,0)" }}
                          animate={{ boxShadow: ["0 0 0 rgba(34,197,94,0)", "0 0 20px rgba(34,197,94,0.2)", "0 0 0 rgba(34,197,94,0)"] }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-success/5 border border-border border-l-2 border-l-success rounded-lg p-4 mb-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                            <h3 className="font-semibold text-success">Accepted</h3>
                          </div>
                          {executionData?.submission && (
                            <div className="flex gap-6 mt-4 text-xs font-mono text-text-muted">
                              <div>
                                <span className="block mb-1 opacity-60">Runtime</span>
                                <span className="text-text-primary">
                                  {executionData.submission.performance?.time?.[0] || executionData.submission.time || "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="block mb-1 opacity-60">Memory</span>
                                <span className="text-text-primary">
                                  {executionData.submission.performance?.memory?.[0] || executionData.submission.memory || "N/A"}
                                </span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </motion.div>
                    )}

                    {/* WRONG ANSWER STATE */}
                    {executionState === "WRONG_ANSWER" && (
                      <motion.div
                        key="wrong_answer"
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="bg-error/5 border border-border border-l-2 border-l-error rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="h-5 w-5 text-error" />
                            <h3 className="font-semibold text-error">Wrong Answer</h3>
                          </div>
                        </div>

                        {/* Test Cases Breakdown */}
                        {executionData?.submission?.testCases && (
                          <div className="space-y-2 mt-4">
                            {executionData.submission.testCases.map((tc, idx) => (
                              <div key={idx} className="border border-border rounded-lg bg-bg-elevated overflow-hidden">
                                <button
                                  onClick={() => toggleTestCase(idx)}
                                  className="w-full flex items-center justify-between p-3 text-sm hover:bg-bg-surface transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    {tc.passed ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-error" />}
                                    <span className="font-medium text-text-primary">Test Case {idx + 1}</span>
                                  </div>
                                  {expandedTestCases[idx] ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
                                </button>
                                <AnimatePresence>
                                  {expandedTestCases[idx] && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="border-t border-border bg-bg-base p-3 font-mono text-xs space-y-3"
                                    >
                                      <div>
                                        <div className="text-text-muted mb-1">Input:</div>
                                        <div className="text-text-secondary bg-bg-surface p-2 rounded">{tc.input || "Hidden"}</div>
                                      </div>
                                      <div>
                                        <div className="text-text-muted mb-1">Expected Output:</div>
                                        <div className="text-success bg-success/10 p-2 rounded">{tc.expectedOutput || "Hidden"}</div>
                                      </div>
                                      {!tc.passed && (
                                        <div>
                                          <div className="text-text-muted mb-1">Actual Output:</div>
                                          <div className="text-error bg-error/10 p-2 rounded">{tc.actualOutput || tc.output || "Error/Timeout"}</div>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* ERROR STATE */}
                    {executionState === "ERROR" && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="bg-error/5 border border-border border-l-2 border-l-error rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-error" />
                            <h3 className="font-semibold text-error">Execution Error</h3>
                          </div>
                        </div>
                        <div className="bg-bg-elevated border border-border p-4 rounded-lg font-mono text-xs text-error/90 whitespace-pre-wrap overflow-x-auto">
                          {executionData?.error || executionData?.submission?.compile_output || executionData?.submission?.message || "An unknown error occurred during execution."}
                        </div>
                      </motion.div>
                    )}

                    {/* TLE STATE */}
                    {executionState === "TLE" && (
                      <motion.div
                        key="tle"
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="bg-pending/5 border border-border border-l-2 border-l-pending rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-5 w-5 text-pending" />
                            <h3 className="font-semibold text-pending">Time Limit Exceeded</h3>
                          </div>
                          <p className="text-sm text-text-muted mt-2">
                            Your solution took too long — consider optimizing your time complexity.
                          </p>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}