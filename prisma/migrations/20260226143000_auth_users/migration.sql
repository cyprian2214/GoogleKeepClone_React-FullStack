-- Create users table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Add note ownership column as nullable first for safe backfill
ALTER TABLE "Note" ADD COLUMN "userId" TEXT;

-- Backfill existing notes to a placeholder legacy user
INSERT INTO "User" ("id", "email", "passwordHash", "createdAt", "updatedAt")
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'legacy@example.local',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOHiw2kA8h7H9MuNoMNFcQJUO2cCh6i7K',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;

UPDATE "Note"
SET "userId" = '00000000-0000-0000-0000-000000000001'
WHERE "userId" IS NULL;

ALTER TABLE "Note" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Note"
ADD CONSTRAINT "Note_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
