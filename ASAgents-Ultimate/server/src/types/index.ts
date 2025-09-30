export interface Tenant {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  tenant_id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'owner' | 'admin' | 'manager' | 'analyst' | 'viewer';
  status: 'invited' | 'active' | 'suspended';
}

export interface AuthenticatedUser extends User {
  tenant_slug: string;
}

export interface DocumentRecord {
  id: number;
  tenant_id: number;
  owner_id: number;
  project_id: number | null;
  original_name: string;
  stored_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  checksum: string;
  uploaded_at: Date;
}
