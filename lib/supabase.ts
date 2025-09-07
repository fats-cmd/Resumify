import { createClient, SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import { ResumeData, Resume } from '@/types/resume';
import { handleAuthError } from '@/lib/auth-utils';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Authentication features will not work properly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper functions
export async function signUp(email: string, password: string, fullName?: string) {
  try {
    // If fullName is provided, include it in the user metadata
    const options: SignUpWithPasswordCredentials['options'] = fullName ? {
      data: {
        full_name: fullName,
      },
    } : undefined;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });
    
    // Check if this might be a case of an existing user
    // When Confirm email is enabled, Supabase returns an obfuscated user object
    // for existing confirmed users for security reasons
    if (data && data.user && !data.user.identities?.length && !data.user.confirmed_at) {
      // This indicates the user might already exist
      // We'll return a custom error message to handle this case
      return { 
        data: null, 
        error: new Error('This email is already registered. Please use a different email or try logging in instead.') 
      };
    }
    
    return { data, error };
  } catch (error) {
    console.error('Sign up error:', error);
    return { data: null, error: error as Error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  } catch (error) {
    console.error('Sign in error:', error);
    // Handle auth errors
    if (error instanceof Error) {
      handleAuthError(error);
    }
    return { data: null, error: error as Error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error as Error };
  }
}

export async function resetPassword(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    return { data, error };
  } catch (error) {
    console.error('Reset password error:', error);
    return { data: null, error: error as Error };
  }
}

export async function updatePassword(password: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    
    return { data, error };
  } catch (error) {
    console.error('Update password error:', error);
    return { data: null, error: error as Error };
  }
}

export async function getUserSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  } catch (error) {
    console.error('Get user session error:', error);
    // Handle auth errors
    if (error instanceof Error) {
      handleAuthError(error);
    }
    return { session: null, error: error as Error };
  }
}

export async function getUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (error) {
    console.error('Get user error:', error);
    // Handle auth errors
    if (error instanceof Error) {
      handleAuthError(error);
    }
    return { user: null, error: error as Error };
  }
}

export async function updateProfile({ full_name, avatar_url, custom_image_avatar }: { full_name: string; avatar_url?: string | null; custom_image_avatar?: string | null }) {
  try {
    const updateData: { full_name: string; avatar_url?: string | null; custom_image_avatar?: string | null } = { full_name };
    
    // Only include avatar_url in the update if it's explicitly provided
    if (avatar_url !== undefined) {
      updateData.avatar_url = avatar_url;
    }
    
    // Only include custom_image_avatar in the update if it's explicitly provided
    if (custom_image_avatar !== undefined) {
      updateData.custom_image_avatar = custom_image_avatar;
    }
    
    const { data: { user }, error } = await supabase.auth.updateUser({
      data: updateData,
    });
    
    return { user, error };
  } catch (error) {
    console.error('Update profile error:', error);
    return { user: null, error: error as Error };
  }
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
    
    const { error } = await supabase.storage
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
    return { publicUrl: null, user: null, error: error as Error };
  }
}

export async function getProfileImageUrl(userId: string) {
  try {
    const fileName = `${userId}/profile`;
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);
    
    // Add cache-busting parameter
    const cacheBustedUrl = publicUrl ? `${publicUrl}?t=${Date.now()}` : publicUrl;
    
    return { publicUrl: cacheBustedUrl, error: null };
  } catch (error) {
    console.error('Error getting profile image URL:', error);
    return { publicUrl: null, error: error as Error };
  }
}

// Resume helper functions
export async function saveResume({ title, data, status }: { title: string; data: ResumeData; status: string }) {
  try {
    if (!supabase.auth.getUser()) {
      return { data: null, error: new Error('User not authenticated') };
    }
    
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { data: null, error: userError || new Error('User not found') };
    }

    const { data: savedResume, error } = await supabase
      .from('resumes')
      .insert([
        {
          user_id: user.user.id,
          title: title,
          data: data,
          status: status
        }
      ])
      .select();

    return { data: savedResume, error };
  } catch (error) {
    console.error('Save resume error:', error);
    return { data: null, error: error as Error };
  }
}

export async function getResumes(userId: string) {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    return { data: data as Resume[] | null, error };
  } catch (error) {
    console.error('Get resumes error:', error);
    return { data: null, error: error as Error };
  }
}

export async function updateResume(resumeId: number, resumeData: ResumeData) {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .update({
        title: `${resumeData.personalInfo?.firstName} ${resumeData.personalInfo?.lastName} Resume`,
        data: resumeData,
        // Note: updated_at will be automatically set by the database due to DEFAULT NOW()
      })
      .eq('id', resumeId)
      .select();

    return { data, error };
  } catch (error) {
    console.error('Update resume error:', error);
    return { data: null, error: error as Error };
  }
}

export async function deleteResume(resumeId: number) {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId);

    return { data, error };
  } catch (error) {
    console.error('Delete resume error:', error);
    return { data: null, error: error as Error };
  }
}