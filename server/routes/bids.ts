// Bid Management API Routes
import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const db = new Database('cortexbuild.db');

const getUserFromRequest = (req: Request) => {
  return {
    id: req.headers['x-user-id'] || 'user-1',
    company_id: req.headers['x-company-id'] || 'company-1',
  };
};

// GET /api/bids - List all bids for company
router.get('/', (req: Request, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    const { status, tender_id, page = '1', limit = '20' } = req.query;

    let query = `
      SELECT b.*, t.title as tender_title, t.organisation_name, t.deadline_date
      FROM generated_bids b
      LEFT JOIN tenders t ON b.tender_id = t.id
      WHERE b.company_id = ?
    `;
    const params: any[] = [user.company_id];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    if (tender_id) {
      query += ' AND b.tender_id = ?';
      params.push(tender_id);
    }

    query += ' ORDER BY b.created_at DESC';

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const bids = db.prepare(query).all(...params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM generated_bids WHERE company_id = ?';
    const countParams: any[] = [user.company_id];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const countResult = db.prepare(countQuery).get(...countParams) as any;

    res.json({
      success: true,
      data: bids,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countResult.total,
        pages: Math.ceil(countResult.total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Error fetching bids:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bids/:id - Get single bid with details
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = getUserFromRequest(req);

    const bid = db
      .prepare(
        `
      SELECT b.*, t.title as tender_title, t.organisation_name, t.deadline_date,
             t.description as tender_description, t.contract_value_min, t.contract_value_max
      FROM generated_bids b
      LEFT JOIN tenders t ON b.tender_id = t.id
      WHERE b.id = ? AND b.company_id = ?
    `
      )
      .get(id, user.company_id);

    if (!bid) {
      return res.status(404).json({ success: false, error: 'Bid not found' });
    }

    // Get cost estimates for this bid
    const costEstimates = db
      .prepare(
        `
      SELECT * FROM cost_estimates
      WHERE bid_id = ?
      ORDER BY created_at DESC
    `
      )
      .all(id);

    // Get collaborators
    const collaborators = db
      .prepare(
        `
      SELECT tc.*, u.name, u.email, u.avatar
      FROM tender_collaborations tc
      LEFT JOIN users u ON tc.user_id = u.id
      WHERE tc.bid_id = ?
    `
      )
      .all(id);

    res.json({
      success: true,
      data: {
        ...bid,
        cost_estimates: costEstimates,
        collaborators,
      },
    });
  } catch (error: any) {
    console.error('Error fetching bid:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/bids/:id - Update bid
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = getUserFromRequest(req);
    const updates = req.body;
    const now = new Date().toISOString();

    const updateFields = [];
    const params: any[] = [];

    const allowedFields = [
      'bid_title',
      'bid_reference',
      'bid_amount',
      'executive_summary',
      'company_overview',
      'technical_approach',
      'methodology',
      'quality_assurance',
      'health_safety',
      'environmental_considerations',
      'team_structure',
      'timeline',
      'pricing_breakdown',
      'status',
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        params.push(
          field === 'pricing_breakdown' && typeof updates[field] === 'object'
            ? JSON.stringify(updates[field])
            : updates[field]
        );
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    updateFields.push('updated_at = ?');
    params.push(now, id, user.company_id);

    const query = `UPDATE generated_bids SET ${updateFields.join(', ')} WHERE id = ? AND company_id = ?`;
    db.prepare(query).run(...params);

    const updated = db.prepare('SELECT * FROM generated_bids WHERE id = ?').get(id);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating bid:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bids/:id/submit - Submit bid
router.post('/:id/submit', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = getUserFromRequest(req);
    const now = new Date().toISOString();

    const result = db
      .prepare(
        `
      UPDATE generated_bids
      SET status = 'submitted', submitted_date = ?
      WHERE id = ? AND company_id = ?
    `
      )
      .run(now, id, user.company_id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Bid not found' });
    }

    const bid = db.prepare('SELECT * FROM generated_bids WHERE id = ?').get(id);

    res.json({
      success: true,
      data: bid,
      message: 'Bid submitted successfully',
    });
  } catch (error: any) {
    console.error('Error submitting bid:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/bids/:id/duplicate - Duplicate a bid
router.post('/:id/duplicate', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = getUserFromRequest(req);

    const originalBid = db
      .prepare(
        `
      SELECT * FROM generated_bids
      WHERE id = ? AND company_id = ?
    `
      )
      .get(id, user.company_id) as any;

    if (!originalBid) {
      return res.status(404).json({ success: false, error: 'Bid not found' });
    }

    const newBidId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `
      INSERT INTO generated_bids (
        id, tender_id, company_id, user_id,
        bid_title, bid_reference, bid_amount, currency,
        executive_summary, company_overview, technical_approach,
        methodology, quality_assurance, health_safety,
        environmental_considerations, team_structure, timeline,
        pricing_breakdown, status, parent_bid_id, version,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      newBidId,
      originalBid.tender_id,
      user.company_id,
      user.id,
      `${originalBid.bid_title} (Copy)`,
      null,
      originalBid.bid_amount,
      originalBid.currency,
      originalBid.executive_summary,
      originalBid.company_overview,
      originalBid.technical_approach,
      originalBid.methodology,
      originalBid.quality_assurance,
      originalBid.health_safety,
      originalBid.environmental_considerations,
      originalBid.team_structure,
      originalBid.timeline,
      originalBid.pricing_breakdown,
      'draft',
      id,
      1,
      now,
      now
    );

    const newBid = db.prepare('SELECT * FROM generated_bids WHERE id = ?').get(newBidId);

    res.status(201).json({
      success: true,
      data: newBid,
      message: 'Bid duplicated successfully',
    });
  } catch (error: any) {
    console.error('Error duplicating bid:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/bids/:id - Delete bid
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = getUserFromRequest(req);

    // Delete related records
    db.prepare('DELETE FROM cost_estimates WHERE bid_id = ?').run(id);
    db.prepare('DELETE FROM tender_collaborations WHERE bid_id = ?').run(id);

    const result = db
      .prepare(
        `
      DELETE FROM generated_bids
      WHERE id = ? AND company_id = ?
    `
      )
      .run(id, user.company_id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Bid not found' });
    }

    res.json({
      success: true,
      message: 'Bid deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting bid:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/bids/stats/overview - Get bid statistics
router.get('/stats/overview', (req: Request, res: Response) => {
  try {
    const user = getUserFromRequest(req);

    const stats = {
      total: db
        .prepare('SELECT COUNT(*) as count FROM generated_bids WHERE company_id = ?')
        .get(user.company_id) as any,
      by_status: db
        .prepare(
          `
        SELECT status, COUNT(*) as count
        FROM generated_bids
        WHERE company_id = ?
        GROUP BY status
      `
        )
        .all(user.company_id),
      total_bid_value: db
        .prepare(
          `
        SELECT SUM(bid_amount) as total_value
        FROM generated_bids
        WHERE company_id = ? AND status IN ('submitted', 'won')
      `
        )
        .get(user.company_id) as any,
      win_rate: db
        .prepare(
          `
        SELECT
          COUNT(CASE WHEN status = 'won' THEN 1 END) as won,
          COUNT(CASE WHEN status IN ('won', 'lost') THEN 1 END) as decided
        FROM generated_bids
        WHERE company_id = ?
      `
        )
        .get(user.company_id) as any,
      recent_bids: db
        .prepare(
          `
        SELECT b.*, t.title as tender_title
        FROM generated_bids b
        LEFT JOIN tenders t ON b.tender_id = t.id
        WHERE b.company_id = ?
        ORDER BY b.created_at DESC
        LIMIT 5
      `
        )
        .all(user.company_id),
    };

    // Calculate win rate percentage
    if (stats.win_rate.decided > 0) {
      stats.win_rate.percentage = ((stats.win_rate.won / stats.win_rate.decided) * 100).toFixed(1);
    } else {
      stats.win_rate.percentage = '0';
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching bid stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
