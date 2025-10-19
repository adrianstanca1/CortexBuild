// UK Tender Assistant API Routes
import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const db = new Database('cortexbuild.db');

// Middleware to get user from request (assumes authentication middleware)
const getUserFromRequest = (req: Request) => {
  // In production, this would extract from JWT token
  return {
    id: req.headers['x-user-id'] || 'user-1',
    company_id: req.headers['x-company-id'] || 'company-1',
  };
};

// GET /api/tenders - List all tenders with filtering
router.get('/', (req: Request, res: Response) => {
  try {
    const {
      status,
      region,
      sector,
      min_value,
      max_value,
      search,
      cpv_code,
      work_category,
      page = '1',
      limit = '20',
      sort_by = 'deadline_date',
      sort_order = 'ASC',
    } = req.query;

    let query = 'SELECT * FROM tenders WHERE 1=1';
    const params: any[] = [];

    // Apply filters
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (region) {
      query += ' AND region = ?';
      params.push(region);
    }

    if (sector) {
      query += ' AND sector = ?';
      params.push(sector);
    }

    if (work_category) {
      query += ' AND work_category = ?';
      params.push(work_category);
    }

    if (min_value) {
      query += ' AND contract_value_max >= ?';
      params.push(parseFloat(min_value as string));
    }

    if (max_value) {
      query += ' AND contract_value_min <= ?';
      params.push(parseFloat(max_value as string));
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR organisation_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (cpv_code) {
      query += ' AND cpv_codes LIKE ?';
      params.push(`%${cpv_code}%`);
    }

    // Count total results
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = db.prepare(countQuery).get(...params) as any;
    const total = countResult.total;

    // Add sorting
    const validSortFields = [
      'deadline_date',
      'published_date',
      'contract_value_max',
      'title',
      'ai_match_score',
    ];
    const sortField = validSortFields.includes(sort_by as string) ? sort_by : 'deadline_date';
    const sortDir = sort_order === 'DESC' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${sortDir}`;

    // Add pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const tenders = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: tenders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error fetching tenders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/tenders/:id - Get single tender
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tender = db.prepare('SELECT * FROM tenders WHERE id = ?').get(id);

    if (!tender) {
      return res.status(404).json({ success: false, error: 'Tender not found' });
    }

    // Get related documents
    const documents = db.prepare('SELECT * FROM tender_documents WHERE tender_id = ?').all(id);

    // Get existing bids for this tender (if any)
    const user = getUserFromRequest(req);
    const bids = db
      .prepare(
        `
      SELECT * FROM generated_bids
      WHERE tender_id = ? AND company_id = ?
      ORDER BY created_at DESC
    `
      )
      .all(id, user.company_id);

    res.json({
      success: true,
      data: {
        ...tender,
        documents,
        company_bids: bids,
      },
    });
  } catch (error: any) {
    console.error('Error fetching tender:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/tenders - Create new tender (manual entry)
router.post('/', (req: Request, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    const tender = req.body;

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `
      INSERT INTO tenders (
        id, reference_number, title, description, organisation_name,
        contact_name, contact_email, contact_phone,
        tender_type, cpv_codes, contract_value_min, contract_value_max, currency,
        location, region, postcode,
        published_date, deadline_date, start_date, end_date, estimated_duration_months,
        status, source, source_url,
        sector, work_category,
        company_id, created_by, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?
      )
    `
    ).run(
      id,
      tender.reference_number,
      tender.title,
      tender.description,
      tender.organisation_name,
      tender.contact_name,
      tender.contact_email,
      tender.contact_phone,
      tender.tender_type,
      JSON.stringify(tender.cpv_codes || []),
      tender.contract_value_min,
      tender.contract_value_max,
      tender.currency || 'GBP',
      tender.location,
      tender.region,
      tender.postcode,
      tender.published_date || now,
      tender.deadline_date,
      tender.start_date,
      tender.end_date,
      tender.estimated_duration_months,
      tender.status || 'open',
      tender.source || 'manual',
      tender.source_url,
      tender.sector,
      tender.work_category,
      user.company_id,
      user.id,
      now,
      now
    );

    const created = db.prepare('SELECT * FROM tenders WHERE id = ?').get(id);

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error: any) {
    console.error('Error creating tender:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/tenders/:id - Update tender
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const now = new Date().toISOString();

    const updateFields = [];
    const params: any[] = [];

    // Build dynamic update query
    const allowedFields = [
      'title',
      'description',
      'organisation_name',
      'contact_name',
      'contact_email',
      'contact_phone',
      'tender_type',
      'cpv_codes',
      'contract_value_min',
      'contract_value_max',
      'location',
      'region',
      'postcode',
      'deadline_date',
      'start_date',
      'end_date',
      'estimated_duration_months',
      'status',
      'sector',
      'work_category',
      'ai_summary',
      'ai_match_score',
      'complexity_score',
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        params.push(
          field === 'cpv_codes' && Array.isArray(updates[field])
            ? JSON.stringify(updates[field])
            : updates[field]
        );
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    updateFields.push('updated_at = ?');
    params.push(now, id);

    const query = `UPDATE tenders SET ${updateFields.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...params);

    const updated = db.prepare('SELECT * FROM tenders WHERE id = ?').get(id);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating tender:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/tenders/:id - Delete tender
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    db.prepare('DELETE FROM tender_documents WHERE tender_id = ?').run(id);
    db.prepare('DELETE FROM tenders WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Tender deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting tender:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/tenders/stats/overview - Get tender statistics
router.get('/stats/overview', (req: Request, res: Response) => {
  try {
    const stats = {
      total: db.prepare('SELECT COUNT(*) as count FROM tenders').get() as any,
      by_status: db
        .prepare(
          `
        SELECT status, COUNT(*) as count
        FROM tenders
        GROUP BY status
      `
        )
        .all(),
      by_sector: db
        .prepare(
          `
        SELECT sector, COUNT(*) as count
        FROM tenders
        GROUP BY sector
        ORDER BY count DESC
        LIMIT 5
      `
        )
        .all(),
      by_region: db
        .prepare(
          `
        SELECT region, COUNT(*) as count
        FROM tenders
        GROUP BY region
        ORDER BY count DESC
        LIMIT 10
      `
        )
        .all(),
      total_value: db
        .prepare(
          `
        SELECT SUM(contract_value_max) as total_value
        FROM tenders
        WHERE status = 'open'
      `
        )
        .get() as any,
      upcoming_deadlines: db
        .prepare(
          `
        SELECT * FROM tenders
        WHERE status = 'open'
        AND deadline_date > datetime('now')
        ORDER BY deadline_date ASC
        LIMIT 5
      `
        )
        .all(),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching tender stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/tenders/:id/generate-bid - Generate AI bid for tender
router.post('/:id/generate-bid', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = getUserFromRequest(req);

    const tender = db.prepare('SELECT * FROM tenders WHERE id = ?').get(id) as any;

    if (!tender) {
      return res.status(404).json({ success: false, error: 'Tender not found' });
    }

    // In production, this would call OpenAI/Google AI to generate bid content
    const bidId = uuidv4();
    const now = new Date().toISOString();

    // Generate AI bid content (simplified for demo)
    const aiContent = {
      executive_summary: `Our company is pleased to submit this proposal for ${tender.title}. With extensive experience in ${tender.sector} projects across the ${tender.region} region, we are well-positioned to deliver this project to the highest standards.`,
      company_overview: `We are a leading construction company with over 20 years of experience in ${tender.work_category} projects. Our track record includes successful delivery of similar projects for major clients.`,
      technical_approach: `Our technical approach for this project incorporates industry best practices, innovative solutions, and a strong focus on quality, safety, and sustainability.`,
      methodology: `We propose a phased delivery approach with clear milestones and robust project management processes to ensure on-time, on-budget completion.`,
      health_safety: `Health and safety is our top priority. We maintain ISO 45001 certification and have an outstanding safety record with zero reportable incidents in the past 3 years.`,
      team_structure: `Our dedicated project team will include experienced professionals including a Project Manager, Site Manager, Health & Safety Manager, and specialist supervisors.`,
      timeline: `We propose a ${tender.estimated_duration_months}-month delivery program with key milestones aligned to your requirements.`,
    };

    db.prepare(
      `
      INSERT INTO generated_bids (
        id, tender_id, company_id, user_id,
        bid_title, bid_amount, currency,
        executive_summary, company_overview, technical_approach,
        methodology, health_safety, team_structure, timeline,
        ai_model, ai_confidence_score, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      bidId,
      id,
      user.company_id,
      user.id,
      `Bid for ${tender.title}`,
      tender.contract_value_min * 1.05, // Example: 5% above minimum
      tender.currency,
      aiContent.executive_summary,
      aiContent.company_overview,
      aiContent.technical_approach,
      aiContent.methodology,
      aiContent.health_safety,
      aiContent.team_structure,
      aiContent.timeline,
      'gemini-pro',
      0.85,
      'draft',
      now,
      now
    );

    const bid = db.prepare('SELECT * FROM generated_bids WHERE id = ?').get(bidId);

    res.status(201).json({
      success: true,
      data: bid,
      message: 'AI bid generated successfully',
    });
  } catch (error: any) {
    console.error('Error generating bid:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
