"use client";
import { Editor } from "@monaco-editor/react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Code2,
  FileText,
  CheckCircle2,
  Download,
  Settings2,
  TerminalSquare,
  AlertCircle,
  GripVertical,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


// SCHEMA
const problemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  constraints: z.string().min(1, "Constraints are required"),
  hints: z.string().optional(),
  editorial: z.string().optional(),
  testCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
        isHidden: z.boolean(),
      })
    )
    .min(1, "At least one test case is required"),
  examples: z.object({
    JAVASCRIPT: z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    }),
    PYTHON: z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    }),
    JAVA: z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().optional(),
    }),
  }),
  codeSnippets: z.object({
    JAVASCRIPT: z.string().min(1, "JavaScript code snippet is required"),
    PYTHON: z.string().min(1, "Python code snippet is required"),
    JAVA: z.string().min(1, "Java solution is required"),
  }),
  referenceSolutions: z.object({
    JAVASCRIPT: z.string().min(1, "JavaScript solution is required"),
    PYTHON: z.string().min(1, "Python solution is required"),
    JAVA: z.string().min(1, "Java solution is required"),
  }),
});

// SAMPLE DATA
const sampledpData = {
  title: "Climbing Stairs",
  description:
    "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
  difficulty: "EASY",
  tags: ["Dynamic Programming", "Math", "Memoization"],
  constraints: "1 <= n <= 45",
  hints:
    "To reach the nth step, you can either come from the (n-1)th step or the (n-2)th step.",
  editorial:
    "This is a classic dynamic programming problem. The number of ways to reach the nth step is the sum of the number of ways to reach the (n-1)th step and the (n-2)th step, forming a Fibonacci-like sequence.",
  testCases: [
    {
      input: "2", output: "2", isHidden: false,
    },
    {
      input: "3", output: "3", isHidden: false,
    },
    {
      input: "4", output: "5", isHidden: false,
    },
  ],
  examples: {
    JAVASCRIPT: {
      input: "n = 2",
      output: "2",
      explanation: "There are two ways to climb to the top:\n1. 1 step + 1 step\n2. 2 steps",
    },
    PYTHON: {
      input: "n = 3",
      output: "3",
      explanation:
        "There are three ways to climb to the top:\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step",
    },
    JAVA: {
      input: "n = 4",
      output: "5",
      explanation:
        "There are five ways to climb to the top:\n1. 1 step + 1 step + 1 step + 1 step\n2. 1 step + 1 step + 2 steps\n3. 1 step + 2 steps + 1 step\n4. 2 steps + 1 step + 1 step\n5. 2 steps + 2 steps",
    },
  },
  codeSnippets: {
    JAVASCRIPT: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  // Write your code here
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
rl.on('line', (line) => {
  const n = parseInt(line.trim());
  const result = climbStairs(n);
  console.log(result);
  rl.close();
});`,
    PYTHON: `class Solution:
    def climbStairs(self, n: int) -> int:
        # Write your code here
        pass

if __name__ == "__main__":
    import sys
    n = int(sys.stdin.readline().strip())
    sol = Solution()
    result = sol.climbStairs(n)
    print(result)`,
    JAVA: `import java.util.Scanner;

class Main {
    public int climbStairs(int n) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        Main main = new Main();
        int result = main.climbStairs(n);
        System.out.println(result);
        scanner.close();
    }
}`,
  },
  referenceSolutions: {
    JAVASCRIPT: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  if (n <= 2) {
    return n;
  }
  let dp = new Array(n + 1);
  dp[1] = 1;
  dp[2] = 2;
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
rl.on('line', (line) => {
  const n = parseInt(line.trim());
  const result = climbStairs(n);
  console.log(result);
  rl.close();
});`,
    PYTHON: `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n

        dp = [0] * (n + 1)
        dp[1] = 1
        dp[2] = 2

        for i in range(3, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]

        return dp[n]

if __name__ == "__main__":
    import sys
    n = int(sys.stdin.readline().strip())
    sol = Solution()
    result = sol.climbStairs(n)
    print(result)`,
    JAVA: `import java.util.Scanner;

class Main {
    public int climbStairs(int n) {
        if (n <= 2) {
            return n;
        }
        int[] dp = new int[n + 1];
        dp[1] = 1;
        dp[2] = 2;
        for (int i = 3; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        return dp[n];
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        Main main = new Main();
        int result = main.climbStairs(n);
        System.out.println(result);
        scanner.close();
    }
}`,
  },
};

