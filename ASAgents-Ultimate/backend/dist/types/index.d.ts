export interface User {
    id: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'manager' | 'worker' | 'client';
    company_id?: string;
    avatar_url?: string;
    phone?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface Company {
    id: string;
    name: string;
    type: 'general_contractor' | 'subcontractor' | 'client' | 'supplier';
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    logo_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface Project {
    id: string;
    name: string;
    description?: string;
    status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    start_date?: string;
    end_date?: string;
    budget?: number;
    spent?: number;
    progress: number;
    company_id: string;
    manager_id?: string;
    client_id?: string;
    address?: string;
    created_at: string;
    updated_at: string;
}
export interface Task {
    id: string;
    project_id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assigned_to?: string;
    due_date?: string;
    estimated_hours?: number;
    actual_hours?: number;
    created_at: string;
    updated_at: string;
}
export interface Invoice {
    id: string;
    invoice_number: string;
    project_id?: string;
    client_id: string;
    company_id: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    issue_date: string;
    due_date: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    paid_amount: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}
export interface InvoiceItem {
    id: string;
    invoice_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
}
export interface Expense {
    id: string;
    project_id?: string;
    company_id: string;
    category: 'materials' | 'labor' | 'equipment' | 'permits' | 'utilities' | 'other';
    description: string;
    amount: number;
    date: string;
    receipt_url?: string;
    vendor?: string;
    is_billable: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
}
export interface Document {
    id: string;
    project_id?: string;
    company_id: string;
    name: string;
    type: 'contract' | 'permit' | 'drawing' | 'photo' | 'report' | 'other';
    file_url: string;
    file_size: number;
    mime_type: string;
    uploaded_by: string;
    created_at: string;
    updated_at: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    user: Omit<User, 'password_hash'>;
    company?: Company;
    token: string;
    expires_in: number;
}
export interface CreateProjectRequest {
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    budget?: number;
    client_id?: string;
    address?: string;
}
export interface UpdateProjectRequest {
    name?: string;
    description?: string;
    status?: Project['status'];
    priority?: Project['priority'];
    start_date?: string;
    end_date?: string;
    budget?: number;
    progress?: number;
    client_id?: string;
    address?: string;
}
export interface CreateInvoiceRequest {
    project_id?: string;
    client_id: string;
    due_date: string;
    items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
    }>;
    notes?: string;
}
export interface UpdateInvoiceRequest {
    project_id?: string;
    client_id?: string;
    due_date?: string;
    status?: 'draft' | 'sent' | 'paid' | 'overdue';
    items?: Array<{
        description: string;
        quantity: number;
        unit_price: number;
    }>;
    notes?: string;
}
export interface CreateExpenseRequest {
    project_id?: string;
    category: Expense['category'];
    description: string;
    amount: number;
    date: string;
    vendor?: string;
    is_billable?: boolean;
}
export interface PaginationQuery {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
export interface ProjectsQuery extends PaginationQuery {
    status?: Project['status'];
    priority?: Project['priority'];
    client_id?: string;
    search?: string;
}
export interface InvoicesQuery extends PaginationQuery {
    status?: Invoice['status'];
    client_id?: string;
    project_id?: string;
    date_from?: string;
    date_to?: string;
}
export interface ExpensesQuery extends PaginationQuery {
    category?: Expense['category'];
    project_id?: string;
    date_from?: string;
    date_to?: string;
    is_billable?: boolean;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        pages?: number;
        response_time_ms?: number;
    };
}
export interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: number;
    user_id?: string;
    company_id?: string;
}
export interface HealthCheckResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    uptime: number;
    database: {
        status: 'connected' | 'disconnected';
        response_time?: number;
        tables?: number;
        total_rows?: number;
        size_bytes?: number;
    };
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    services: {
        api: boolean;
        websocket: boolean;
        file_storage: boolean;
    };
    environment?: string;
    node_version?: string;
}
//# sourceMappingURL=index.d.ts.map