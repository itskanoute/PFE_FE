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
