import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { supabaseServer, isSupabaseConfigured, handleSupabaseError } from '../utils/supabaseServer';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

// Verify JWT and extract user info
const verifyAuth = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as {
    userId: string;
    email: string;
    role: string;
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const user = verifyAuth(req);

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      });
    }

    // GET - Fetch reviews for a module
    if (req.method === 'GET') {
      const { moduleId, userId } = req.query;

      if (!moduleId && !userId) {
        return res.status(400).json({
          success: false,
          error: 'moduleId or userId is required'
        });
      }

      try {
        let query = supabaseServer!
          .from('module_reviews')
          .select(`
            *,
            user:users(id, name, email, avatar),
            module:marketplace_modules(id, name, icon)
          `)
          .eq('is_public', true);

        if (moduleId) {
          query = query.eq('module_id', moduleId as string);
        }

        if (userId) {
          query = query.eq('user_id', userId as string);
        }

        query = query.order('created_at', { ascending: false });

        const { data: reviews, error } = await query;

        if (error) throw error;

        console.log(`✅ Fetched ${reviews?.length || 0} reviews`);

        return res.status(200).json({
          success: true,
          data: reviews || []
        });
      } catch (error) {
        const errorDetails = handleSupabaseError(error);
        return res.status(errorDetails.status).json({
          success: false,
          error: errorDetails.message
        });
      }
    }

    // POST - Create a review
    if (req.method === 'POST') {
      const { moduleId, rating, title, comment } = req.body;

      if (!moduleId || !rating) {
        return res.status(400).json({
          success: false,
          error: 'moduleId and rating are required'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
      }

      try {
        // Check if user has already reviewed this module
        const { data: existing } = await supabaseServer!
          .from('module_reviews')
          .select('id')
          .eq('module_id', moduleId)
          .eq('user_id', user.userId)
          .single();

        if (existing) {
          return res.status(409).json({
            success: false,
            error: 'You have already reviewed this module'
          });
        }

        // Check if user has installed the module (verified purchase)
        const { data: installation } = await supabaseServer!
          .from('user_module_installations')
          .select('id')
          .eq('user_id', user.userId)
          .eq('module_id', moduleId)
          .single();

        const isVerifiedPurchase = !!installation;

        // Create review
        const { data: review, error } = await supabaseServer!
          .from('module_reviews')
          .insert({
            module_id: moduleId,
            user_id: user.userId,
            rating,
            title: title || null,
            comment: comment || null,
            is_verified_purchase: isVerifiedPurchase,
            is_public: true
          })
          .select()
          .single();

        if (error) throw error;

        console.log(`✅ Review created by ${user.email}`);

        return res.status(201).json({
          success: true,
          data: review,
          message: 'Review created successfully'
        });
      } catch (error) {
        const errorDetails = handleSupabaseError(error);
        return res.status(errorDetails.status).json({
          success: false,
          error: errorDetails.message
        });
      }
    }

    // PATCH - Update a review
    if (req.method === 'PATCH') {
      const { reviewId } = req.query;
      const { rating, title, comment } = req.body;

      if (!reviewId) {
        return res.status(400).json({
          success: false,
          error: 'reviewId is required'
        });
      }

      try {
        // Verify ownership
        const { data: existing, error: fetchError } = await supabaseServer!
          .from('module_reviews')
          .select('user_id')
          .eq('id', reviewId as string)
          .single();

        if (fetchError || !existing) {
          return res.status(404).json({
            success: false,
            error: 'Review not found'
          });
        }

        if (existing.user_id !== user.userId) {
          return res.status(403).json({
            success: false,
            error: 'You can only edit your own reviews'
          });
        }

        // Update review
        const updates: any = { updated_at: new Date().toISOString() };
        if (rating !== undefined) updates.rating = rating;
        if (title !== undefined) updates.title = title;
        if (comment !== undefined) updates.comment = comment;

        const { data: review, error } = await supabaseServer!
          .from('module_reviews')
          .update(updates)
          .eq('id', reviewId as string)
          .select()
          .single();

        if (error) throw error;

        console.log(`✅ Review updated by ${user.email}`);

        return res.status(200).json({
          success: true,
          data: review,
          message: 'Review updated successfully'
        });
      } catch (error) {
        const errorDetails = handleSupabaseError(error);
        return res.status(errorDetails.status).json({
          success: false,
          error: errorDetails.message
        });
      }
    }

    // DELETE - Delete a review
    if (req.method === 'DELETE') {
      const { reviewId } = req.query;

      if (!reviewId) {
        return res.status(400).json({
          success: false,
          error: 'reviewId is required'
        });
      }

      try {
        // Verify ownership
        const { data: existing, error: fetchError } = await supabaseServer!
          .from('module_reviews')
          .select('user_id')
          .eq('id', reviewId as string)
          .single();

        if (fetchError || !existing) {
          return res.status(404).json({
            success: false,
            error: 'Review not found'
          });
        }

        if (existing.user_id !== user.userId && user.role !== 'super_admin') {
          return res.status(403).json({
            success: false,
            error: 'You can only delete your own reviews'
          });
        }

        // Delete review
        const { error } = await supabaseServer!
          .from('module_reviews')
          .delete()
          .eq('id', reviewId as string);

        if (error) throw error;

        console.log(`✅ Review deleted by ${user.email}`);

        return res.status(200).json({
          success: true,
          message: 'Review deleted successfully'
        });
      } catch (error) {
        const errorDetails = handleSupabaseError(error);
        return res.status(errorDetails.status).json({
          success: false,
          error: errorDetails.message
        });
      }
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('❌ Reviews API error:', error);

    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
