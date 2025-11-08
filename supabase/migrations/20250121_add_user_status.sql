-- Add status column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.users ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END $$;

-- Update existing users to have active status
UPDATE public.users SET status = 'active' WHERE status IS NULL;

-- Add check constraint for valid status values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'users' AND constraint_name = 'users_status_check'
    ) THEN
        ALTER TABLE public.users 
        ADD CONSTRAINT users_status_check 
        CHECK (status IN ('active', 'inactive', 'suspended'));
    END IF;
END $$;

