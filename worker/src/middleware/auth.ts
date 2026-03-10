import { Context, Next } from 'hono';

// This is a placeholder for the actual authentication middleware
// In a real implementation, this would validate JWT tokens from Cloudflare Access
export async function authMiddleware(c: Context, next: Next) {
  // Get the authorization header
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      message: 'Unauthorized',
      status: 401,
    }, 401);
  }
  
  // Extract the token
  const token = authHeader.substring(7);
  
  try {
    // In a real implementation, this would validate the JWT token
    // For now, we'll just check if the token exists
    if (!token) {
      throw new Error('Invalid token');
    }
    
    // Set user information in the context
    c.set('user', {
      id: 'user-id',
      email: 'user@example.com',
      role: 'user',
    });
    
    // Continue to the next middleware or route handler
    await next();
  } catch (error) {
    return c.json({
      message: 'Unauthorized',
      status: 401,
    }, 401);
  }
}

// Admin middleware to check if the user has admin role
export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get('user');
  
  if (!user || user.role !== 'admin') {
    return c.json({
      message: 'Forbidden',
      status: 403,
    }, 403);
  }
  
  await next();
}
