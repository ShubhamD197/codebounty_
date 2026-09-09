-- Added as nullable first: existing problems must be numbered by creation order,
-- not by physical row order, which is what a plain SERIAL column would give us.
ALTER TABLE "Problem" ADD COLUMN "number" INTEGER;

WITH ordered AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS rn
  FROM "Problem"
)
UPDATE "Problem" p
SET "number" = ordered.rn
FROM ordered
WHERE p."id" = ordered."id";

-- Hand-rolled equivalent of SERIAL, so the sequence starts after the backfill
-- instead of at 1 and immediately colliding with the unique index.
CREATE SEQUENCE "Problem_number_seq" AS INTEGER OWNED BY "Problem"."number";
SELECT setval('"Problem_number_seq"', COALESCE((SELECT MAX("number") FROM "Problem"), 0) + 1, false);
ALTER TABLE "Problem" ALTER COLUMN "number" SET DEFAULT nextval('"Problem_number_seq"');
ALTER TABLE "Problem" ALTER COLUMN "number" SET NOT NULL;

CREATE UNIQUE INDEX "Problem_number_key" ON "Problem"("number");
