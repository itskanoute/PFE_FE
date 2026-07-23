import '../src/loadEnv.js';
import { query } from '../src/config/db.js';

const rows = await query(`
  SELECT s.id, s.session_date, s.start_time, s.end_time, s.room, s.status AS session_status,
         o.subject, sa.student_id, sa.status AS assign_status,
         u.first_name, u.last_name, u.email
  FROM sessions s
  JOIN offers o ON o.id = s.offer_id
  LEFT JOIN session_assignments sa ON sa.session_id = s.id
  LEFT JOIN users u ON u.id = sa.student_id
  ORDER BY s.session_date DESC
`);

console.log(JSON.stringify(rows, null, 2));
process.exit(0);
