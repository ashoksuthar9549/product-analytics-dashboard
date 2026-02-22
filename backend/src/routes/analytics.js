const express = require('express');
const { Op, fn, col, literal } = require('sequelize');
const { FeatureClick, User, sequelize } = require('../models/index');
const authenticate = require('../middleware/auth');

const router = express.Router();
/**
 * Build a WHERE clause on the User table based on age / gender filters.
 */
function buildUserWhere({ age, gender }) {
  const where = {};
  if (age && age !== 'all') {
    if (age === '<18')        where.age = { [Op.lt]: 18 };
    else if (age === '18-40') where.age = { [Op.between]: [18, 40] };
    else if (age === '>40')   where.age = { [Op.gt]: 40 };
  }
  if (gender && gender !== 'all') where.gender = gender;
  return where;
}

/**
 * GET /analytics
 *
 * Query params:
 *   start_date  — ISO date string (default: 30 days ago)
 *   end_date    — ISO date string (default: now)
 *   age         — '<18' | '18-40' | '>40' | 'all'
 *   gender      — 'Male' | 'Female' | 'Other' | 'all'
 *   feature     — specific feature name for time-trend data
 *
 * Response:
 *   {
 *     bar_chart:  [{ feature_name, total_clicks }],
 *     line_chart: [{ date, click_count }],
 *     summary:    { total_clicks, unique_users, date_range }
 *   }
 */


// GET /analytics
router.get('/', authenticate, async (req, res) => {
  try {
    const { start_date, end_date, age = 'all', gender = 'all', feature } = req.query;

    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date
      ? new Date(start_date)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    endDate.setHours(23, 59, 59, 999);

    const clickWhere = { timestamp: { [Op.between]: [startDate, endDate] } };
    const userWhere  = buildUserWhere({ age, gender });
    const hasUserFilter = Object.keys(userWhere).length > 0;

    const userInclude = hasUserFilter
      ? [{ model: User, as: 'user', attributes: [], where: userWhere, required: true }]
      : [];

    // Bar Chart
    const barChartRaw = await FeatureClick.findAll({
      attributes: [
        'feature_name',
        [fn('COUNT', col('FeatureClick.id')), 'total_clicks'],
      ],
      where: clickWhere,
      include: userInclude,
      group: ['feature_name'],
      order: [[literal('total_clicks'), 'DESC']],
      raw: true,
    });

    const barChart = barChartRaw.map((r) => ({
      feature_name: r.feature_name,
      total_clicks: parseInt(r.total_clicks, 10),
    }));

    // Line Chart
    const targetFeature = feature || (barChart.length > 0 ? barChart[0].feature_name : null);
    let lineChart = [];

    if (targetFeature) {
      const dialect = sequelize.getDialect();
      const dateTrunc = dialect === 'postgres'
        ? fn('DATE_TRUNC', 'day', col('timestamp'))
        : fn('DATE', col('timestamp'));

      const lineRaw = await FeatureClick.findAll({
        attributes: [
          [dateTrunc, 'date'],
          [fn('COUNT', col('FeatureClick.id')), 'click_count'],
        ],
        where: { ...clickWhere, feature_name: targetFeature },
        include: userInclude,
        group: [dateTrunc],
        order: [[dateTrunc, 'ASC']],
        raw: true,
      });

      lineChart = lineRaw.map((r) => ({
        date: r.date,
        click_count: parseInt(r.click_count, 10),
      }));
    }

    // Summary
    const summaryRaw = await FeatureClick.findAll({
      attributes: [
        [fn('COUNT', col('FeatureClick.id')), 'total_clicks'],
        [fn('COUNT', fn('DISTINCT', col('FeatureClick.user_id'))), 'unique_users'],
      ],
      where: clickWhere,
      include: userInclude,
      raw: true,
    });

    return res.status(200).json({
      bar_chart: barChart,
      line_chart: lineChart,
      summary: {
        total_clicks: parseInt(summaryRaw[0]?.total_clicks || 0, 10),
        unique_users: parseInt(summaryRaw[0]?.unique_users || 0, 10),
        date_range: { start: startDate.toISOString(), end: endDate.toISOString() },
        active_feature: targetFeature,
      },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;