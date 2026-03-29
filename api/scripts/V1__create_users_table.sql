-- ===========================================
-- V1__create_users_table.sql
-- Prefijo V1__ indica que es la versión 1 del esquema.
-- Convención: V{número}__{descripción}.sql
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- Habilita gen_random_uuid()

CREATE TABLE IF NOT EXISTS users (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    username     VARCHAR(50)   NOT NULL UNIQUE,
    email        VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url   TEXT,
    is_online    BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Índices para acelerar búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_users_email    ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- Trigger: actualiza updated_at automáticamente en cada UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
