-- Script d'initialisation PostgreSQL
-- Création de la base de données si nécessaire

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vérifier la version
SELECT version();
