-- À exécuter si tu as importé seed.sql AVANT la correction du hash
-- Mot de passe après exécution : Password123!

USE edumanage;

UPDATE users
SET password_hash = '$2b$10$E27WF0Sz9Z195GuCuMP0NeEG/OaPJ/CW0IcdbKkG8L6Q3WZgD6r9a';
