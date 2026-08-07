"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Editor from "@monaco-editor/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  Send,
  Code,
  FileText,
  Lightbulb,
  Trophy,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-toggle";

import { getJudge0LanguageId } from "@/lib/judge0/judge0";
import { toast } from "sonner";
import Link from "next/link";
import {
  runCode,
  submitCode,
  getAllSubmissionByCurrentUserForProblem,
  getProblemById,
} from "@/modules/problems/actions";

// import { SubmissionDetails } from "@/modules/problems/components/submission-details";
import { TestCaseTable } from "@/modules/problems/components/test-case-table";
import { SubmissionHistory } from "@/modules/problems/components/submission-history";

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "EASY":
      return "bg-green-100 text-green-800 border-green-200";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "HARD":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const SubmissionResultSummary = ({ submission }) => {
  const {
    status,
    passedTestCases,
    totalTestCases,
    performance,
  } = submission;

  const isAccepted = status === "Accepted";

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle
          className={
            isAccepted
              ? "text-green-500"
              : "text-red-500"
          }
        >
          {status}
        </CardTitle>

        <CardDescription>
          {passedTestCases} / {totalTestCases} test cases passed
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Test Cases
            </p>

            <p className="text-xl font-semibold">
              {passedTestCases} / {totalTestCases}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Status
            </p>

            <p className="text-xl font-semibold">
              {status}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Runtime
            </p>

            <p className="text-xl font-semibold">
              {performance?.time?.length
                ? performance.time[0]
                : "N/A"}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Memory
            </p>

            <p className="text-xl font-semibold">
              {performance?.memory?.length
                ? performance.memory[0]
                : "N/A"}
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

const ProblemIdPage = ({ params }) => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("JAVASCRIPT");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [executionResponse, setExecutionResponse] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const resolvedParams = await params;
        const problemData = await getProblemById(resolvedParams.id);
        if (problemData.success) {
          console.log(problemData.data);
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
    const fetchSubmissionHistory = async () => {
      try {
        const resolvedParams = await params;
        const submissionHistory = await getAllSubmissionByCurrentUserForProblem(resolvedParams.id);
        console.log(submissionHistory);
        if (submissionHistory.success) {
          setSubmissionHistory(submissionHistory.data);
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
      }
    }

    fetchSubmissionHistory();
  }, [params])


  useEffect(() => {
    if (problem && problem.codeSnippets[selectedLanguage]) {
      setCode(problem.codeSnippets[selectedLanguage]);
    }
  }, [selectedLanguage, problem]);

  const handleRun = async () => {
    try {
      setIsRunning(true);

      const language_id = getJudge0LanguageId(selectedLanguage);

      const res = await runCode(
        code,
        language_id,
        problem.id
      );

      if (!res.success) {
        toast.error(res.error || "Failed to run code");
        setExecutionResponse(null);
        return;
      }

      setExecutionResponse({
        type: "run",
        submission: res.submission,
      });

      if (res.message) {
        if (res.submission.testCases.every((testCase) => testCase.passed)) {
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      }
    } catch (error) {
      console.error("Error running code:", error);
      toast.error(error.message || "Failed to run code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const language_id = getJudge0LanguageId(selectedLanguage);

      const res = await submitCode(
        code,
        language_id,
        problem.id
      );

      if (!res.success) {
        toast.error(res.error || "Failed to submit code");
        return;
      }

      setExecutionResponse({
        type: "submit",
        submission: res,
      });

      if (res.status === "Accepted") {
        toast.success("Accepted");
      } else {
        toast.error("Wrong Answer");
      }

      // Refresh submission history after a real submission
      const resolvedParams = await params;

      const history =
        await getAllSubmissionByCurrentUserForProblem(
          resolvedParams.id
        );

      if (history.success) {
        setSubmissionHistory(history.data);
      }
    } catch (error) {
      console.error("Error submitting code:", error);
      toast.error(error.message || "Failed to submit code");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="animate-spin size-5 text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Link href="/">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="size-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">{problem?.title}</h1>
              <Badge
                className={cn(
                  "font-medium",
                  getDifficultyColor(problem?.difficulty)
                )}
              >
                {problem?.difficulty}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {problem?.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <ModeToggle />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Problem Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-foreground leading-relaxed">
                    {problem?.description}
                  </p>

                  {/* Examples */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Example:</h3>
                    {problem?.examples[selectedLanguage] && (
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div>
                          <span className="font-medium text-amber-400">
                            Input:{" "}
                          </span>
                          <code className="text-sm dark:bg-zinc-900 bg-zinc-200 text-zinc-900 dark:text-zinc-200 px-2 py-1 rounded">
                            {problem?.examples[selectedLanguage].input}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium text-amber-400">
                            Output:{" "}
                          </span>
                          <code className="text-sm dark:bg-zinc-900 bg-zinc-200 text-zinc-900 dark:text-zinc-200 px-2 py-1 rounded">
                            {problem?.examples[selectedLanguage].output}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Explanation: </span>
                          <span className="text-sm">
                            {problem?.examples[selectedLanguage]?.explanation}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Constraints */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Constraints:</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {problem?.constraints}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <Tabs defaultValue="submissions" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                      value="submissions"
                      className="flex items-center gap-2"
                    >
                      <Trophy className="h-4 w-4" />
                      Submissions
                    </TabsTrigger>
                    <TabsTrigger
                      value="editorial"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Editorial
                    </TabsTrigger>
                    <TabsTrigger
                      value="hints"
                      className="flex items-center gap-2"
                    >
                      <Lightbulb className="h-4 w-4" />
                      Hints
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="submissions" className="p-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Submission History</p>
                      <SubmissionHistory submissions={submissionHistory} />
                    </div>
                  </TabsContent>
                  <TabsContent value="editorial" className="p-6">
                    <div className="text-center py-8 text-muted-foreground">
                      {problem.editorial
                        ? problem.editorial
                        : "Editorial not available yet."}
                    </div>
                  </TabsContent>
                  <TabsContent value="hints" className="p-6">
                    <div className="text-center py-8 text-muted-foreground">
                      {problem.hints
                        ? problem.hints
                        : "No hints available for this problem."}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Code Editor
                  </CardTitle>
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JAVASCRIPT">JavaScript</SelectItem>
                      <SelectItem value="PYTHON">Python</SelectItem>
                      <SelectItem value="JAVA">Java</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Editor
                    height="400px"
                    language={
                      selectedLanguage.toLowerCase() === "javascript"
                        ? "javascript"
                        : selectedLanguage.toLowerCase()
                    }
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 16,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: "on",
                    }}
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={handleRun}
                    disabled={isRunning}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {isRunning ? "Running..." : "Run"}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Cases</CardTitle>
                <CardDescription>
                  Run your code against these test cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-4">
                    {problem.testCases
                      .filter((testCase) => testCase.isHidden === false)
                      .map((testCase, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="text-sm font-medium mb-2">
                            Test Case {index + 1}
                          </div>

                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Input:{" "}
                              </span>

                              <code className="bg-muted px-2 py-1 rounded text-xs">
                                {testCase.input}
                              </code>
                            </div>

                            <div>
                              <span className="text-muted-foreground">
                                Expected:{" "}
                              </span>

                              <code className="bg-muted px-2 py-1 rounded text-xs">
                                {testCase.output}
                              </code>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Test Results and Submission Details */}
            {executionResponse?.type === "run" &&
              executionResponse.submission?.testCases && (
                <div className="space-y-4 mt-4">
                  <TestCaseTable
                    testCases={executionResponse.submission.testCases}
                  />
                </div>
              )}

            {executionResponse?.type === "submit" &&
              executionResponse.submission && (
                <SubmissionResultSummary
                  submission={executionResponse.submission}
                />
              )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemIdPage;