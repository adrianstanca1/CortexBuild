export interface PlatformMetricsResponse {
  totalCompanies: number;
  totalUsers: number;
  totalProjects: number;
  activeUsers: number;
  tenants?: any[];
  source?: string;
  generatedAt?: string;
}

export interface ClientInsights {
  totalClients?: number;
  activeClients?: number;
  topClients?: any[];
  [key: string]: any;
}
