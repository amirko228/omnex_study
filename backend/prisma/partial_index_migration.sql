-- Drop the existing unique constraint on email
DROP INDEX IF EXISTS "users_email_key";

-- Create a partial unique index that only applies to active users (deleted_at IS NULL)
CREATE UNIQUE INDEX "users_email_active_key" ON "users"("email") WHERE "deleted_at" IS NULL;
