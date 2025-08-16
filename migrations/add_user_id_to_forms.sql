-- Add user_id column to forms table for user association
ALTER TABLE forms ADD COLUMN user_id TEXT;

-- Create index for better query performance
CREATE INDEX idx_forms_user_id ON forms(user_id);

-- Add comment for documentation
COMMENT ON COLUMN forms.user_id IS 'Supabase auth user ID - associates forms with authenticated users';
