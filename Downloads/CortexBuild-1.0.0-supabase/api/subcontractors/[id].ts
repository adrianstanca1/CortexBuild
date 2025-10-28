import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let subcontractors = [
  {
    id: 'sub-1',
    company_id: 'company-1',
    name: 'Precision Steel Fabricators',
    trade: 'Structural Steel',
    contact_person: 'James Rodriguez',
    email: 'james@precisionsteel.com',
    phone: '+1-415-555-0220',
    address: '890 Industrial Parkway, Oakland, CA 94621',
    license_number: 'CA-123456',
    insurance_expiry: '2025-12-31',
    performance_score: 92,
    total_contracts: 8,
    total_contract_value: 12500000,
    status: 'active',
    certifications: ['OSHA 30', 'AWS Certified Welding', 'AISC Certified'],
    created_at: '2024-03-10T00:00:00Z'
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
    const { id } = req.query;

    // GET - Fetch single subcontractor
    if (req.method === 'GET') {
      const sub = subcontractors.find(s => s.id === id);

      if (!sub) {
        return res.status(404).json({ success: false, error: 'Subcontractor not found' });
      }

      // Check permissions
      if (user.role !== 'super_admin' && sub.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      // Check insurance expiry
      const today = new Date().toISOString().split('T')[0];
      const daysUntilExpiry = Math.floor((new Date(sub.insurance_expiry).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));

      const insuranceStatus = daysUntilExpiry < 0 ? 'expired' : daysUntilExpiry < 30 ? 'expiring_soon' : 'valid';

      console.log(`✅ Fetched subcontractor ${sub.name}`);

      return res.status(200).json({
        success: true,
        data: {
          ...sub,
          insurance_status: insuranceStatus,
          days_until_insurance_expiry: daysUntilExpiry
        }
      });
    }

    // PUT/PATCH - Update subcontractor
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const subIndex = subcontractors.findIndex(s => s.id === id);

      if (subIndex === -1) {
        return res.status(404).json({ success: false, error: 'Subcontractor not found' });
      }

      const sub = subcontractors[subIndex];

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      if (user.role !== 'super_admin' && sub.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      const updates = req.body;

      // Recalculate performance score if relevant fields change
      if (updates.quality_rating || updates.timeliness_rating || updates.safety_rating) {
        const quality = updates.quality_rating ?? 90;
        const timeliness = updates.timeliness_rating ?? 88;
        const safety = updates.safety_rating ?? 95;
        updates.performance_score = Math.round((quality + timeliness + safety) / 3);
      }

      // Update subcontractor
      subcontractors[subIndex] = {
        ...sub,
        ...updates,
        id: sub.id,
        company_id: sub.company_id,
        created_at: sub.created_at,
        updated_at: new Date().toISOString()
      };

      console.log(`✅ Updated subcontractor ${subcontractors[subIndex].name}`);

      // Create activity log
      const activity = {
        type: 'subcontractor_updated',
        subcontractor_id: sub.id,
        user_id: user.userId,
        changes: updates,
        timestamp: new Date().toISOString()
      };

      // Check for insurance expiry alert
      const insuranceUpdated = updates.insurance_expiry && updates.insurance_expiry !== sub.insurance_expiry;
      const notification = insuranceUpdated ? {
        type: 'subcontractor_insurance_updated',
        subcontractor_id: sub.id,
        subcontractor_name: sub.name,
        message: `Insurance expiry updated for ${sub.name}: ${updates.insurance_expiry}`,
        timestamp: new Date().toISOString()
      } : null;

      return res.status(200).json({
        success: true,
        data: subcontractors[subIndex],
        activity,
        notification,
        message: 'Subcontractor updated successfully'
      });
    }

    // DELETE - Delete subcontractor
    if (req.method === 'DELETE') {
      const subIndex = subcontractors.findIndex(s => s.id === id);

      if (subIndex === -1) {
        return res.status(404).json({ success: false, error: 'Subcontractor not found' });
      }

      const sub = subcontractors[subIndex];

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      if (user.role !== 'super_admin' && sub.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      // Can't delete subcontractors with active contracts
      if (sub.total_contracts > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete subcontractor with active contracts',
          details: `Subcontractor has ${sub.total_contracts} active contract(s)`
        });
      }

      subcontractors.splice(subIndex, 1);

      console.log(`✅ Deleted subcontractor ${sub.name}`);

      // Create activity log
      const activity = {
        type: 'subcontractor_deleted',
        subcontractor_id: sub.id,
        subcontractor_name: sub.name,
        user_id: user.userId,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        activity,
        message: 'Subcontractor deleted successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Subcontractor API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
