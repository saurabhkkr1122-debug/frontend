import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const [{ data: projects }, { data: alerts }, { data: anomalies }] = await Promise.all([
      supabase.from('projects').select('*'),
      supabase.from('alerts').select('*'),
      supabase.from('anomalies').select('*'),
    ]);
    const list = projects || [];
    const totalAllocated = list.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const delayed = list.filter((p) => p.is_delayed).length;
    const openAlerts = (alerts || []).filter((a) => a.status !== 'resolved').length;
    const fraudAlerts = openAlerts + (anomalies || []).filter((a) => a.severity === 'Critical').length;
    const byStatus = {};
    list.forEach((p) => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });
    const bySectorMap = {};
    list.forEach((p) => {
      if (!bySectorMap[p.sector]) bySectorMap[p.sector] = { sector: p.sector, count: 0, amount: 0 };
      bySectorMap[p.sector].count += 1;
      bySectorMap[p.sector].amount += Number(p.amount) || 0;
    });
    return res.status(200).json({
      totalProjects: list.length,
      totalAllocated,
      delayedProjects: delayed,
      fraudAlerts,
      openAlerts,
      byStatus,
      bySector: Object.values(bySectorMap),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
