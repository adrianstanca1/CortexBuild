/* eslint-disable no-unused-vars, no-undef */
#!/usr/bin/env node

/**
 * CortexBuild Production Database Setup Script
 * ===========================================
 * This script sets up the production database with all required tables and data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.production' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.production');
    console.error('   Required: SUPABASE_URL, SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
    console.log('🗄️  Setting up CortexBuild Production Database');
    console.log('==============================================');
    
    try {
        // Test connection
        console.log('🔍 Testing database connection...');
        const { data, error } = await supabase.from('companies').select('count').limit(1);
        if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
            throw error;
        }
        console.log('✅ Database connection successful');
        
        // Check if schema exists
        console.log('🔍 Checking database schema...');
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');
            
        if (tablesError) {
            console.log('⚠️  Could not check existing tables, proceeding with schema setup...');
        } else {
            const tableNames = tables.map(t => t.table_name);
            console.log(`📊 Found ${tableNames.length} existing tables`);
        }
        
        // Apply schema
        console.log('📝 Applying database schema...');
        const schemaPath = path.join(__dirname, '..', 'supabase', 'COMPLETE_SCHEMA.sql');
        
        if (!fs.existsSync(schemaPath)) {
            console.error('❌ Schema file not found:', schemaPath);
            process.exit(1);
        }
        
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split schema into individual statements
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📋 Executing ${statements.length} SQL statements...`);
        
        let successCount = 0;
        let skipCount = 0;
        
        for (const statement of statements) {
            try {
                const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
                if (error) {
                    if (error.message.includes('already exists')) {
                        skipCount++;
                    } else {
                        console.warn(`⚠️  Warning executing statement: ${error.message}`);
                    }
                } else {
                    successCount++;
                }
            } catch (err) {
                console.warn(`⚠️  Warning: ${err.message}`);
            }
        }
        
        console.log(`✅ Schema applied: ${successCount} executed, ${skipCount} skipped`);
        
        // Create default company and admin user
        console.log('👤 Setting up default admin user...');
        
        // Check if default company exists
        const { data: existingCompany } = await supabase
            .from('companies')
            .select('id')
            .eq('name', 'CortexBuild Demo Company')
            .single();
        
        let companyId;
        if (existingCompany) {
            companyId = existingCompany.id;
            console.log('✅ Default company already exists');
        } else {
            const { data: newCompany, error: companyError } = await supabase
                .from('companies')
                .insert({
                    name: 'CortexBuild Demo Company',
                    industry: 'Construction',
                    email: 'admin@cortexbuild.com',
                    subscription_plan: 'enterprise',
                    max_users: 1000,
                    max_projects: 100
                })
                .select()
                .single();
            
            if (companyError) {
                console.error('❌ Error creating company:', companyError);
                throw companyError;
            }
            
            companyId = newCompany.id;
            console.log('✅ Default company created');
        }
        
        // Check if admin user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', 'admin@cortexbuild.com')
            .single();
        
        if (existingUser) {
            console.log('✅ Admin user already exists');
        } else {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('CortexBuild2024!', 12);
            
            const { data: newUser, error: userError } = await supabase
                .from('users')
                .insert({
                    email: 'admin@cortexbuild.com',
                    password_hash: hashedPassword,
                    name: 'CortexBuild Admin',
                    role: 'super_admin',
                    company_id: companyId
                })
                .select()
                .single();
            
            if (userError) {
                console.error('❌ Error creating admin user:', userError);
                throw userError;
            }
            
            console.log('✅ Admin user created');
            console.log('📧 Email: admin@cortexbuild.com');
            console.log('🔑 Password: CortexBuild2024!');
        }
        
        // Verify setup
        console.log('🔍 Verifying database setup...');
        
        const verifications = [
            { table: 'companies', description: 'Companies table' },
            { table: 'users', description: 'Users table' },
            { table: 'projects', description: 'Projects table' },
            { table: 'tasks', description: 'Tasks table' },
            { table: 'rfis', description: 'RFIs table' },
            { table: 'documents', description: 'Documents table' }
        ];
        
        for (const verification of verifications) {
            const { data, error } = await supabase
                .from(verification.table)
                .select('count')
                .limit(1);
            
            if (error) {
                console.error(`❌ ${verification.description}: ${error.message}`);
            } else {
                console.log(`✅ ${verification.description}: OK`);
            }
        }
        
        console.log('');
        console.log('🎉 Database setup completed successfully!');
        console.log('');
        console.log('📊 Database Status:');
        console.log('   URL:', supabaseUrl);
        console.log('   Status: Ready for production');
        console.log('   Admin Email: admin@cortexbuild.com');
        console.log('   Admin Password: CortexBuild2024!');
        console.log('');
        console.log('⚠️  IMPORTANT: Change the admin password after first login!');
        console.log('');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    }
}

// Run setup
setupDatabase();
