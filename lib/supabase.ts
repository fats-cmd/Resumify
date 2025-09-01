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

// Resume helper functions
export async function saveResume(userId: string, resumeData: ResumeData) {
  const { data, error } = await supabase
    .from('resumes')
    .insert([
      {
        user_id: userId,
        title: `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName} Resume`,
        data: resumeData,
        created_at: new Date(),
        updated_at: new Date(),
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
      updated_at: new Date(),
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