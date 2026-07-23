import '../src/loadEnv.js';
import { query } from '../src/config/db.js';

const rows = await query(`
  SELECT hr.id, hr.duration_hours, hr.status, hr.student_id,
         u.first_name, u.last_name, s.session_date, o.subject
  FROM hour_records hr
  JOIN users u ON u.id = hr.student_id
  JOIN sessions s ON s.id = hr.session_id
  JOIN offers o ON o.id = s.offer_id
  ORDER BY hr.created_at DESC
`);
console.log(JSON.stringify(rows, null, 2));
process.exit(0);
