

DROP TABLE IF EXISTS event_media CASCADE;
DROP TABLE IF EXISTS event_medias CASCADE;

DROP TABLE IF EXISTS event CASCADE;
DROP TABLE IF EXISTS events CASCADE;

DROP TABLE IF EXISTS orders CASCADE;

DROP TABLE IF EXISTS login_attempts CASCADE;
DROP TABLE IF EXISTS login_attempt CASCADE;

DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS admin CASCADE;

DROP TABLE IF EXISTS tokens CASCADE;
DROP TABLE IF EXISTS token CASCADE;

DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS user_role CASCADE;

DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS role CASCADE;

DROP TABLE IF EXISTS user_auth_providers CASCADE;
DROP TABLE IF EXISTS user_auth_provider CASCADE;

DROP TABLE IF EXISTS auth_providers CASCADE;
DROP TABLE IF EXISTS auth_provider CASCADE;

DROP TABLE IF EXISTS subscription_packages CASCADE;
DROP TABLE IF EXISTS subscription_package CASCADE;

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    guid VARCHAR(255) NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    last_signed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);


CREATE TABLE auth_providers (
    id SERIAL PRIMARY KEY,
    guid VARCHAR(255) NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_auth_providers_name ON auth_providers(name);


CREATE TABLE user_auth_providers (
    id SERIAL PRIMARY KEY,
    guid VARCHAR(255) NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
    user_id INTEGER NOT NULL,
    auth_provider_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_auth_providers_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_auth_providers_auth_provider_id FOREIGN KEY (auth_provider_id) REFERENCES auth_providers(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_auth_providers_unique UNIQUE(user_id, auth_provider_id)
);
CREATE INDEX idx_user_auth_providers_user_id ON user_auth_providers(user_id);
CREATE INDEX idx_user_auth_providers_auth_provider_id ON user_auth_providers(auth_provider_id);


CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    guid VARCHAR(255) NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_roles_name ON roles(name);


CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    guid VARCHAR(255) NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_roles_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_roles_unique UNIQUE(user_id, role_id)
);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);


CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    guid VARCHAR(255) NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
    token VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL,
    CONSTRAINT fk_tokens_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_tokens_user_id ON tokens(user_id);
CREATE INDEX idx_tokens_type ON tokens(type);
CREATE INDEX idx_tokens_expires_at ON tokens(expires_at);
CREATE INDEX idx_tokens_token ON tokens(token);


CREATE TABLE admins (
    id SERIAL NOT NULL,
    guid VARCHAR(255) NOT NULL DEFAULT (gen_random_uuid())::text,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP(6) NULL,
    CONSTRAINT admins_pkey PRIMARY KEY (id),
    CONSTRAINT admins_guid_key UNIQUE (guid),
    CONSTRAINT admins_user_id_key UNIQUE (user_id),
    CONSTRAINT fk_admins_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);
CREATE INDEX idx_admins_user_id ON admins(user_id);


CREATE TABLE login_attempts (
    id SERIAL NOT NULL,
    guid VARCHAR(255) NOT NULL DEFAULT (gen_random_uuid())::text,
    email_attempted VARCHAR(255) NOT NULL,
    user_id INTEGER NULL,
    is_success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100) NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(500) NULL,
    metadata JSONB NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT login_attempts_pkey PRIMARY KEY (id),
    CONSTRAINT login_attempts_guid_key UNIQUE (guid),
    CONSTRAINT fk_login_attempts_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);
CREATE INDEX idx_login_attempts_email_lockout ON login_attempts(email_attempted, is_success, created_at DESC);
CREATE INDEX idx_login_attempts_ip_rate_limit ON login_attempts(ip_address, is_success, created_at DESC);
CREATE INDEX idx_login_attempts_user_history ON login_attempts(user_id, created_at DESC);


CREATE TABLE subscription_packages (
    id SERIAL NOT NULL,
    guid VARCHAR(255) NOT NULL DEFAULT gen_random_uuid()::TEXT,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    price INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    max_media_count INTEGER NOT NULL,
    max_media_size BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP(6) NULL,
    CONSTRAINT subscription_packages_pkey PRIMARY KEY (id),
    CONSTRAINT subscription_packages_guid_key UNIQUE (guid),
    CONSTRAINT subscription_packages_name_key UNIQUE (name),
    CONSTRAINT check_subscription_packages_price CHECK (price >= 0),
    CONSTRAINT check_subscription_packages_max_media_count CHECK (max_media_count > 0),
    CONSTRAINT check_subscription_packages_max_media_size CHECK (max_media_size > 0)
);
CREATE INDEX idx_subscription_packages_active ON subscription_packages(is_active);


CREATE TABLE events (
    id SERIAL NOT NULL,
    guid VARCHAR(255) NOT NULL DEFAULT (gen_random_uuid())::TEXT,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    type VARCHAR(50) NOT NULL,
    start_date TIMESTAMP(6) NOT NULL,
    end_date TIMESTAMP(6) NOT NULL,
    max_media_allowed INTEGER NULL,
    max_storage_bytes BIGINT NULL,
    current_media_count INTEGER NOT NULL DEFAULT 0,
    current_storage_bytes BIGINT NOT NULL DEFAULT 0,
    user_id INTEGER NOT NULL,
    metadata JSONB NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT events_pkey PRIMARY KEY (id),
    CONSTRAINT events_guid_key UNIQUE (guid),
    CONSTRAINT fk_events_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT check_events_dates CHECK (end_date > start_date)
);
CREATE INDEX idx_events_user_status ON events(user_id, status);

CREATE TABLE event_media (
    id SERIAL NOT NULL,
    guid VARCHAR(255) NOT NULL DEFAULT (gen_random_uuid())::TEXT,
    guest_name VARCHAR(255) NULL DEFAULT 'Anonymous Guest',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    mime_type VARCHAR(50) NOT NULL,
    storage_key VARCHAR(512) NOT NULL,
    thumbnail_key VARCHAR(512) NULL,
    file_size_bytes BIGINT NOT NULL,
    metadata JSONB NULL,
    event_id INTEGER NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT event_media_pkey PRIMARY KEY (id),
    CONSTRAINT event_media_guid_key UNIQUE (guid),
    CONSTRAINT fk_event_media_event_id FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE NO ACTION);
CREATE INDEX idx_event_media_gallery ON event_media(event_id, status, created_at DESC);


CREATE TABLE orders (
    id SERIAL NOT NULL,
    guid VARCHAR(255) NOT NULL DEFAULT (gen_random_uuid())::TEXT,

    user_id INTEGER NOT NULL,
    package_id INTEGER NULL,
    event_id INTEGER NULL UNIQUE,

    package_name VARCHAR(255) NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',

    max_media_allowed INTEGER NOT NULL,
    max_storage_bytes BIGINT NOT NULL,

    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_provider VARCHAR(50) NOT NULL,
    provider_order_id VARCHAR(255) NULL,
    provider_payment_id VARCHAR(255) NULL,

    metadata JSONB NULL,
    paid_at TIMESTAMP(6) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT orders_guid_key UNIQUE (guid),
    CONSTRAINT fk_orders_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT fk_orders_package_id FOREIGN KEY (package_id) REFERENCES subscription_packages(id) ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT fk_orders_event_id FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL ON UPDATE NO ACTION);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_provider_order_id ON orders(payment_provider, provider_order_id);
