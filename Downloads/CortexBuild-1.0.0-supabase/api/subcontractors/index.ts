import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let subcontractors = [
  {
    id: 'sub-1',
    company_id: 'company-1',
    name: 'Premier Steel Fabricators',
    contact_name: 'James Martinez',
    email: 'james@premiersteel.com',
    phone: '+1 (415) 555-3030',
    address: '300 Industrial Blvd',
    city: 'Oakland',
    state: 'CA',
    zip_code: '94607',
    trade: 'Structural Steel',
    license_number: 'CA-STEEL-12345',
    insurance_expiry: '2026-06-30',
    rating: 5,
    is_active: 1,
    is_certified: 1,
    total_projects: 12,
    total_contract_value: 8500000,
    performance_score: 96,
    on_time_completion: 94,
    safety_incidents: 0,
    notes: 'Excellent track record, preferred vendor for structural steel',
    specializations: ['structural steel', 'metal fabrication', 'welding'],
    certifications: ['AISC', 'AWS', 'OSHA-30'],
    created_at: '2023-05-15T00:00:00Z'
  },
  {
    id: 'sub-2',
    company_id: 'company-1',
    name: 'Precision Electrical Systems',
    contact_name: 'Sarah Chen',
    email: 'sarah@precisionelec.com',
    phone: '+1 (415) 555-4040',
    address: '450 Tech Drive',
    city: 'San Jose',
    state: 'CA',
    zip_code: '95110',
    trade: 'Electrical',
    license_number: 'CA-ELEC-67890',
    insurance_expiry: '2025-12-31',
    rating: 4,
    is_active: 1,
    is_certified: 1,
    total_projects: 8,
    total_contract_value: 4200000,
    performance_score: 88,
    on_time_completion: 87,
    safety_incidents: 1,
    notes: 'Reliable electrical contractor, experienced with high-rise buildings',
    specializations: ['commercial electrical', 'fire alarm', 'data cabling'],
    certifications: ['C-10 License', 'NFPA', 'NICET'],
    created_at: '2023-08-20T00:00:00Z'
  },
  {
    id: 'sub-3',
    company_id: 'company-1',
    name: 'Bay Area Concrete Solutions',
    contact_name: 'Michael Roberts',
    email: 'mike@bayareaconcrete.com',
    phone: '+1 (415) 555-5050',
    address: '600 Construction Way',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94124',
    trade: 'Concrete',
    license_number: 'CA-CONC-11223',
    insurance_expiry: '2025-09-30',
    rating: 5,
    is_active: 1,
    is_certified: 1,
    total_projects: 15,
    total_contract_value: 6800000,
    performance_score: 93,
    on_time_completion: 91,
    safety_incidents: 0,
    notes: 'Top-tier concrete contractor, excellent quality control',
    specializations: ['structural concrete', 'decorative concrete', 'shotcrete'],
    certifications: ['ACI', 'NRMCA', 'CSI'],
    created_at: '2023-03-10T00:00:00Z'
  }
];

