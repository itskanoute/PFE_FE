-- Données démo pour le dashboard admin (INSERT incrémental)
USE edumanage;

INSERT INTO users (school_id, email, password_hash, role, first_name, last_name, phone)
SELECT 1, 'm.bernard@escp.eu', '$2b$10$E27WF0Sz9Z195GuCuMP0NeEG/OaPJ/CW0IcdbKkG8L6Q3WZgD6r9a', 'responsable', 'Marc', 'Bernard', '01 49 23 20 18'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'm.bernard@escp.eu');

INSERT INTO responsable_profiles (user_id, school_id, department)
SELECT u.id, 1, 'Mathématiques' FROM users u
WHERE u.email = 'm.bernard@escp.eu'
  AND NOT EXISTS (SELECT 1 FROM responsable_profiles rp WHERE rp.user_id = u.id);

INSERT INTO users (school_id, email, password_hash, role, first_name, last_name, phone)
SELECT 1, 'thomas.dubois@escp.eu', '$2b$10$E27WF0Sz9Z195GuCuMP0NeEG/OaPJ/CW0IcdbKkG8L6Q3WZgD6r9a', 'etudiant', 'Thomas', 'Dubois', '06 98 76 54 32'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'thomas.dubois@escp.eu');

INSERT INTO users (school_id, email, password_hash, role, first_name, last_name, phone)
SELECT 1, 'emma.lemaire@escp.eu', '$2b$10$E27WF0Sz9Z195GuCuMP0NeEG/OaPJ/CW0IcdbKkG8L6Q3WZgD6r9a', 'etudiant', 'Emma', 'Lemaire', '06 11 22 33 44'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'emma.lemaire@escp.eu');

INSERT INTO student_profiles (user_id, school_id, student_number, filiere_id, major, study_year, iban)
SELECT u.id, 1, '20230457', 2, 'L3 Informatique', 'L3', NULL FROM users u
WHERE u.email = 'thomas.dubois@escp.eu'
  AND NOT EXISTS (SELECT 1 FROM student_profiles sp WHERE sp.user_id = u.id);

INSERT INTO student_profiles (user_id, school_id, student_number, filiere_id, major, study_year, iban)
SELECT u.id, 1, '20230458', 2, 'L3 Informatique', 'L3', NULL FROM users u
WHERE u.email = 'emma.lemaire@escp.eu'
  AND NOT EXISTS (SELECT 1 FROM student_profiles sp WHERE sp.user_id = u.id);

INSERT INTO applications (offer_id, student_id, motivation, grade_obtained, status, reviewed_at, reviewed_by)
SELECT 1, u.id, 'Motivée par l''enseignement.', 14.50, 'accepted', NOW(), 2 FROM users u
WHERE u.email = 'lea.martin@escp.eu'
  AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.offer_id = 1 AND a.student_id = u.id);

INSERT INTO applications (offer_id, student_id, motivation, grade_obtained, status, reviewed_at, reviewed_by)
SELECT 1, u.id, 'Expérience en tutorat L2.', 13.00, 'accepted', NOW(), 2 FROM users u
WHERE u.email = 'thomas.dubois@escp.eu'
  AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.offer_id = 1 AND a.student_id = u.id);

INSERT INTO sessions (offer_id, responsable_id, session_date, start_time, end_time, room, status)
SELECT 1, 2, CURDATE(), '09:00:00', '12:00:00', 'Salle B12', 'completed'
WHERE NOT EXISTS (SELECT 1 FROM sessions WHERE offer_id = 1 AND session_date = CURDATE());

INSERT INTO sessions (offer_id, responsable_id, session_date, start_time, end_time, room, status)
SELECT 1, 2, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '14:00:00', '17:00:00', 'Salle B12', 'completed'
WHERE (SELECT COUNT(*) FROM sessions WHERE offer_id = 1) < 2;

INSERT INTO sessions (offer_id, responsable_id, session_date, start_time, end_time, room, status)
SELECT 1, 2, DATE_SUB(CURDATE(), INTERVAL 30 DAY), '09:00:00', '12:00:00', 'Salle B12', 'completed'
WHERE (SELECT COUNT(*) FROM sessions WHERE offer_id = 1) < 3;

INSERT INTO sessions (offer_id, responsable_id, session_date, start_time, end_time, room, status)
SELECT 1, 2, DATE_SUB(CURDATE(), INTERVAL 60 DAY), '14:00:00', '17:00:00', 'Salle B12', 'completed'
WHERE (SELECT COUNT(*) FROM sessions WHERE offer_id = 1) < 4;

INSERT INTO activity_logs (school_id, actor_id, action, description)
SELECT 1, u.id, 'student_registered', 'Léa Martin s''est inscrite en tant qu''étudiante' FROM users u
WHERE u.email = 'lea.martin@escp.eu'
  AND NOT EXISTS (SELECT 1 FROM activity_logs WHERE description LIKE 'Léa Martin%');

INSERT INTO activity_logs (school_id, actor_id, action, description) VALUES
(1, 2, 'hours_validated', 'Eric Ettori a validé 8h de séances'),
(1, 2, 'offer_created', 'Eric Ettori a créé une offre Base de données'),
(1, 1, 'export_generated', 'Export paie généré pour le mois en cours'),
(1, NULL, 'alert', '3 étudiants n''ont pas encore renseigné leur IBAN'),
(1, 1, 'responsable_created', 'Marc Bernard a été ajouté en tant que responsable');