const sampleStringProblem = {
  title: "Valid Palindrome",
  description:
    "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string s, return true if it is a palindrome, or false otherwise.",
  difficulty: "EASY",
  tags: ["String", "Two Pointers"],
  constraints: "1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
  hints: "Consider using two pointers, one from the start and one from the end, moving towards the center.",
  editorial:
    "We can use a two pointers approach to check if the string is a palindrome. One pointer starts from the beginning and the other from the end, moving towards each other.",
  testCases: [
    { input: "A man, a plan, a canal: Panama", output: "true",
    isHidden: false, },
    { input: "race a car", output: "false", isHidden: false, },
    { input: " ", output: "true", isHidden: false, },
  ],
  examples: {
    JAVASCRIPT: {
      input: 's = "A man, a plan, a canal: Panama"',
      output: "true",
      explanation: '"amanaplanacanalpanama" is a palindrome.',
    },
    PYTHON: {
      input: 's = "A man, a plan, a canal: Panama"',
      output: "true",
      explanation: '"amanaplanacanalpanama" is a palindrome.',
    },
    JAVA: {
      input: 's = "A man, a plan, a canal: Panama"',
      output: "true",
      explanation: '"amanaplanacanalpanama" is a palindrome.',
    },
  },
  codeSnippets: {
    JAVASCRIPT: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  // Write your code here
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
rl.on('line', (line) => {
  const result = isPalindrome(line);
  console.log(result ? "true" : "false");
  rl.close();
});`,
    PYTHON: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        # Write your code here
        pass

if __name__ == "__main__":
    import sys
    s = sys.stdin.readline().strip()
    sol = Solution()
    result = sol.isPalindrome(s)
    print(str(result).lower())`,
    JAVA: `import java.util.Scanner;

public class Main {
    public static String preprocess(String s) {
        return s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
    }

    public static boolean isPalindrome(String s) {
        // Write your code here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String input = sc.nextLine();
        boolean result = isPalindrome(input);
        System.out.println(result ? "true" : "false");
    }
}`,
  },
  referenceSolutions: {
    JAVASCRIPT: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  s = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
rl.on('line', (line) => {
  const result = isPalindrome(line);
  console.log(result ? "true" : "false");
  rl.close();
});`,
    PYTHON: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        filtered_chars = [c.lower() for c in s if c.isalnum()]
        return filtered_chars == filtered_chars[::-1]

if __name__ == "__main__":
    import sys
    s = sys.stdin.readline().strip()
    sol = Solution()
    result = sol.isPalindrome(s)
    print(str(result).lower())`,
    JAVA: `import java.util.Scanner;

public class Main {
    public static String preprocess(String s) {
        return s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
    }

    public static boolean isPalindrome(String s) {
        s = preprocess(s);
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) return false;
            left++;
            right--;
        }
        return true;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String input = sc.nextLine();
        boolean result = isPalindrome(input);
        System.out.println(result ? "true" : "false");
    }
}`,
  },
};

const EMPTY_TEMPLATES = {
  codeSnippets: {
    JAVASCRIPT: `function solution(s) {
  // Write your code here
}`,
    PYTHON: `class Solution:
    def solution(self, s):
        # Write your code here
        pass`,
    JAVA: `public class Main {
    public static boolean solution(String s) {
        // Write your code here
        return false;
    }
}`,
  },
  referenceSolutions: {
    JAVASCRIPT: `function solution(s) {
  // Write your reference solution here
}`,
    PYTHON: `class Solution:
    def solution(self, s):
        # Write your reference solution here
        pass`,
    JAVA: `public class Main {
    public static boolean solution(String s) {
        // Write your reference solution here
        return false;
    }
}`,
  },
};

