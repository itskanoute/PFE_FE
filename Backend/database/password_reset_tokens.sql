-- Table pour la réinitialisation de mot de passe
-- Exécuter : mysql -u root -p edumanage < database/password_reset_tokens.sql

USE edumanage;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
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
