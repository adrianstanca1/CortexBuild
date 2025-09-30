"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const connection_1 = require("./connection");
const companies = [
    {
        id: 'comp-1',
        name: 'BuildCorp Construction',
        type: 'general_contractor',
        email: 'info@buildcorp.com',
        phone: '+1-555-0101',
        address: '123 Construction Ave, Builder City, BC 12345',
        website: 'https://buildcorp.com',
        is_active: true
    },
    {
        id: 'comp-2',
        name: 'Elite Electrical',
        type: 'subcontractor',
        email: 'contact@eliteelectrical.com',
        phone: '+1-555-0102',
        address: '456 Electric St, Power Town, PT 67890',
        website: 'https://eliteelectrical.com',
        is_active: true
    },
    {
        id: 'comp-3',
        name: 'Metro Properties',
        type: 'client',
        email: 'projects@metroproperties.com',
        phone: '+1-555-0103',
        address: '789 Property Blvd, Real Estate City, RE 11111',
        website: 'https://metroproperties.com',
        is_active: true
    },
    {
        id: 'comp-4',
        name: 'Superior Supplies',
        type: 'supplier',
        email: 'sales@superiorsupplies.com',
        phone: '+1-555-0104',
        address: '321 Supply Chain Dr, Material City, MC 22222',
        website: 'https://superiorsupplies.com',
        is_active: true
    }
];
const users = [
    {
        id: 'user-1',
        email: 'admin@buildcorp.com',
        first_name: 'John',
        last_name: 'Builder',
        role: 'admin',
        company_id: 'comp-1',
        phone: '+1-555-1001',
        is_active: true
    },
    {
        id: 'user-2',
        email: 'manager@buildcorp.com',
        first_name: 'Sarah',
        last_name: 'Manager',
        role: 'manager',
        company_id: 'comp-1',
        phone: '+1-555-1002',
        is_active: true
    },
    {
        id: 'user-3',
        email: 'worker@buildcorp.com',
        first_name: 'Mike',
        last_name: 'Worker',
        role: 'worker',
        company_id: 'comp-1',
        phone: '+1-555-1003',
        is_active: true
    },
    {
        id: 'user-4',
        email: 'client@metroproperties.com',
        first_name: 'Lisa',
        last_name: 'Property',
        role: 'client',
        company_id: 'comp-3',
        phone: '+1-555-1004',
        is_active: true
    }
];
const projects = [
    {
        id: 'proj-1',
        name: 'Downtown Office Complex',
        description: 'Modern 15-story office building with retail space',
        status: 'active',
        priority: 'high',
        start_date: '2024-01-15',
        end_date: '2024-12-31',
        budget: 2500000,
        spent: 850000,
        progress: 35,
        company_id: 'comp-1',
        manager_id: 'user-2',
        client_id: 'comp-3',
        address: '100 Downtown Plaza, Metro City, MC 33333'
    },
    {
        id: 'proj-2',
        name: 'Residential Subdivision',
        description: '50-unit residential development with amenities',
        status: 'planning',
        priority: 'medium',
        start_date: '2024-03-01',
        end_date: '2025-06-30',
        budget: 5000000,
        spent: 125000,
        progress: 5,
        company_id: 'comp-1',
        manager_id: 'user-2',
        client_id: 'comp-3',
        address: '200 Suburban Way, Residential City, RC 44444'
    },
    {
        id: 'proj-3',
        name: 'Shopping Center Renovation',
        description: 'Complete renovation of existing shopping center',
        status: 'completed',
        priority: 'low',
        start_date: '2023-06-01',
        end_date: '2023-11-30',
        budget: 750000,
        spent: 720000,
        progress: 100,
        company_id: 'comp-1',
        manager_id: 'user-2',
        client_id: 'comp-3',
        address: '300 Shopping Blvd, Retail City, RC 55555'
    }
];
const invoices = [
    {
        id: 'inv-1',
        invoice_number: 'INV-2024-001',
        project_id: 'proj-1',
        client_id: 'comp-3',
        company_id: 'comp-1',
        status: 'sent',
        issue_date: '2024-01-31',
        due_date: '2024-02-29',
        subtotal: 125000,
        tax_amount: 12500,
        total_amount: 137500,
        paid_amount: 0,
        notes: 'First milestone payment for foundation work'
    },
    {
        id: 'inv-2',
        invoice_number: 'INV-2024-002',
        project_id: 'proj-1',
        client_id: 'comp-3',
        company_id: 'comp-1',
        status: 'paid',
        issue_date: '2024-02-28',
        due_date: '2024-03-31',
        subtotal: 200000,
        tax_amount: 20000,
        total_amount: 220000,
        paid_amount: 220000,
        notes: 'Second milestone payment for structural work'
    },
    {
        id: 'inv-3',
        invoice_number: 'INV-2024-003',
        project_id: 'proj-2',
        client_id: 'comp-3',
        company_id: 'comp-1',
        status: 'draft',
        issue_date: '2024-03-15',
        due_date: '2024-04-15',
        subtotal: 75000,
        tax_amount: 7500,
        total_amount: 82500,
        paid_amount: 0,
        notes: 'Planning and design phase payment'
    }
];
const expenses = [
    {
        id: 'exp-1',
        project_id: 'proj-1',
        company_id: 'comp-1',
        category: 'materials',
        description: 'Concrete and rebar for foundation',
        amount: 45000,
        date: '2024-01-20',
        vendor: 'Superior Supplies',
        is_billable: true,
        created_by: 'user-2'
    },
    {
        id: 'exp-2',
        project_id: 'proj-1',
        company_id: 'comp-1',
        category: 'labor',
        description: 'Foundation crew wages - Week 3',
        amount: 28000,
        date: '2024-01-25',
        vendor: 'BuildCorp Payroll',
        is_billable: true,
        created_by: 'user-2'
    },
    {
        id: 'exp-3',
        project_id: 'proj-1',
        company_id: 'comp-1',
        category: 'equipment',
        description: 'Crane rental - 2 weeks',
        amount: 15000,
        date: '2024-02-01',
        vendor: 'Heavy Equipment Rentals',
        is_billable: true,
        created_by: 'user-2'
    },
    {
        id: 'exp-4',
        project_id: undefined,
        company_id: 'comp-1',
        category: 'utilities',
        description: 'Office electricity bill',
        amount: 850,
        date: '2024-02-15',
        vendor: 'Metro Electric',
        is_billable: false,
        created_by: 'user-1'
    }
];
async function seedDatabase() {
    console.log('🌱 Seeding database with sample data...');
    const db = (0, connection_1.getDatabase)();
    try {
        await db.transaction(async () => {
            console.log('🧹 Clearing existing data...');
            await db.run('DELETE FROM invoice_items');
            await db.run('DELETE FROM invoices');
            await db.run('DELETE FROM expenses');
            await db.run('DELETE FROM documents');
            await db.run('DELETE FROM tasks');
            await db.run('DELETE FROM projects');
            await db.run('DELETE FROM users');
            await db.run('DELETE FROM companies');
            console.log('🏢 Inserting companies...');
            for (const company of companies) {
                await db.run(`
          INSERT INTO companies (id, name, type, email, phone, address, website, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                    company.id, company.name, company.type, company.email,
                    company.phone, company.address, company.website, company.is_active
                ]);
            }
            console.log('👥 Inserting users...');
            const defaultPassword = await bcryptjs_1.default.hash('password123', 10);
            for (const user of users) {
                await db.run(`
          INSERT INTO users (id, email, password_hash, first_name, last_name, role, company_id, phone, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                    user.id, user.email, defaultPassword, user.first_name, user.last_name,
                    user.role, user.company_id, user.phone, user.is_active
                ]);
            }
            console.log('🏗️ Inserting projects...');
            for (const project of projects) {
                await db.run(`
          INSERT INTO projects (id, name, description, status, priority, start_date, end_date, budget, spent, progress, company_id, manager_id, client_id, address)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                    project.id, project.name, project.description, project.status, project.priority,
                    project.start_date, project.end_date, project.budget, project.spent, project.progress,
                    project.company_id, project.manager_id, project.client_id, project.address
                ]);
            }
            console.log('📄 Inserting invoices...');
            for (const invoice of invoices) {
                await db.run(`
          INSERT INTO invoices (id, invoice_number, project_id, client_id, company_id, status, issue_date, due_date, subtotal, tax_amount, total_amount, paid_amount, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                    invoice.id, invoice.invoice_number, invoice.project_id, invoice.client_id, invoice.company_id,
                    invoice.status, invoice.issue_date, invoice.due_date, invoice.subtotal, invoice.tax_amount,
                    invoice.total_amount, invoice.paid_amount, invoice.notes
                ]);
            }
            console.log('📋 Inserting invoice items...');
            const invoiceItems = [
                { id: 'item-1', invoice_id: 'inv-1', description: 'Foundation excavation', quantity: 1, unit_price: 50000, total_price: 50000 },
                { id: 'item-2', invoice_id: 'inv-1', description: 'Concrete pouring', quantity: 1, unit_price: 75000, total_price: 75000 },
                { id: 'item-3', invoice_id: 'inv-2', description: 'Steel frame installation', quantity: 1, unit_price: 150000, total_price: 150000 },
                { id: 'item-4', invoice_id: 'inv-2', description: 'Structural engineering', quantity: 1, unit_price: 50000, total_price: 50000 },
                { id: 'item-5', invoice_id: 'inv-3', description: 'Architectural design', quantity: 1, unit_price: 45000, total_price: 45000 },
                { id: 'item-6', invoice_id: 'inv-3', description: 'Site planning', quantity: 1, unit_price: 30000, total_price: 30000 }
            ];
            for (const item of invoiceItems) {
                await db.run(`
          INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [item.id, item.invoice_id, item.description, item.quantity, item.unit_price, item.total_price]);
            }
            console.log('💰 Inserting expenses...');
            for (const expense of expenses) {
                await db.run(`
          INSERT INTO expenses (id, project_id, company_id, category, description, amount, date, vendor, is_billable, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                    expense.id, expense.project_id, expense.company_id, expense.category, expense.description,
                    expense.amount, expense.date, expense.vendor, expense.is_billable, expense.created_by
                ]);
            }
        });
        console.log('✅ Database seeded successfully!');
        const stats = await db.getStats();
        console.log(`📊 Database summary: ${stats.tables} tables, ${stats.totalRows} total rows`);
        console.log('\n🔑 Default login credentials:');
        console.log('  Admin: admin@buildcorp.com / password123');
        console.log('  Manager: manager@buildcorp.com / password123');
        console.log('  Worker: worker@buildcorp.com / password123');
        console.log('  Client: client@metroproperties.com / password123');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}
if (require.main === module) {
    seedDatabase()
        .then(() => {
        console.log('🎉 Seeding process completed!');
        process.exit(0);
    })
        .catch((error) => {
        console.error('💥 Seeding process failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=seed.js.map