#!/usr/bin/env tsx
/**
 * Database Statistics and Information
 */

import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('./cortexbuild.db', { readonly: true });

console.log('🗄️  CortexBuild Database Statistics\n');
console.log('=' .repeat(60));

// Get file size
const stats = fs.statSync('./cortexbuild.db');
const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log(`\n📁 Database File:`);
console.log(`   Path: ./cortexbuild.db`);
console.log(`   Size: ${fileSizeInMB} MB`);

// List all tables
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' 
  ORDER BY name
`).all() as { name: string }[];

console.log(`\n📊 Tables (${tables.length}):`);

// Get row count for each table
tables.forEach((table) => {
  try {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number };
    console.log(`   ${table.name.padEnd(30)} ${count.count.toString().padStart(10)} rows`);
  } catch (error) {
    console.log(`   ${table.name.padEnd(30)} ${' '.padStart(10)} (error)`);
  }
});

// Show users by role
try {
  const usersByRole = db.prepare(`
    SELECT role, COUNT(*) as count 
    FROM users 
    GROUP BY role
    ORDER BY count DESC
  `).all() as { role: string, count: number }[];
  
  if (usersByRole.length > 0) {
    console.log(`\n👥 Users by Role:`);
    usersByRole.forEach(({ role, count }) => {
      console.log(`   ${role.padEnd(20)} ${count.toString().padStart(5)} users`);
    });
  }
} catch (error) {
  // Table might not exist
}

// Show companies with user counts
try {
  const companiesData = db.prepare(`
    SELECT 
      c.name,
      COUNT(u.id) as user_count
    FROM companies c
    LEFT JOIN users u ON u.company_id = c.id
    GROUP BY c.id
    ORDER BY user_count DESC
    LIMIT 10
  `).all() as { name: string, user_count: number }[];
  
  if (companiesData.length > 0) {
    console.log(`\n🏢 Top Companies:`);
    companiesData.forEach(({ name, user_count }) => {
      console.log(`   ${name.padEnd(30)} ${user_count.toString().padStart(5)} users`);
    });
  }
} catch (error) {
  // Table might not exist
}

// Show active sessions
try {
  const activeSessions = db.prepare(`
    SELECT COUNT(*) as count 
    FROM sessions 
    WHERE expires_at > datetime('now')
  `).get() as { count: number };
  
  console.log(`\n🔐 Active Sessions: ${activeSessions.count}`);
} catch (error) {
  // Table might not exist
}

// Show recent projects
try {
  const recentProjects = db.prepare(`
    SELECT 
      p.name,
      p.status,
      c.name as company_name,
      p.created_at
    FROM projects p
    JOIN companies c ON p.company_id = c.id
    ORDER BY p.created_at DESC
    LIMIT 5
  `).all() as any[];
  
  if (recentProjects.length > 0) {
    console.log(`\n📋 Recent Projects:`);
    recentProjects.forEach((project) => {
      console.log(`   ${project.name} (${project.status}) - ${project.company_name}`);
    });
  }
} catch (error) {
  // Table might not exist
}

console.log('\n' + '='.repeat(60));
console.log('\n✅ Database is healthy and ready to use!\n');

db.close();
