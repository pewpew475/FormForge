-- Add user_id column to responses table for tracking form submissions by user
ALTER TABLE responses ADD COLUMN user_id TEXT;

-- Create index for better query performance
CREATE INDEX idx_responses_user_id ON responses(user_id);

-- Create composite index for form_id and user_id to efficiently check if user already submitted
CREATE INDEX idx_responses_form_user ON responses(form_id, user_id);

-- Add comment for documentation
COMMENT ON COLUMN responses.user_id IS 'Supabase auth user ID - tracks which user submitted the response';
