import { Router, Request, Response } from 'express';

const router = Router();

// Mock data - 6 UK tenders
const mockTenders = [
  {
    id: 'tender-001',
    reference_number: 'CF-2025-001',
    title: 'New Build Hospital - Emergency Department Extension',
    organisation_name: 'Birmingham University Hospitals NHS Foundation Trust',
    contract_value_min: 18000000,
    contract_value_max: 22000000,
    currency: 'GBP',
    location: 'Birmingham',
    region: 'West Midlands',
    deadline_date: '2025-11-15 17:00:00',
    status: 'open',
    sector: 'construction',
    ai_match_score: 95
  },
  {
    id: 'tender-002',
    reference_number: 'CF-2025-002',
    title: 'A56 Junction Improvement Works',
    organisation_name: 'Greater Manchester Combined Authority',
    contract_value_min: 3500000,
    contract_value_max: 4200000,
    currency: 'GBP',
    location: 'Manchester',
    region: 'North West',
    deadline_date: '2025-11-20 12:00:00',
    status: 'open',
    sector: 'civil_engineering',
    ai_match_score: 88
  },
  {
    id: 'tender-003',
    reference_number: 'CF-2025-003',
    title: 'Secondary School Modernisation Programme - Phase 1',
    organisation_name: 'London Borough of Southwark',
    contract_value_min: 5500000,
    contract_value_max: 6800000,
    currency: 'GBP',
    location: 'London',
    region: 'London',
    deadline_date: '2025-11-30 17:00:00',
    status: 'open',
    sector: 'construction',
    ai_match_score: 82
  },
  {
    id: 'tender-004',
    reference_number: 'CF-2025-004',
    title: 'Student Accommodation Development',
    organisation_name: 'University of Edinburgh',
    contract_value_min: 28000000,
    contract_value_max: 32000000,
    currency: 'GBP',
    location: 'Edinburgh',
    region: 'Scotland',
    deadline_date: '2025-12-05 17:00:00',
    status: 'open',
    sector: 'construction',
    ai_match_score: 90
  },
  {
    id: 'tender-005',
    reference_number: 'CF-2025-005',
    title: 'Water Treatment Works Upgrade',
    organisation_name: 'Yorkshire Water Services Ltd',
    contract_value_min: 8500000,
    contract_value_max: 10200000,
    currency: 'GBP',
    location: 'Leeds',
    region: 'Yorkshire and the Humber',
    deadline_date: '2025-11-10 17:00:00',
    status: 'open',
    sector: 'building_services',
    ai_match_score: 87
  },
  {
    id: 'tender-006',
    reference_number: 'CF-2025-006',
    title: 'Grade A Office Space - Interior Fit-Out',
    organisation_name: 'Bristol City Council',
    contract_value_min: 2200000,
    contract_value_max: 2800000,
    currency: 'GBP',
    location: 'Bristol',
    region: 'South West',
    deadline_date: '2025-11-25 17:00:00',
    status: 'open',
    sector: 'construction',
    ai_match_score: 78
  }
];

// GET /api/tenders - List all tenders
router.get('/', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: mockTenders
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/tenders/stats/overview - Statistics
router.get('/stats/overview', (req: Request, res: Response) => {
  try {
    const totalValue = mockTenders.reduce((sum, t) => sum + t.contract_value_max, 0);

    const byStatus = [{ status: 'open', count: mockTenders.length }];

    const bySector: any = {};
    mockTenders.forEach(t => {
      bySector[t.sector] = (bySector[t.sector] || 0) + 1;
    });
    const sectorArray = Object.entries(bySector).map(([sector, count]) => ({ sector, count }));

    const byRegion: any = {};
    mockTenders.forEach(t => {
      byRegion[t.region] = (byRegion[t.region] || 0) + 1;
    });
    const regionArray = Object.entries(byRegion).map(([region, count]) => ({ region, count }));

    res.json({
      success: true,
      data: {
        total: { count: mockTenders.length },
        by_status: byStatus,
        by_sector: sectorArray,
        by_region: regionArray,
        total_value: { total_value: totalValue },
        upcoming_deadlines: mockTenders.slice(0, 5)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/tenders/:id - Get single tender
router.get('/:id', (req: Request, res: Response) => {
  try {
    const tender = mockTenders.find(t => t.id === req.params.id);
    if (!tender) {
      return res.status(404).json({
        success: false,
        error: 'Tender not found'
      });
    }
    res.json({
      success: true,
      data: tender
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/tenders/:id/generate-bid - Generate AI bid
router.post('/:id/generate-bid', (req: Request, res: Response) => {
  try {
    const tender = mockTenders.find(t => t.id === req.params.id);
    if (!tender) {
      return res.status(404).json({
        success: false,
        error: 'Tender not found'
      });
    }

    const bid = {
      id: 'bid-' + Date.now(),
      tender_id: tender.id,
      bid_title: `Bid for ${tender.title}`,
      bid_amount: Math.floor((tender.contract_value_min + tender.contract_value_max) / 2),
      currency: tender.currency,
      executive_summary: `Professional bid proposal for ${tender.title}`,
      status: 'draft',
      ai_confidence_score: 0.85,
      created_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: bid
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
