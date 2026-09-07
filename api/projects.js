import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { id, q, status, state } = req.query;
      let query = supabase.from('projects').select('*').order('id', { ascending: true });
      if (id) query = query.eq('id', id);
      if (status && status !== 'All') query = query.eq('status', status);
      if (state && state !== 'All') query = query.eq('state', state);
      const { data, error } = await query;
      if (error) throw error;
      let rows = data || [];
      if (q) {
        const needle = String(q).toLowerCase();
        rows = rows.filter((r) =>
          [r.project_id, r.name, r.constituency, r.state, r.sector, r.vendor_name]
            .filter(Boolean).join(' ').toLowerCase().includes(needle)
        );
      }
      return res.status(200).json(rows);
    }
    if (req.method === 'POST') {
      const { data, error } = await supabase.from('projects').insert(req.body).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { data, error } = await supabase.from('projects').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('projects API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
