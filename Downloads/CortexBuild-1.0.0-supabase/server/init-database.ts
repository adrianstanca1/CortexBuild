// CortexBuild Platform - Database Initialization
// Version: 1.0.0 GOLDEN
// Last Updated: 2025-10-08

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'cortexbuild.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

export async function initializeDatabase(): Promise<Database.Database> {
  console.log('🔧 Initializing CortexBuild database...');
  
  // Create database connection
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  
  // Read and execute schema
  console.log('📋 Creating database schema...');
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');

  // Split schema into individual statements and execute them
  const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        db.exec(statement + ';');
      } catch (error) {
        console.error('Error executing statement:', statement.trim());
        console.error('Error:', error);
        throw error;
      }
    }
  }

  console.log('✅ Database schema created successfully!');
  
  // Ensure sessions table exists for auth module
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);');

  return db;
}

export async function seedDatabase(db: Database.Database): Promise<void> {
  console.log('🌱 Seeding database with initial data...');
  
  try {
    // Check if data already exists
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    
    if (userCount.count > 0) {
      console.log('⚠️  Database already contains data. Skipping seed.');
      return;
    }
    
    // Seed Companies
    console.log('  → Creating companies...');
    const insertCompany = db.prepare(`
      INSERT INTO companies (name, industry, size, address, city, state, zip_code, country, phone, website)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const companies = [
      ['CortexBuild Demo Corp', 'Construction', '51-200', '123 Main St', 'San Francisco', 'CA', '94102', 'US', '415-555-0100', 'https://cortexbuild.com'],
      ['BuildTech Solutions', 'Construction', '11-50', '456 Oak Ave', 'Austin', 'TX', '78701', 'US', '512-555-0200', 'https://buildtech.com'],
      ['Premier Builders Inc', 'Construction', '201-500', '789 Pine Rd', 'New York', 'NY', '10001', 'US', '212-555-0300', 'https://premierbuilders.com']
    ];
    
    companies.forEach(company => insertCompany.run(...company));
    
    // Seed Users
    console.log('  → Creating users...');
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const insertUser = db.prepare(`
      INSERT INTO users (email, password, first_name, last_name, phone, role, company_id, is_active, email_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const users = [
      ['admin@cortexbuild.com', hashedPassword, 'Admin', 'User', '415-555-0001', 'admin', 1, 1, 1],
      ['john.doe@cortexbuild.com', hashedPassword, 'John', 'Doe', '415-555-0002', 'manager', 1, 1, 1],
      ['jane.smith@cortexbuild.com', hashedPassword, 'Jane', 'Smith', '415-555-0003', 'user', 1, 1, 1],
      ['developer@cortexbuild.com', hashedPassword, 'Dev', 'User', '415-555-0004', 'developer', 1, 1, 1],
      ['bob.wilson@buildtech.com', hashedPassword, 'Bob', 'Wilson', '512-555-0001', 'manager', 2, 1, 1]
    ];
    
    users.forEach(user => insertUser.run(...user));
    
    // Seed Clients
    console.log('  → Creating clients...');
    const insertClient = db.prepare(`
      INSERT INTO clients (company_id, name, contact_name, email, phone, address, city, state, zip_code, payment_terms, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const clients = [
      [1, 'Acme Corporation', 'Alice Johnson', 'alice@acme.com', '415-555-1001', '100 Market St', 'San Francisco', 'CA', '94103', 30, 1],
      [1, 'TechStart Inc', 'Tom Brown', 'tom@techstart.com', '415-555-1002', '200 Mission St', 'San Francisco', 'CA', '94105', 15, 1],
      [1, 'Global Enterprises', 'Sarah Davis', 'sarah@global.com', '415-555-1003', '300 Howard St', 'San Francisco', 'CA', '94107', 45, 1],
      [2, 'Austin Properties', 'Mike Taylor', 'mike@austinprop.com', '512-555-1001', '400 Congress Ave', 'Austin', 'TX', '78701', 30, 1]
    ];
    
    clients.forEach(client => insertClient.run(...client));
    
    // Seed Projects
    console.log('  → Creating projects...');
    const insertProject = db.prepare(`
      INSERT INTO projects (company_id, name, description, project_number, status, priority, start_date, end_date, budget, actual_cost, address, city, state, zip_code, client_id, project_manager_id, progress)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const projects = [
      [1, 'Downtown Office Complex', 'Modern 10-story office building with retail space', 'PRJ-2024-001', 'active', 'high', '2024-01-15', '2025-06-30', 5000000, 2500000, '500 Market St', 'San Francisco', 'CA', '94102', 1, 2, 45],
      [1, 'Residential Tower', 'Luxury 25-story residential tower with amenities', 'PRJ-2024-002', 'active', 'critical', '2024-03-01', '2025-12-31', 12000000, 4800000, '600 Mission St', 'San Francisco', 'CA', '94105', 2, 2, 30],
      [1, 'Shopping Center Renovation', 'Complete renovation of existing shopping center', 'PRJ-2024-003', 'planning', 'medium', '2024-06-01', '2025-03-31', 3000000, 500000, '700 Howard St', 'San Francisco', 'CA', '94107', 3, 2, 15],
      [2, 'Tech Campus Phase 1', 'New tech campus with multiple buildings', 'PRJ-2024-004', 'active', 'high', '2024-02-01', '2025-08-31', 8000000, 3200000, '800 Congress Ave', 'Austin', 'TX', '78701', 4, 5, 40]
    ];
    
    projects.forEach(project => insertProject.run(...project));
    
    // Seed Tasks
    console.log('  → Creating tasks...');
    const insertTask = db.prepare(`
      INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, due_date, estimated_hours, actual_hours, progress, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const tasks = [
      [1, 'Site Preparation', 'Clear and prepare construction site', 'completed', 'high', 3, '2024-02-01', 160, 155, 100, 2],
      [1, 'Foundation Work', 'Pour foundation and basement', 'completed', 'critical', 3, '2024-03-15', 320, 310, 100, 2],
      [1, 'Structural Steel', 'Install structural steel framework', 'in-progress', 'critical', 3, '2024-06-30', 480, 240, 50, 2],
      [1, 'Electrical Rough-in', 'Install electrical conduits and boxes', 'todo', 'high', 3, '2024-08-15', 240, 0, 0, 2],
      [2, 'Excavation', 'Excavate for foundation', 'completed', 'critical', 3, '2024-03-20', 200, 195, 100, 2],
      [2, 'Foundation', 'Pour foundation', 'in-progress', 'critical', 3, '2024-05-30', 400, 180, 45, 2],
      [3, 'Design Review', 'Review and approve renovation designs', 'in-progress', 'high', 2, '2024-06-15', 80, 40, 50, 2],
      [4, 'Permits', 'Obtain all necessary permits', 'completed', 'critical', 5, '2024-02-28', 120, 115, 100, 5]
    ];
    
    tasks.forEach(task => insertTask.run(...task));
    
    // Seed Milestones
    console.log('  → Creating milestones...');
    const insertMilestone = db.prepare(`
      INSERT INTO milestones (project_id, name, description, due_date, status, progress)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const milestones = [
      [1, 'Foundation Complete', 'Foundation and basement work completed', '2024-03-31', 'completed', 100],
      [1, 'Structure Complete', 'Structural steel framework completed', '2024-07-31', 'in-progress', 50],
      [1, 'Envelope Complete', 'Building envelope sealed', '2024-10-31', 'pending', 0],
      [2, 'Foundation Complete', 'Foundation work completed', '2024-06-30', 'in-progress', 45],
      [2, 'Halfway Point', 'Project 50% complete', '2024-12-31', 'pending', 0],
      [3, 'Design Approval', 'All designs approved', '2024-07-15', 'in-progress', 50],
      [4, 'Permits Obtained', 'All permits secured', '2024-03-15', 'completed', 100]
    ];
    
    milestones.forEach(milestone => insertMilestone.run(...milestone));
    
    // Seed Project Team
    console.log('  → Creating project teams...');
    const insertTeam = db.prepare(`
      INSERT INTO project_team (project_id, user_id, role, hourly_rate)
      VALUES (?, ?, ?, ?)
    `);
    
    const teams = [
      [1, 2, 'Project Manager', 125.00],
      [1, 3, 'Site Supervisor', 85.00],
      [2, 2, 'Project Manager', 125.00],
      [2, 3, 'Site Supervisor', 85.00],
      [3, 2, 'Project Manager', 125.00],
      [4, 5, 'Project Manager', 120.00]
    ];
    
    teams.forEach(team => insertTeam.run(...team));
    
    // Continue with more seed data...
    console.log('✅ Database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

export default { initializeDatabase, seedDatabase };
