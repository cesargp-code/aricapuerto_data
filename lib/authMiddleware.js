import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Middleware to verify user authentication via Supabase
 * @param {Object} req - Next.js request object
 * @returns {Promise<Object>} - { user, error }
 */
export async function verifyAuth(req) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null,
        error: { message: 'Missing or invalid authorization header', status: 401 }
      };
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        user: null,
        error: { message: 'Invalid or expired token', status: 401 }
      };
    }

    return { user, error: null };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      user: null,
      error: { message: 'Authentication failed', status: 401 }
    };
  }
}

/**
 * Wrapper to protect API routes with authentication
 * @param {Function} handler - The API route handler function
 * @returns {Function} - Wrapped handler with auth check
 */
export function withAuth(handler) {
  return async (req, res) => {
    const { user, error } = await verifyAuth(req);

    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    // Attach user to request object for use in handler
    req.user = user;

    // Call the original handler
    return handler(req, res);
  };
}
