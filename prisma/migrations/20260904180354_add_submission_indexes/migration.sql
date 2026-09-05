-- CreateIndex
CREATE INDEX "ProblemSolved_problemId_idx" ON "ProblemSolved"("problemId");

-- CreateIndex
CREATE INDEX "Submission_userId_problemId_idx" ON "Submission"("userId", "problemId");

-- CreateIndex
CREATE INDEX "Submission_problemId_idx" ON "Submission"("problemId");
