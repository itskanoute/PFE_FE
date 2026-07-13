-- Données de démonstration (optionnel)
-- Mot de passe pour tous les comptes : Password123!
-- Hash bcrypt (10 rounds) — à regénérer en production

USE edumanage;

INSERT INTO schools (name, acronym, email_domain, address, city, phone, hourly_rate) VALUES
('ESCP Business School', 'ESCP', 'escp.eu', '79 Avenue de la République, 75011 Paris', 'Paris', '01 49 23 20 00', 12.00),
('Sorbonne Université', 'SU', 'sorbonne-universite.fr', '4 Place Jussieu, 75005 Paris', 'Paris', '01 44 27 44 27', 11.50);

INSERT INTO filieres (school_id, name) VALUES
(1, 'L2 Informatique'),
(1, 'L3 Informatique'),
(1, 'M1 Informatique'),
(1, 'M2 Informatique'),
(2, 'L3 Mathématiques');

-- Admin ESCP
INSERT INTO users (school_id, email, password_hash, role, first_name, last_name, phone) VALUES
(1, 'admin@escp.eu', '$2b$10$E27WF0Sz9Z195GuCuMP0NeEG/OaPJ/CW0IcdbKkG8L6Q3WZgD6r9a', 'admin', 'Jean', 'Dupont', '01 49 23 20 00');

-- Responsable ESCP
INSERT INTO users (school_id, email, password_hash, role, first_name, last_name, phone, must_change_password) VALUES
(1, 'e.ettori@escp.eu', '$2b$10$E27WF0Sz9Z195GuCuMP0NeEG/OaPJ/CW0IcdbKkG8L6Q3WZgD6r9a', 'responsable', 'Eric', 'Ettori', '01 49 23 20 15', 1);

INSERT INTO responsable_profiles (user_id, school_id, department) VALUES
(2, 1, 'Informatique');

-- Étudiante ESCP
INSERT INTO users (school_id, email, password_hash, role, first_name, last_name, phone) VALUES
(1, 'lea.martin@escp.eu', '$2b$10$E27WF0Sz9Z195GuCuMP0NeEG/OaPJ/CW0IcdbKkG8L6Q3WZgD6r9a', 'etudiant', 'Léa', 'Martin', '06 12 34 56 78');

INSERT INTO student_profiles (user_id, school_id, student_number, filiere_id, major, study_year) VALUES
(3, 1, '20230456', 2, 'L3 Informatique', 'L3');

-- Offre exemple
INSERT INTO offers (school_id, responsable_id, subject, level, weekly_hours, start_date, end_date, description, required_skills, min_grade) VALUES
(1, 2, 'Base de données', 'L3 Informatique', 4.0, '2026-09-01', '2026-12-20',
 'Accompagner les étudiants lors des séances de TP SQL et modélisation.',
 'SQL, MySQL, Modélisation', 12.00);

-- Second responsable sans offre active (alerte dashboard)
INSERT INTO users (school_id, email, password_hash, role, first_name, last_name, phone) VALUES
(1, 'm.bernard@escp.eu', '$2b$10$E27WF0Sz9Z195GuCuMP0NeEG/OaPJ/CW0IcdbKkG8L6Q3WZgD6r9a', 'responsable', 'Marc', 'Bernard', '01 49 23 20 18');

INSERT INTO responsable_profiles (user_id, school_id, department) VALUES
(4, 1, 'Mathématiques');

-- Étudiants supplémentaires (dont sans IBAN)
INSERT INTO users (school_id, email, password_hash, role, first_name, last_name, phone) VALUES
(1, 'thomas.dubois@escp.eu', '$2b$10$E27WF0Sz9Z195GuCuMP0NeEG/OaPJ/CW0IcdbKkG8L6Q3WZgD6r9a', 'etudiant', 'Thomas', 'Dubois', '06 98 76 54 32'),
(1, 'emma.lemaire@escp.eu', '$2b$10$E27WF0Sz9Z195GuCuMP0NeEG/OaPJ/CW0IcdbKkG8L6Q3WZgD6r9a', 'etudiant', 'Emma', 'Lemaire', '06 11 22 33 44');

INSERT INTO student_profiles (user_id, school_id, student_number, filiere_id, major, study_year, iban) VALUES
(5, 1, '20230457', 2, 'L3 Informatique', 'L3', NULL),
(6, 1, '20230458', 2, 'L3 Informatique', 'L3', NULL);

-- Candidature acceptée → assistant actif
INSERT INTO applications (offer_id, student_id, motivation, grade_obtained, status, reviewed_at, reviewed_by) VALUES
(1, 3, 'Motivée par l''enseignement et SQL.', 14.50, 'accepted', NOW(), 2),
(1, 5, 'Expérience en tutorat L2.', 13.00, 'accepted', NOW(), 2);

-- Séances et heures
INSERT INTO sessions (offer_id, responsable_id, session_date, start_time, end_time, room, status) VALUES
(1, 2, CURDATE(), '09:00:00', '12:00:00', 'Salle B12', 'completed'),
(1, 2, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '14:00:00', '17:00:00', 'Salle B12', 'completed'),
(1, 2, DATE_SUB(CURDATE(), INTERVAL 30 DAY), '09:00:00', '12:00:00', 'Salle B12', 'completed'),
(1, 2, DATE_SUB(CURDATE(), INTERVAL 60 DAY), '14:00:00', '17:00:00', 'Salle B12', 'completed');

INSERT INTO session_assignments (session_id, student_id, status) VALUES
(1, 3, 'completed'),
(2, 3, 'completed'),
(3, 3, 'completed'),
(4, 5, 'completed');

INSERT INTO hour_records (session_id, assignment_id, student_id, responsable_id, duration_hours, status, validated_at) VALUES
(1, 1, 3, 2, 3.00, 'validated', NOW()),
(2, 2, 3, 2, 3.00, 'validated', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(3, 3, 3, 2, 3.00, 'validated', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(4, 4, 5, 2, 3.00, 'pending', NULL);

-- Journal d'activité admin
INSERT INTO activity_logs (school_id, actor_id, action, description) VALUES
(1, 3, 'student_registered', 'Léa Martin s''est inscrite en tant qu''étudiante'),
(1, 2, 'hours_validated', 'Eric Ettori a validé 8h de séances'),
(1, 2, 'offer_created', 'Eric Ettori a créé une offre Base de données'),
(1, 1, 'export_generated', 'Export paie généré pour le mois en cours'),
(1, NULL, 'alert', '3 étudiants n''ont pas encore renseigné leur IBAN'),
(1, 5, 'student_registered', 'Thomas Dubois s''est inscrit en tant qu''étudiant'),
(1, 1, 'responsable_created', 'Marc Bernard a été ajouté en tant que responsable');
