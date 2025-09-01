import { createClient } from '@supabase/supabase-js';
import { ResumeData, Resume } from '@/types/resume';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Authentication features will not work properly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper functions
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  return { data, error };
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  
  return { data, error };
}

export async function getUserSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function updateProfile({ full_name }: { full_name: string }) {
  const { data: { user }, error } = await supabase.auth.updateUser({
    data: {
      full_name,
    },
  });
  
  return { user, error };
}

// Add storage functions for profile image handling
async function optimizeImage(file: File, maxWidth = 400, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not convert canvas to blob'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadProfileImage(file: File, userId: string) {
  try {
    // Optimize the image before uploading
    const optimizedBlob = await optimizeImage(file);
    const optimizedFile = new File([optimizedBlob], file.name, {
      type: 'image/jpeg',
    });
    
    const fileExt = 'jpg'; // We're converting to JPEG
    const fileName = `${userId}/profile.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(fileName, optimizedFile, {
        upsert: true,
        contentType: 'image/jpeg',
      });
    
    if (error) {
      throw error;
    }
    
    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);
    
    // Update user profile with the image URL
    const { data: userData, error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: publicUrl,
      },
    });
    
    if (updateError) {
      throw updateError;
    }
    
    return { publicUrl, user: userData.user, error: null };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return { publicUrl: null, user: null, error };
  }
}

export async function getProfileImageUrl(userId: string) {
  try {
    const fileName = `${userId}/profile`;
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);
    
    return { publicUrl, error: null };
  } catch (error) {
    console.error('Error getting profile image URL:', error);
    return { publicUrl: null, error };
  }
}

// Resume helper functions
export async function saveResume(userId: string, resumeData: ResumeData) {
  const { data, error } = await supabase
    .from('resumes')
    .insert([
      {
        user_id: userId,
        title: `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName} Resume`,
        data: resumeData,
      }
    ])
    .select();

  return { data, error };
}

export async function getResumes(userId: string) {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  return { data: data as Resume[] | null, error };
}

export async function updateResume(resumeId: number, resumeData: ResumeData) {
  const { data, error } = await supabase
    .from('resumes')
    .update({
      title: `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName} Resume`,
      data: resumeData,
      // Note: updated_at will be automatically set by the database due to DEFAULT NOW()
    })
    .eq('id', resumeId)
    .select();

  return { data, error };
}

export async function deleteResume(resumeId: number) {
  const { data, error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId);

  return { data, error };
}