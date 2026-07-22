-- Local credentials are reserved for administrators. Regular users authenticate with LINE.
CREATE TYPE "AuthProvider" AS ENUM ('LINE', 'LOCAL_ADMIN');
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

ALTER TABLE "User" RENAME COLUMN "password" TO "passwordHash";
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "User"
  ADD COLUMN "username" TEXT,
  ADD COLUMN "pictureUrl" TEXT,
  ADD COLUMN "authProvider" "AuthProvider",
  ADD COLUMN "role" "UserRole",
  ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lockedUntil" TIMESTAMP(3),
  ADD COLUMN "lastLoginAt" TIMESTAMP(3),
  ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

UPDATE "User"
SET "authProvider" = CASE WHEN "lineUserId" IS NOT NULL THEN 'LINE'::"AuthProvider" ELSE 'LOCAL_ADMIN'::"AuthProvider" END,
    "role" = CASE WHEN "lineUserId" IS NOT NULL THEN 'USER'::"UserRole" ELSE 'ADMIN'::"UserRole" END;

ALTER TABLE "User" ALTER COLUMN "authProvider" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "role" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- LINE users are now the web identities themselves, so account-link codes are obsolete.
DROP TABLE "LinkCode";
