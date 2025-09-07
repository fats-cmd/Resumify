import { supabase } from '@/lib/supabase';

/**
 * Checks if the user has a valid session
 * @returns {Promise<boolean>} Whether the user has a valid session
 */
export async function checkAuthSession(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking auth session:', error);
      return false;
    }
    
    // Check if session exists and has not expired
    if (session && session.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      return session.expires_at > now;
    }
    
    return !!session;
  } catch (error) {
    console.error('Error checking auth session:', error);
    return false;
  }
}

/**
 * Handles authentication errors by checking if they're related to refresh tokens
 * @param error The error to handle
 * @returns {boolean} Whether the error was handled
 */
export function handleAuthError(error: Error): boolean {
  // Check if this is a refresh token error
  if (error.message.includes('Invalid Refresh Token') || 
      error.message.includes('Refresh Token Not Found') ||
      error.message.includes('invalid refresh token')) {
    
    console.warn('Refresh token error detected. Signing out user.');
    
    // Sign out the user to clear any invalid session data
    supabase.auth.signOut();
    
    // Return true to indicate the error was handled
    return true;
  }
  
  return false;
}

/**
 * Clears all local authentication data
 */
export async function clearAuthData(): Promise<void> {
  try {
    // Clear Supabase session
    await supabase.auth.signOut();
    
    // Clear any additional local storage data if needed
    // localStorage.removeItem('some-auth-key');
    
    console.log('Authentication data cleared successfully');
  } catch (error) {
    console.error('Error clearing authentication data:', error);
  }
}