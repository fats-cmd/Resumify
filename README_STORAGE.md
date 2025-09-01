# Supabase Storage Setup Instructions

## Profile Images Bucket Setup

To enable profile image uploads, you need to create a storage bucket in your Supabase project with the following configuration:

### 1. Create the Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to Storage → Buckets
3. Click "New Bucket"
4. Enter the following details:
   - **Name**: `profile-images`
   - **Public URLs**: Enable (check the box)
5. Click "Create"

### 2. Set Up Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies to ensure users can only access their own profile images:

1. Go to your Supabase project dashboard
2. Navigate to Storage → Buckets
3. Click on the `profile-images` bucket
4. Click on the "Policies" tab
5. Create the following policies:

#### Insert Policy (Users can upload their own profile images)
```sql
FOR INSERT
WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text)
```

#### Select Policy (Users can view their own profile images)
```sql
FOR SELECT
USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text)
```

#### Update Policy (Users can update their own profile images)
```sql
FOR UPDATE
USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text)
```

#### Delete Policy (Users can delete their own profile images)
```sql
FOR DELETE
USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text)
```

### 3. Public Access Configuration

Since profile images need to be publicly accessible (for display in the UI), you also need a policy to allow public read access:

1. Create a new policy with the following configuration:
   - **Policy Name**: `Public read access for profile images`
   - **Operation**: SELECT
   - **Policy Definition**:
   ```sql
   FOR SELECT
   USING (bucket_id = 'profile-images')
   ```

### 4. Folder Structure

Profile images are stored using the following structure:
```
profile-images/
└── [user-id]/
    └── profile.[ext]
```

For example:
```
profile-images/
└── 123e4567-e89b-12d3-a456-426614174000/
    └── profile.jpg
```

### 5. File Naming Convention

- Each user gets their own folder named with their UUID
- Profile images are always named `profile` with the appropriate file extension
- This ensures each user can only have one profile image, and uploading a new one will overwrite the existing one

### 6. Supported File Types

The application supports the following image formats:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### 7. File Size Limits

- Maximum file size: 2MB
- Recommended dimensions: 200x200 pixels (will be automatically displayed as a circle)

### 8. Implementation Details

The profile image upload functionality is implemented in:
- `lib/supabase.ts` - Contains the `uploadProfileImage` and `getProfileImageUrl` functions
- `app/settings/page.tsx` - Contains the UI for uploading profile images
- `components/navbar.tsx` - Displays the profile image in the navigation bar

### 9. Security Considerations

- All profile images are stored in a private bucket
- Users can only access their own profile images
- Public URLs are generated for displaying images in the UI
- File type and size validation is performed on the client side
- Files are automatically overwritten when a new profile image is uploaded