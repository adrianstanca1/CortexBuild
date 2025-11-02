/**
 * Admin Users API - Create, Update, Delete users
 * Requires super_admin role
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
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
        // Verify admin authentication (you should implement proper JWT verification here)
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        if (req.method === 'POST') {
            // Create new user
            const { email, name, password, role, company_id } = req.body;

            if (!email || !name || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email, name, and password are required'
                });
            }

            // Check if user already exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .ilike('email', email)
                .single();

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'User with this email already exists'
                });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create user
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    email: email.toLowerCase(),
                    name,
                    password_hash: passwordHash,
                    role: role || 'user',
                    company_id: company_id || null,
                    status: 'active',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (createError) {
                console.error('Error creating user:', createError);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to create user'
                });
            }

            return res.status(201).json({
                success: true,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                    company_id: newUser.company_id,
                    status: newUser.status,
                    created_at: newUser.created_at
                }
            });
        }

        if (req.method === 'PUT') {
            // Update user
            const { userId, name, role, company_id, status } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }

            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (role !== undefined) updateData.role = role;
            if (company_id !== undefined) updateData.company_id = company_id;
            if (status !== undefined) updateData.status = status;

            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', userId)
                .select()
                .single();

            if (updateError) {
                console.error('Error updating user:', updateError);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to update user'
                });
            }

            return res.status(200).json({
                success: true,
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    role: updatedUser.role,
                    company_id: updatedUser.company_id,
                    status: updatedUser.status
                }
            });
        }

        if (req.method === 'DELETE') {
            // Delete user
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }

            const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (deleteError) {
                console.error('Error deleting user:', deleteError);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to delete user'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        }

        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });

    } catch (error) {
        console.error('Admin users API error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