// CODE EDITOR
const CodeEditor = ({ value, onChange, language = "javascript", title }) => {
  const languageMap = {
    javascript: "javascript",
    python: "python",
    java: "java",
  };

  return (
    <div className="group rounded-md border border-border/40 bg-zinc-950 overflow-hidden transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-border/40">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{title}</span>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
        </div>
      </div>
      <div className="h-[350px] w-full">
        <Editor
          height="100%"
          defaultLanguage={languageMap[language]}
          theme="vs-dark"
          value={value}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            padding: { top: 16 },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: { vertical: "hidden" },
            wordWrap: "on",
            automaticLayout: true, // required: tab-hidden panes render 0x0 without this
          }}
        />
      </div>
    </div>
  );
};

// MAIN FORM
const CreateProblemForm = () => {
  const router = useRouter();
  const [sampleType, setSampleType] = useState("DP");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeLangTab, setActiveLangTab] = useState("JAVASCRIPT");

  const form = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "EASY",
      constraints: "",
      hints: "",
      editorial: "",
      tags: [""],
      testCases: [{ input: "", output: "", isHidden: false }],
      examples: {
        JAVASCRIPT: { input: "", output: "", explanation: "" },
        PYTHON: { input: "", output: "", explanation: "" },
        JAVA: { input: "", output: "", explanation: "" },
      },
      codeSnippets: { ...EMPTY_TEMPLATES.codeSnippets },
      referenceSolutions: { ...EMPTY_TEMPLATES.referenceSolutions },
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const {
    fields: testCaseFields,
    append: appendTestCase,
    remove: removeTestCase,
    replace: replaceTestCases,
  } = useFieldArray({ control, name: "testCases" });

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
    replace: replaceTags,
  } = useFieldArray({ control, name: "tags" });

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/create-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      toast.success(data.message || "Problem created successfully");
      router.push("/problems");
    } catch (error) {
      console.error("Error creating problem:", error);
      toast.error(error.message || "Failed to create problem");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleData = () => {
    const sampleData = sampleType === "DP" ? sampledpData : sampleStringProblem;
    replaceTags(sampleData.tags.map((tag) => tag));
    replaceTestCases(sampleData.testCases.map((tc) => ({ ...tc, isHidden: !!tc.isHidden })));
    reset(sampleData);
  };

  // Helper to check if a specific tab's fields have validation errors
  const hasErrors = (fields) => fields.some((field) => errors[field]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Sticky Action Header */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm px-6 py-4 mb-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TerminalSquare className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold tracking-tight">Problem Workspace</h1>
              </div>
              <p className="text-sm text-muted-foreground">Draft, test, and publish a new algorithmic challenge.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
                <Button
                  type="button"
                  variant={sampleType === "DP" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 text-xs font-medium"
                  onClick={() => setSampleType("DP")}
                >
                  DP Template
                </Button>
                <Button
                  type="button"
                  variant={sampleType === "string" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 text-xs font-medium"
                  onClick={() => setSampleType("string")}
                >
                  String Template
                </Button>
              </div>

              <Button type="button" variant="outline" size="sm" onClick={loadSampleData} className="h-9 gap-2 font-medium">
                <Download className="w-4 h-4" /> Load
              </Button>
              <Button type="submit" size="sm" disabled={isLoading} className="h-9 gap-2 font-medium">
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Publish Problem
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none p-0 h-auto">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-6 py-3 font-medium"
              >
                <FileText className="w-4 h-4 mr-2" /> Basic Info
                {hasErrors(["title", "description", "difficulty", "tags", "constraints"]) && (
                  <AlertCircle className="w-3.5 h-3.5 ml-2 text-destructive" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="environments"
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-6 py-3 font-medium"
              >
                <Code2 className="w-4 h-4 mr-2" /> Code Environments
                {hasErrors(["codeSnippets", "referenceSolutions", "examples"]) && (
                  <AlertCircle className="w-3.5 h-3.5 ml-2 text-destructive" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="testcases"
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-6 py-3 font-medium"
              >
                <Settings2 className="w-4 h-4 mr-2" /> Test Cases
                {hasErrors(["testCases"]) && <AlertCircle className="w-3.5 h-3.5 ml-2 text-destructive" />}
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="space-y-8 outline-none animate-in fade-in-50 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Problem Title
                      </Label>
                      <Input
                        {...register("title")}
                        placeholder="e.g. Valid Palindrome"
                        className="mt-2 h-12 text-lg font-medium bg-muted/20"
                      />
                      {errors.title && <p className="text-sm text-destructive mt-1.5">{errors.title.message}</p>}
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Description (Markdown)
                      </Label>
                      <Textarea
                        {...register("description")}
                        placeholder="Describe the problem context and requirements..."
                        className="mt-2 min-h-[300px] resize-y font-mono text-sm leading-relaxed bg-muted/20"
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive mt-1.5">{errors.description.message}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Editorial (Optional)
                      </Label>
                      <Textarea
                        {...register("editorial")}
                        placeholder="Explain the intended solution approach..."
                        className="mt-2 min-h-[150px] resize-y bg-muted/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader className="pb-4 border-b border-border/40">
                      <CardTitle className="text-base font-semibold">Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Difficulty
                        </Label>
                        <Controller
                          name="difficulty"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="mt-2 bg-muted/20">
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="EASY">
                                  <span className="text-green-500 font-medium">Easy</span>
                                </SelectItem>
                                <SelectItem value="MEDIUM">
                                  <span className="text-amber-500 font-medium">Medium</span>
                                </SelectItem>
                                <SelectItem value="HARD">
                                  <span className="text-red-500 font-medium">Hard</span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Tags
                          </Label>
                          <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => appendTag("")}>
                            <Plus className="w-3 h-3 mr-1" /> Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {tagFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                              <Input
                                {...register(`tags.${index}`)}
                                placeholder="e.g. Dynamic Programming"
                                className="h-8 text-sm bg-muted/20"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTag(index)}
                                disabled={tagFields.length === 1}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        {errors.tags && <p className="text-xs text-destructive mt-1.5">{errors.tags.message}</p>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 shadow-sm">
                    <CardHeader className="pb-4 border-b border-border/40">
                      <CardTitle className="text-base font-semibold">Technical Details</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Constraints
                        </Label>
                        <Textarea
                          {...register("constraints")}
                          placeholder="1 <= s.length <= 10^5"
                          className="mt-2 min-h-[100px] font-mono text-sm bg-muted/20"
                        />
                        {errors.constraints && (
                          <p className="text-xs text-destructive mt-1.5">{errors.constraints.message}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Hints
                        </Label>
                        <Textarea
                          {...register("hints")}
                          placeholder="Optional hints..."
                          className="mt-2 min-h-[80px] bg-muted/20"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: ENVIRONMENTS */}
            <TabsContent value="environments" className="outline-none animate-in fade-in-50 duration-500">
              <div className="border border-border/50 rounded-lg overflow-hidden bg-background shadow-sm">
                <Tabs value={activeLangTab} onValueChange={setActiveLangTab} className="w-full">
                  <div className="flex border-b border-border/50 bg-muted/10 px-4 pt-4">
                    <TabsList className="bg-transparent h-auto p-0 gap-6">
                      {["JAVASCRIPT", "PYTHON", "JAVA"].map((lang) => (
                        <TabsTrigger
                          key={lang}
                          value={lang}
                          className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-2 py-2 font-mono text-sm data-[state=active]:text-primary"
                        >
                          {lang}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {["JAVASCRIPT", "PYTHON", "JAVA"].map((language) => (
                    <TabsContent key={language} value={language} className="p-6 m-0 space-y-8 bg-muted/5">
                      <div className="grid lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Code2 className="w-4 h-4 text-muted-foreground" /> Starter Template
                          </Label>
                          <Controller
                            name={`codeSnippets.${language}`}
                            control={control}
                            render={({ field }) => (
                              <CodeEditor value={field.value} onChange={field.onChange} language={language.toLowerCase()} title="user_solution" />
                            )}
                          />
                          {errors.codeSnippets?.[language] && (
                            <p className="text-xs text-destructive">{errors.codeSnippets[language].message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Reference Solution
                          </Label>
                          <Controller
                            name={`referenceSolutions.${language}`}
                            control={control}
                            render={({ field }) => (
                              <CodeEditor value={field.value} onChange={field.onChange} language={language.toLowerCase()} title="reference_solution" />
                            )}
                          />
                          {errors.referenceSolutions?.[language] && (
                            <p className="text-xs text-destructive">{errors.referenceSolutions[language].message}</p>
                          )}
                        </div>
                      </div>

                      <Separator className="bg-border/40" />

                      <div className="space-y-4">
                        <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Language Specific Example
                        </Label>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-2 block">Example Input format</Label>
                            <Textarea
                              {...register(`examples.${language}.input`)}
                              className="min-h-[100px] font-mono text-sm bg-background border-border/50"
                            />
                            {errors.examples?.[language]?.input && (
                              <p className="text-xs text-destructive mt-1">{errors.examples[language].input.message}</p>
                            )}
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-2 block">Example Output format</Label>
                            <Textarea
                              {...register(`examples.${language}.output`)}
                              className="min-h-[100px] font-mono text-sm bg-background border-border/50"
                            />
                            {errors.examples?.[language]?.output && (
                              <p className="text-xs text-destructive mt-1">{errors.examples[language].output.message}</p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-xs text-muted-foreground mb-2 block">Explanation</Label>
                            <Textarea
                              {...register(`examples.${language}.explanation`)}
                              className="min-h-[80px] bg-background border-border/50"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </TabsContent>

            {/* TAB 3: TEST CASES */}
            <TabsContent value="testcases" className="outline-none animate-in fade-in-50 duration-500">
              <div className="space-y-4 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium">Evaluation Data</h3>
                    <p className="text-sm text-muted-foreground">Define inputs and expected outputs to validate user submissions.</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => appendTestCase({ input: "", output: "", isHidden: false })}
                    size="sm"
                    variant="secondary"
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Test Case
                  </Button>
                </div>

                {testCaseFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="group relative flex gap-4 p-4 rounded-xl border border-border/40 bg-muted/10 hover:border-border transition-colors"
                  >
                    <div className="pt-2 text-muted-foreground/50 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    <div className="flex-1 grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Input</Label>
                        <Textarea
                          {...register(`testCases.${index}.input`)}
                          placeholder="stdin"
                          className="min-h-[120px] font-mono text-sm bg-background/50 border-border/50 resize-y"
                        />
                        {errors.testCases?.[index]?.input && (
                          <p className="text-xs text-destructive">{errors.testCases[index].input.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                          Expected Output
                        </Label>
                        <Textarea
                          {...register(`testCases.${index}.output`)}
                          placeholder="stdout"
                          className="min-h-[120px] font-mono text-sm bg-background/50 border-border/50 resize-y"
                        />
                        {errors.testCases?.[index]?.output && (
                          <p className="text-xs text-destructive">{errors.testCases[index].output.message}</p>
                        )}
                      </div>

                      <div className="md:col-span-2 flex items-center justify-between pt-2 border-t border-border/30">
                        <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground text-muted-foreground transition-colors">
                          <input
                            type="checkbox"
                            {...register(`testCases.${index}.isHidden`)}
                            className="rounded border-muted-foreground/30 text-primary bg-transparent focus:ring-primary focus:ring-offset-background"
                          />
                          Hidden Case (used only during final submission)
                        </label>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTestCase(index)}
                          disabled={testCaseFields.length === 1}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {errors.testCases && !Array.isArray(errors.testCases) && (
                  <p className="text-sm font-medium text-destructive mt-2">{errors.testCases.message}</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </form>
    </div>
  );
};

export default CreateProblemForm;