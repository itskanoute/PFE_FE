-- Ajoute la colonne CV aux candidatures (bases déjà créées)
USE edumanage;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS cv_url VARCHAR(500) NULL
  COMMENT 'Chemin relatif du CV PDF uploadé'
  AFTER availability;