const verifyAuth = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const user = verifyAuth(req);

    // GET - Fetch subcontractors with intelligent filtering
    if (req.method === 'GET') {
      const { company_id, trade, is_active, rating, search, insurance_expiring } = req.query;
      let filteredSubs = [...subcontractors];

      // Company filtering
      if (user.role !== 'super_admin') {
        filteredSubs = filteredSubs.filter(s => s.company_id === company_id);
      }

      if (company_id && user.role === 'super_admin') {
        filteredSubs = filteredSubs.filter(s => s.company_id === company_id);
      }

      if (trade) {
        filteredSubs = filteredSubs.filter(s => s.trade === trade);
      }

      if (is_active !== undefined) {
        filteredSubs = filteredSubs.filter(s => s.is_active === parseInt(is_active as string));
      }

      if (rating) {
        filteredSubs = filteredSubs.filter(s => s.rating >= parseInt(rating as string));
      }

      // Insurance expiring soon (within 60 days)
      if (insurance_expiring === 'true') {
        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
        filteredSubs = filteredSubs.filter(s =>
          new Date(s.insurance_expiry) <= sixtyDaysFromNow
        );
      }

      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredSubs = filteredSubs.filter(s =>
          s.name.toLowerCase().includes(searchLower) ||
          s.trade.toLowerCase().includes(searchLower) ||
          s.contact_name.toLowerCase().includes(searchLower) ||
          s.specializations.some(spec => spec.toLowerCase().includes(searchLower))
        );
      }

      // Calculate comprehensive statistics
      const summary = {
        total: filteredSubs.length,
        active: filteredSubs.filter(s => s.is_active).length,
        certified: filteredSubs.filter(s => s.is_certified).length,
        total_contract_value: filteredSubs.reduce((sum, s) => sum + s.total_contract_value, 0),
        avg_performance_score: Math.round(
          filteredSubs.reduce((sum, s) => sum + s.performance_score, 0) / filteredSubs.length || 0
        ),
        avg_on_time_completion: Math.round(
          filteredSubs.reduce((sum, s) => sum + s.on_time_completion, 0) / filteredSubs.length || 0
        ),
        total_safety_incidents: filteredSubs.reduce((sum, s) => sum + s.safety_incidents, 0),
        by_trade: filteredSubs.reduce((acc: any, s) => {
          acc[s.trade] = (acc[s.trade] || 0) + 1;
          return acc;
        }, {}),
        by_rating: {
          '5_star': filteredSubs.filter(s => s.rating === 5).length,
          '4_star': filteredSubs.filter(s => s.rating === 4).length,
          '3_star': filteredSubs.filter(s => s.rating === 3).length,
          '2_star': filteredSubs.filter(s => s.rating === 2).length,
          '1_star': filteredSubs.filter(s => s.rating === 1).length
        },
        insurance_expiring_soon: filteredSubs.filter(s => {
          const sixtyDays = new Date();
          sixtyDays.setDate(sixtyDays.getDate() + 60);
          return new Date(s.insurance_expiry) <= sixtyDays;
        }).length,
        top_performers: filteredSubs
          .filter(s => s.performance_score >= 90)
          .sort((a, b) => b.performance_score - a.performance_score)
          .slice(0, 5)
          .map(s => ({ id: s.id, name: s.name, score: s.performance_score, trade: s.trade }))
      };

      console.log(`👷 Fetched ${filteredSubs.length} subcontractors for ${user.email}`);

      return res.status(200).json({ success: true, data: filteredSubs, summary });
    }

    // POST - Add new subcontractor
    if (req.method === 'POST') {
      const subData = req.body;

      if (!subData.name || !subData.company_id || !subData.trade) {
        return res.status(400).json({
          success: false,
          error: 'Subcontractor name, company, and trade are required'
        });
      }

      const newSubcontractor = {
        id: `sub-${Date.now()}`,
        company_id: subData.company_id,
        name: subData.name,
        contact_name: subData.contact_name || '',
        email: subData.email || '',
        phone: subData.phone || '',
        address: subData.address || '',
        city: subData.city || '',
        state: subData.state || '',
        zip_code: subData.zip_code || '',
        trade: subData.trade,
        license_number: subData.license_number || '',
        insurance_expiry: subData.insurance_expiry || null,
        rating: subData.rating || 0,
        is_active: 1,
        is_certified: subData.is_certified || 0,
        total_projects: 0,
        total_contract_value: 0,
        performance_score: 0,
        on_time_completion: 0,
        safety_incidents: 0,
        notes: subData.notes || '',
        specializations: subData.specializations || [],
        certifications: subData.certifications || [],
        created_at: new Date().toISOString()
      };

      subcontractors.push(newSubcontractor);

      console.log(`✅ Subcontractor added: ${newSubcontractor.name} - ${newSubcontractor.trade}`);

      return res.status(201).json({
        success: true,
        data: newSubcontractor,
        message: 'Subcontractor added successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Subcontractors API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
