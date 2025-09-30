import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Enhanced Invoices API endpoint
 * GET /api/invoices - List invoices with filtering and pagination
 * POST /api/invoices - Create new invoice
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      return await handleGetInvoices(req, res);
    } else if (req.method === 'POST') {
      return await handleCreateInvoice(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Invoices API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

async function handleGetInvoices(req: VercelRequest, res: VercelResponse) {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    client_id,
    project_id,
    date_from,
    date_to,
    amount_min,
    amount_max,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = req.query;

  // Enhanced mock invoices data
  const mockInvoices = [
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2024-001',
      projectId: 'proj-001',
      projectName: 'Residential Complex Phase 1',
      clientId: 'client-001',
      clientName: 'Metropolitan Housing Ltd',
      clientEmail: 'sarah.johnson@methousing.co.uk',
      issueDate: '2024-08-15',
      dueDate: '2024-09-15',
      status: 'SENT',
      lineItems: [
        { description: 'Foundation Work', quantity: 1, rate: 125000, amount: 125000 },
        { description: 'Framing Materials', quantity: 50, rate: 2500, amount: 125000 },
        { description: 'Labor - Week 16-20', quantity: 160, rate: 75, amount: 12000 }
      ],
      subtotal: 262000,
      taxRate: 0.20,
      taxAmount: 52400,
      total: 314400,
      amountPaid: 0,
      balance: 314400,
      paymentTerms: 'Net 30',
      notes: 'Phase 1 completion milestone invoice',
      createdAt: '2024-08-15T09:00:00Z',
      updatedAt: '2024-08-15T09:00:00Z'
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-2024-002',
      projectId: 'proj-002',
      projectName: 'Office Tower Renovation',
      clientId: 'client-002',
      clientName: 'Corporate Spaces Ltd',
      clientEmail: 'david.wilson@corpspaces.co.uk',
      issueDate: '2024-09-01',
      dueDate: '2024-10-01',
      status: 'DRAFT',
      lineItems: [
        { description: 'Design & Planning', quantity: 1, rate: 85000, amount: 85000 },
        { description: 'Permit Applications', quantity: 1, rate: 15000, amount: 15000 }
      ],
      subtotal: 100000,
      taxRate: 0.20,
      taxAmount: 20000,
      total: 120000,
      amountPaid: 0,
      balance: 120000,
      paymentTerms: 'Net 30',
      notes: 'Initial planning phase invoice',
      createdAt: '2024-09-01T14:30:00Z',
      updatedAt: '2024-09-15T10:15:00Z'
    },
    {
      id: 'inv-003',
      invoiceNumber: 'INV-2024-003',
      projectId: 'proj-003',
      projectName: 'Bridge Repair Project',
      clientId: 'client-003',
      clientName: 'London Borough Council',
      clientEmail: 'infrastructure@greenwich.gov.uk',
      issueDate: '2024-07-30',
      dueDate: '2024-08-30',
      status: 'PAID',
      lineItems: [
        { description: 'Structural Assessment', quantity: 1, rate: 45000, amount: 45000 },
        { description: 'Repair Materials', quantity: 1, rate: 180000, amount: 180000 },
        { description: 'Specialized Labor', quantity: 320, rate: 95, amount: 30400 }
      ],
      subtotal: 255400,
      taxRate: 0.20,
      taxAmount: 51080,
      total: 306480,
      amountPaid: 306480,
      balance: 0,
      paymentTerms: 'Net 30',
      notes: 'Final completion invoice',
      paymentDate: '2024-08-25',
      paymentMethod: 'Bank Transfer',
      createdAt: '2024-07-30T16:45:00Z',
      updatedAt: '2024-08-25T11:30:00Z'
    },
    {
      id: 'inv-004',
      invoiceNumber: 'INV-2024-004',
      projectId: 'proj-001',
      projectName: 'Residential Complex Phase 1',
      clientId: 'client-001',
      clientName: 'Metropolitan Housing Ltd',
      clientEmail: 'sarah.johnson@methousing.co.uk',
      issueDate: '2024-06-15',
      dueDate: '2024-07-15',
      status: 'OVERDUE',
      lineItems: [
        { description: 'Site Preparation', quantity: 1, rate: 85000, amount: 85000 },
        { description: 'Excavation Work', quantity: 1200, rate: 45, amount: 54000 }
      ],
      subtotal: 139000,
      taxRate: 0.20,
      taxAmount: 27800,
      total: 166800,
      amountPaid: 0,
      balance: 166800,
      paymentTerms: 'Net 30',
      notes: 'Initial groundwork invoice',
      daysOverdue: 46,
      createdAt: '2024-06-15T10:00:00Z',
      updatedAt: '2024-06-15T10:00:00Z'
    }
  ];

  // Apply filters
  let filteredInvoices = mockInvoices;

  if (status) {
    filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
  }

  if (client_id) {
    filteredInvoices = filteredInvoices.filter(inv => inv.clientId === client_id);
  }

  if (project_id) {
    filteredInvoices = filteredInvoices.filter(inv => inv.projectId === project_id);
  }

  if (amount_min) {
    filteredInvoices = filteredInvoices.filter(inv => inv.total >= parseInt(amount_min.toString()));
  }

  if (amount_max) {
    filteredInvoices = filteredInvoices.filter(inv => inv.total <= parseInt(amount_max.toString()));
  }

  // Apply sorting
  filteredInvoices.sort((a, b) => {
    let aValue = a[sortBy as keyof typeof a];
    let bValue = b[sortBy as keyof typeof b];
    
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    if (sortOrder === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    } else {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
  });

  // Apply pagination
  const pageNum = parseInt(page.toString());
  const pageSize = parseInt(limit.toString());
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  // Calculate summary statistics
  const totalInvoices = filteredInvoices.length;
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = filteredInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalOutstanding = filteredInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  const statusCounts = filteredInvoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const overdueCount = filteredInvoices.filter(inv => inv.status === 'OVERDUE').length;
  const overdueAmount = filteredInvoices
    .filter(inv => inv.status === 'OVERDUE')
    .reduce((sum, inv) => sum + inv.balance, 0);

  const response = {
    success: true,
    data: {
      invoices: paginatedInvoices,
      pagination: {
        current_page: pageNum,
        per_page: pageSize,
        total: totalInvoices,
        total_pages: Math.ceil(totalInvoices / pageSize),
        has_next: endIndex < totalInvoices,
        has_prev: pageNum > 1
      },
      summary: {
        total_invoices: totalInvoices,
        total_amount: totalAmount,
        total_paid: totalPaid,
        total_outstanding: totalOutstanding,
        collection_rate: totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0,
        status_counts: statusCounts,
        overdue: {
          count: overdueCount,
          amount: overdueAmount
        }
      }
    },
    timestamp: new Date().toISOString(),
    api_version: '2.0'
  };

  return res.status(200).json(response);
}

async function handleCreateInvoice(req: VercelRequest, res: VercelResponse) {
  const {
    projectId,
    clientId,
    lineItems,
    issueDate,
    dueDate,
    paymentTerms = 'Net 30',
    notes = '',
    taxRate = 0.20
  } = req.body;

  // Validate required fields
  if (!projectId || !clientId || !lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      message: 'projectId, clientId, and lineItems are required'
    });
  }

  // Calculate totals
  const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  // Generate invoice number
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

  const newInvoice = {
    id: `inv-${Date.now()}`,
    invoiceNumber,
    projectId,
    clientId,
    issueDate: issueDate || new Date().toISOString().split('T')[0],
    dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'DRAFT',
    lineItems,
    subtotal,
    taxRate,
    taxAmount,
    total,
    amountPaid: 0,
    balance: total,
    paymentTerms,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return res.status(201).json({
    success: true,
    data: newInvoice,
    message: 'Invoice created successfully',
    timestamp: new Date().toISOString()
  });
}