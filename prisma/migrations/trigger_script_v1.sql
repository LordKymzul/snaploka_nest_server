CREATE OR REPLACE FUNCTION assign_default_user_role() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO user_roles (guid, user_id, role_id, created_at, updated_at)
VALUES (
        gen_random_uuid()::TEXT,
        NEW.id,
        (
            SELECT id
            FROM roles
            WHERE name = 'USER'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_assign_default_user_role
AFTER
INSERT ON users FOR EACH ROW EXECUTE FUNCTION assign_default_user_role();


CREATE OR REPLACE FUNCTION assign_default_admin_role() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO user_roles (guid, user_id, role_id, created_at, updated_at)
VALUES (
        gen_random_uuid()::TEXT,
        NEW.user_id,
        -- ⚠️ Change to NEW.id if admin.id is the user_id
        (
            SELECT id
            FROM roles
            WHERE name = 'ADMIN'
            LIMIT 1
        ), CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) ON CONFLICT (user_id, role_id) DO NOTHING;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_assign_default_admin_role
AFTER
INSERT ON admins FOR EACH ROW EXECUTE FUNCTION assign_default_admin_role();