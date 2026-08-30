-- Insert Auth Providers
INSERT INTO auth_providers (
        guid,
        name,
        description,
        is_active,
        metadata,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid()::TEXT,
        'GOOGLE',
        'Google OAuth 2.0 authentication provider',
        true,
        '{"provider_type": "oauth2", "icon": "google"}',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid()::TEXT,
        'APPLE',
        'Apple Sign In authentication provider',
        true,
        '{"provider_type": "oauth2", "icon": "apple"}',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid()::TEXT,
        'CUSTOM',
        'Custom email and password authentication',
        true,
        '{"provider_type": "custom", "icon": "email"}',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
-- Insert Roles
INSERT INTO roles (
        guid,
        name,
        description,
        is_active,
        metadata,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid()::TEXT,
        'ADMIN',
        'Administrator with full system access',
        true,
        '{"level": 5, "permissions": ["*"]}',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid()::TEXT,
        'USER',
        'Standard user role',
        true,
        '{"level": 1, "permissions": ["read", "profile"]}',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid()::TEXT,
        'STUDENT',
        'Standard student access to view courses and grades',
        true,
        '{"level": 1, "permissions": ["course.view", "grade.view", "profile.edit"]}',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        gen_random_uuid()::TEXT,
        'INSTRUCTOR',
        'Faculty access to manage courses and submit grades',
        true,
        '{"level": 3, "permissions": ["course.manage", "grade.edit", "student.view"]}',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
INSERT INTO subscription_packages (
        guid,
        name,
        description,
        price,
        currency,
        max_media_count,
        max_media_size,
        is_active,
        metadata
    )
VALUES (
        gen_random_uuid()::TEXT,
        'Starter Event',
        'Perfect for small birthday parties, baby showers, or intimate gatherings.',
        1900,
        -- $19.00 USD
        'USD',
        100,
        -- Up to 100 photos/videos
        524288000,
        -- 500 MB max total storage limit (in bytes)
        true,
        '{"features": ["Standard QR code generator", "Full resolution downloads", "7-day gallery availability"], "recommended_for": "Small private parties"}'::jsonb
    ),
    (
        gen_random_uuid()::TEXT,
        'Wedding Premium',
        'Designed for weddings and large celebrations with high guest activity.',
        4900,
        -- $49.00 USD
        'USD',
        500,
        -- Up to 500 photos/videos
        5368709120,
        -- 5 GB max total storage limit (in bytes)
        true,
        '{"features": ["Customized QR codes", "Live slideshow view for venue screens", "Full resolution zip download", "30-day gallery availability"], "recommended_for": "Weddings & Galas", "badge": "Most Popular"}'::jsonb
    ),
    (
        gen_random_uuid()::TEXT,
        'Corporate Enterprise',
        'Built for multi-day conferences, festivals, and large corporate events.',
        14900,
        -- $149.00 USD
        'USD',
        2500,
        -- Up to 2,500 photos/videos
        26843545600,
        -- 25 GB max total storage limit (in bytes)
        true,
        '{"features": ["Unlimited QR code generations", "Real-time guest upload moderation panel", "Bulk zip downloads", "Custom branding", "1-year gallery retention"], "recommended_for": "Corporate Events & Festivals"}'::jsonb
    );