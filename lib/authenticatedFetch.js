import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Performs an authenticated fetch request with Supabase session token
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Response>} - Fetch response
 */
export async function authenticatedFetch(url, options = {}) {
  try {
    // Get the current session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      throw new Error('User is not authenticated');
    }

    // Add Authorization header with the access token
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };

    // Perform the fetch with authentication
    return fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
}
