-- ============================================================
-- EduManage / TP Assist — Schéma MySQL
-- Plateforme de gestion des assistants de TP
-- ============================================================

CREATE DATABASE IF NOT EXISTS edumanage
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE edumanage;

-- ------------------------------------------------------------
-- Écoles
-- ------------------------------------------------------------
CREATE TABLE schools (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  acronym         VARCHAR(50)  NOT NULL,
  email_domain    VARCHAR(100) NOT NULL COMMENT 'Ex: escp.eu (sans @)',
  address         VARCHAR(500) NOT NULL,
  city            VARCHAR(100) NOT NULL,
  phone           VARCHAR(30)  NOT NULL,
  logo_url        VARCHAR(500) NULL,
  hourly_rate     DECIMAL(8, 2) NOT NULL DEFAULT 12.00 COMMENT 'Taux horaire pour export paie',
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_schools_acronym (acronym),
  UNIQUE KEY uq_schools_email_domain (email_domain)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Filières (configurées par l'admin école)
-- ------------------------------------------------------------
CREATE TABLE filieres (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  school_id       INT UNSIGNED NOT NULL,
  name            VARCHAR(150) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_filieres_school_name (school_id, name),
  CONSTRAINT fk_filieres_school
    FOREIGN KEY (school_id) REFERENCES schools(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Utilisateurs (admin, responsable, étudiant)
-- ------------------------------------------------------------
CREATE TABLE users (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  school_id             INT UNSIGNED NULL COMMENT 'NULL uniquement si compte système',
  email                 VARCHAR(255) NOT NULL,
  password_hash         VARCHAR(255) NOT NULL,
  role                  ENUM('admin', 'responsable', 'etudiant') NOT NULL,
  first_name            VARCHAR(100) NOT NULL,
  last_name             VARCHAR(100) NOT NULL,
  phone                 VARCHAR(30) NULL,
  is_active             TINYINT(1) NOT NULL DEFAULT 1,
  must_change_password  TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Responsables créés par admin',
  last_login_at         TIMESTAMP NULL,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_users_email (email),
  KEY idx_users_school_role (school_id, role),
  CONSTRAINT fk_users_school
    FOREIGN KEY (school_id) REFERENCES schools(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Profil étudiant
-- ------------------------------------------------------------
CREATE TABLE student_profiles (
  user_id           INT UNSIGNED PRIMARY KEY,
  school_id         INT UNSIGNED NOT NULL,
  student_number    VARCHAR(50) NOT NULL,
  filiere_id        INT UNSIGNED NULL,
  major             VARCHAR(150) NOT NULL COMMENT 'Filière / formation affichée',
  study_year        ENUM('L1', 'L2', 'L3', 'M1', 'M2') NOT NULL,
  account_holder    VARCHAR(200) NULL,
  iban              VARCHAR(34) NULL,
  bic               VARCHAR(11) NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_student_school_number (school_id, student_number),
  CONSTRAINT fk_student_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_student_school
    FOREIGN KEY (school_id) REFERENCES schools(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_student_filiere
    FOREIGN KEY (filiere_id) REFERENCES filieres(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Profil responsable pédagogique
-- ------------------------------------------------------------
CREATE TABLE responsable_profiles (
  user_id       INT UNSIGNED PRIMARY KEY,
  school_id     INT UNSIGNED NOT NULL,
  department    VARCHAR(150) NOT NULL COMMENT 'Département / matière',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_responsable_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_responsable_school
    FOREIGN KEY (school_id) REFERENCES schools(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Offres d'assistanat
-- ------------------------------------------------------------
CREATE TABLE offers (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  school_id         INT UNSIGNED NOT NULL,
  responsable_id    INT UNSIGNED NOT NULL,
  subject           VARCHAR(200) NOT NULL COMMENT 'Matière',
  level             VARCHAR(150) NOT NULL COMMENT 'Ex: L3 Informatique',
  weekly_hours      DECIMAL(4, 1) NOT NULL,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  description       TEXT NOT NULL,
  required_skills   VARCHAR(500) NULL,
  min_grade         DECIMAL(4, 2) NULL COMMENT 'Note minimum sur 20',
  status            ENUM('active', 'closed') NOT NULL DEFAULT 'active',
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_offers_school_status (school_id, status),
  KEY idx_offers_responsable (responsable_id),
  CONSTRAINT fk_offers_school
    FOREIGN KEY (school_id) REFERENCES schools(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_offers_responsable
    FOREIGN KEY (responsable_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Candidatures
-- ------------------------------------------------------------
CREATE TABLE applications (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  offer_id            INT UNSIGNED NOT NULL,
  student_id          INT UNSIGNED NOT NULL,
  motivation          TEXT NOT NULL,
  grade_obtained      DECIMAL(4, 2) NULL,
  availability        JSON NULL COMMENT 'Créneaux préférés (ex: lundi_matin, mardi_aprem)',
  cv_url              VARCHAR(500) NULL COMMENT 'Chemin relatif du CV PDF uploadé',
  status              ENUM('pending', 'accepted', 'rejected', 'withdrawn') NOT NULL DEFAULT 'pending',
  rejection_reason    VARCHAR(255) NULL,
  reviewer_comment    TEXT NULL,
  applied_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at         TIMESTAMP NULL,
  reviewed_by         INT UNSIGNED NULL,

  UNIQUE KEY uq_application_offer_student (offer_id, student_id),
  KEY idx_applications_status (status),
  CONSTRAINT fk_applications_offer
    FOREIGN KEY (offer_id) REFERENCES offers(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_applications_student
    FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_applications_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Séances de TP
-- ------------------------------------------------------------
CREATE TABLE sessions (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  offer_id              INT UNSIGNED NOT NULL,
  responsable_id        INT UNSIGNED NOT NULL,
  session_date          DATE NOT NULL,
  start_time            TIME NOT NULL,
  end_time              TIME NOT NULL,
  room                  VARCHAR(100) NOT NULL,
  recurrence_type       ENUM('none', 'weekly', 'biweekly') NOT NULL DEFAULT 'none',
  recurrence_group_id   CHAR(36) NULL COMMENT 'UUID pour lier les séances récurrentes',
  notes                 TEXT NULL,
  status                ENUM('scheduled', 'cancelled', 'completed') NOT NULL DEFAULT 'scheduled',
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_sessions_date (session_date),
  KEY idx_sessions_offer (offer_id),
  KEY idx_sessions_responsable (responsable_id),
  CONSTRAINT fk_sessions_offer
    FOREIGN KEY (offer_id) REFERENCES offers(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_sessions_responsable
    FOREIGN KEY (responsable_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Affectations assistant ↔ séance
-- ------------------------------------------------------------
CREATE TABLE session_assignments (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id            INT UNSIGNED NOT NULL,
  student_id            INT UNSIGNED NOT NULL,
  status                ENUM('assigned', 'cancelled_by_student', 'completed') NOT NULL DEFAULT 'assigned',
  assigned_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cancelled_at          TIMESTAMP NULL,
  cancellation_reason   VARCHAR(500) NULL,

  UNIQUE KEY uq_assignment_session_student (session_id, student_id),
  KEY idx_assignments_student (student_id),
  KEY idx_assignments_status (status),
  CONSTRAINT fk_assignments_session
    FOREIGN KEY (session_id) REFERENCES sessions(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_assignments_student
    FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Heures (validation par le responsable)
-- ------------------------------------------------------------
CREATE TABLE hour_records (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id          INT UNSIGNED NOT NULL,
  assignment_id       INT UNSIGNED NOT NULL,
  student_id          INT UNSIGNED NOT NULL,
  responsable_id      INT UNSIGNED NOT NULL,
  duration_hours      DECIMAL(4, 2) NOT NULL,
  status              ENUM('pending', 'validated', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  rejection_reason    VARCHAR(255) NULL,
  reviewer_comment    TEXT NULL,
  validated_at        TIMESTAMP NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_hour_session_assignment (session_id, assignment_id),
  KEY idx_hours_student_status (student_id, status),
  KEY idx_hours_responsable (responsable_id),
  CONSTRAINT fk_hours_session
    FOREIGN KEY (session_id) REFERENCES sessions(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_hours_assignment
    FOREIGN KEY (assignment_id) REFERENCES session_assignments(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_hours_student
    FOREIGN KEY (student_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_hours_responsable
    FOREIGN KEY (responsable_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Notifications
-- ------------------------------------------------------------
CREATE TABLE notifications (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED NOT NULL,
  type                VARCHAR(50) NOT NULL COMMENT 'Ex: session_cancelled, application_accepted',
  title               VARCHAR(255) NOT NULL,
  message             TEXT NOT NULL,
  related_entity_type VARCHAR(50) NULL COMMENT 'session, application, offer...',
  related_entity_id   INT UNSIGNED NULL,
  is_read             TINYINT(1) NOT NULL DEFAULT 0,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_notifications_user_read (user_id, is_read),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Historique des exports mensuels (paie)
-- ------------------------------------------------------------
CREATE TABLE monthly_exports (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  school_id       INT UNSIGNED NOT NULL,
  export_month    DATE NOT NULL COMMENT 'Premier jour du mois exporté',
  format          ENUM('csv', 'xlsx') NOT NULL,
  total_hours     DECIMAL(8, 2) NOT NULL,
  total_amount    DECIMAL(10, 2) NOT NULL,
  assistant_count INT UNSIGNED NOT NULL DEFAULT 0,
  exported_by     INT UNSIGNED NOT NULL,
  file_path       VARCHAR(500) NULL,
  exported_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_export_school_month (school_id, export_month),
  CONSTRAINT fk_exports_school
    FOREIGN KEY (school_id) REFERENCES schools(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_exports_admin
    FOREIGN KEY (exported_by) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Journal d'activité (tableau de bord admin)
-- ------------------------------------------------------------
CREATE TABLE activity_logs (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  school_id       INT UNSIGNED NOT NULL,
  actor_id        INT UNSIGNED NULL,
  action          VARCHAR(100) NOT NULL,
  description     TEXT NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_activity_school_date (school_id, created_at),
  CONSTRAINT fk_activity_school
    FOREIGN KEY (school_id) REFERENCES schools(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_activity_actor
    FOREIGN KEY (actor_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tokens de réinitialisation de mot de passe
-- ------------------------------------------------------------
CREATE TABLE password_reset_tokens (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  token_hash      CHAR(64) NOT NULL COMMENT 'SHA-256 du token envoyé par email',
  expires_at      TIMESTAMP NOT NULL,
  used_at         TIMESTAMP NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_reset_token_hash (token_hash),
  KEY idx_reset_user_active (user_id, used_at, expires_at),
  CONSTRAINT fk_reset_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
