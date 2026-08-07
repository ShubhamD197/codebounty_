"use server";

import { db } from "@/lib/db";
import { getLanguageName, pollBatchResults, submitBatch } from "@/lib/judge0/judge0";
import { currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { includes } from "zod";

export const getAllProblems = async () => {
  try {
    const user = await currentUser();
    const data = await db.user.findUnique({
      where: {
        clerkId: user?.id,
      },
      select: {
        id: true,
      },
    });

    const problems = await db.problem.findMany({
      include: {

        solvedBy: {
          where: {
            userId: data.id
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: problems };
  } catch (error) {
    console.error("❌ Error fetching problems:", error);
    return { success: false, error: "Failed to fetch problems" };
  }
};

export const getProblemById = async (id) => {
  try {
    const problem = await db.problem.findUnique({
      where: {
        id: id,
      },
    });

    return { success: true, data: problem };
  } catch (error) {
    console.error("❌ Error fetching problem:", error);
    return { success: false, error: "Failed to fetch problem" };
  }
};

export const deleteProblem = async (problemId) => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthorized");
    }
    // Verify if user is admin
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true },
    });

    if (dbUser?.role !== UserRole.ADMIN) {
      throw new Error("Only admins can delete problems");
    }

    await db.problem.delete({
      where: { id: problemId },
    });

    revalidatePath("/problems");
    return { success: true, message: "Problem deleted successfully" };
  } catch (error) {
    console.error("Error deleting problem:", error);
    return {
      success: false,
      error: error.message || "Failed to delete problem",
    };
  }
};

const executeTestCases = async ({
  sourceCode,
  languageId,
  testCases,
}) => {
  if (!Array.isArray(testCases) || testCases.length === 0) {
    throw new Error("No test cases available");
  }

  const submissions = testCases.map((testCase) => ({
    source_code: sourceCode,
    language_id: languageId,
    stdin: testCase.input,
    base64_encoded: false,
    wait: false,
  }));

  const submitResponse = await submitBatch(submissions);

  const tokens = submitResponse.map((response) => response.token);

  const results = await pollBatchResults(tokens);

  let allPassed = true;

  const detailedResults = results.map((result, index) => {
    const stdout = result.stdout?.trim() || null;
    const expected = testCases[index].output?.trim();

    const passed = stdout === expected;

    if (!passed) {
      allPassed = false;
    }

    return {
      testCase: index + 1,
      passed,
      stdout,
      expected,
      stderr: result.stderr || null,
      compile_output: result.compile_output || null,
      status: result.status.description,
      memory: result.memory ? `${result.memory} KB` : null,
      time: result.time ? `${result.time} s` : null,
    };
  });

  return {
    allPassed,
    detailedResults,
  };
};

export const runCode = async (
  sourceCode,
  languageId,
  problemId
) => {
  try {
    const user = await currentUser();

    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const problem = await db.problem.findUnique({
      where: {
        id: problemId,
      },
      select: {
        id: true,
        testCases: true,
      },
    });

    if (!problem) {
      return {
        success: false,
        error: "Problem not found",
      };
    }

    /*
     * RUN:
     * Only execute visible test cases.
     *
     * isHidden === false
     */
    const visibleTestCases = problem.testCases.filter(
      (testCase) => testCase.isHidden === false
    );

    if (visibleTestCases.length === 0) {
      return {
        success: false,
        error: "No visible test cases available",
      };
    }

    const { allPassed, detailedResults } = await executeTestCases({
      sourceCode,
      languageId,
      testCases: visibleTestCases,
    });

    return {
      success: true,
      message: allPassed
        ? "All visible test cases passed"
        : "Some visible test cases failed",

      submission: {
        testCases: detailedResults,
      },
    };
  } catch (error) {
    console.error("❌ Error running code:", error);

    return {
      success: false,
      error: error.message || "Failed to run code",
    };
  }
};


export const submitCode = async (
  sourceCode,
  languageId,
  problemId
) => {
  try {
    const user = await currentUser();

    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const dbUser = await db.user.findUnique({
      where: {
        clerkId: user.id,
      },
    });

    if (!dbUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const problem = await db.problem.findUnique({
      where: {
        id: problemId,
      },
      select: {
        id: true,
        testCases: true,
      },
    });

    if (!problem) {
      return {
        success: false,
        error: "Problem not found",
      };
    }

    /*
     * SUBMIT:
     * Execute ALL test cases.
     */
    const allTestCases = problem.testCases;

    const { allPassed, detailedResults } = await executeTestCases({
      sourceCode,
      languageId,
      testCases: allTestCases,
    });

    const status = allPassed ? "Accepted" : "Wrong Answer";

    /* ------------------------- Create Submission ------------------------ */

    const submission = await db.submission.create({
      data: {
        userId: dbUser.id,
        problemId,
        sourceCode,
        language: getLanguageName(languageId),

        stdin: JSON.stringify(
          allTestCases.map((testCase) => testCase.input)
        ),

        stdout: JSON.stringify(
          detailedResults.map((result) => result.stdout)
        ),

        stderr: detailedResults.some((result) => result.stderr)
          ? JSON.stringify(
              detailedResults.map((result) => result.stderr)
            )
          : null,

        compileOutput: detailedResults.some(
          (result) => result.compile_output
        )
          ? JSON.stringify(
              detailedResults.map(
                (result) => result.compile_output
              )
            )
          : null,

        status,

        memory: detailedResults.some((result) => result.memory)
          ? JSON.stringify(
              detailedResults.map((result) => result.memory)
            )
          : null,

        time: detailedResults.some((result) => result.time)
          ? JSON.stringify(
              detailedResults.map((result) => result.time)
            )
          : null,
      },
    });

    /* -------------------------- Problem Solved -------------------------- */

    if (allPassed) {
      await db.problemSolved.upsert({
        where: {
          userId_problemId: {
            userId: dbUser.id,
            problemId,
          },
        },
        update: {},
        create: {
          userId: dbUser.id,
          problemId,
        },
      });
    }

    /* ------------------------- Test Case Results ------------------------ */

    const testCaseResults = detailedResults.map((result) => ({
      submissionId: submission.id,
      testCase: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      status: result.status,
      memory: result.memory,
      time: result.time,
    }));

    await db.testCaseResult.createMany({
      data: testCaseResults,
    });

    /* ---------------------------- Final Result -------------------------- */

    return {
      success: true,
      status,
      passedTestCases: detailedResults.filter(
        (result) => result.passed
      ).length,
      totalTestCases: detailedResults.length,
      submissionId: submission.id,

      performance: {
        memory: detailedResults
          .map((result) => result.memory)
          .filter(Boolean),

        time: detailedResults
          .map((result) => result.time)
          .filter(Boolean),
      },
    };
  } catch (error) {
    console.error("❌ Error submitting code:", error);

    return {
      success: false,
      error: error.message || "Failed to submit code",
    };
  }
};

export const getAllSubmissionByCurrentUserForProblem = async (
  problemId
) => {
  try {
    const user = await currentUser();

    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const dbUser = await db.user.findUnique({
      where: {
        clerkId: user.id,
      },
    });

    if (!dbUser) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const submissions = await db.submission.findMany({
      where: {
        problemId,
        userId: dbUser.id,
      },
    });

    return {
      success: true,
      data: submissions,
    };
  } catch (error) {
    console.error("❌ Error fetching submissions:", error);

    return {
      success: false,
      error: "Failed to fetch submissions",
    };
  }
};