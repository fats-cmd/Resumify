# Database Setup Instructions

## Supabase Resume Table Schema

To make the resume saving and retrieval functionality work, you need to create a `resumes` table in your Supabase database with the following schema:

```sql
CREATE TABLE resumes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft',
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX idx_resumes_user_id ON resumes (user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own resumes" ON resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes" ON resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" ON resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" ON resumes
  FOR DELETE USING (auth.uid() = user_id);
```

## How to Create the Table

1. Go to your Supabase project dashboard
2. Navigate to the SQL editor
3. Copy and paste the SQL code above
4. Run the query

## Column Descriptions

- `id`: Auto-incrementing primary key
- `user_id`: Reference to the authenticated user (UUID)
- `title`: Display name for the resume
- `data`: JSONB field storing all resume information
- `status`: Current status (Draft, Published, etc.)
- `views`: Number of times the resume has been viewed
- `downloads`: Number of times the resume has been downloaded
- `is_featured`: Whether the resume is featured
- `created_at`: Timestamp when the resume was created
- `updated_at`: Timestamp when the resume was last updated

## Row Level Security (RLS)

The policies ensure that users can only:
- View their own resumes
- Create resumes for themselves
- Update their own resumes
- Delete their own resumes

This provides security and ensures users can only access their own data.

## Storage Setup

For profile image storage configuration, see [README_STORAGE.md](README_STORAGE.md)