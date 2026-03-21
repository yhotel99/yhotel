-- Create vouchers table + permissions for voucher management (aligned with yhotel-dashboard)

SET search_path = public;

CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS vouchers_code_unique ON vouchers (lower(code)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vouchers_is_active ON vouchers (is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vouchers_created_at ON vouchers (created_at DESC) WHERE deleted_at IS NULL;

INSERT INTO permissions (name, description)
VALUES
  ('view:vouchers', 'View vouchers management page and list vouchers'),
  ('create:vouchers', 'Create vouchers'),
  ('update:vouchers', 'Update vouchers'),
  ('delete:vouchers', 'Delete vouchers')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'admin'::user_role, id FROM permissions WHERE name = 'view:vouchers'
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'manager'::user_role, id FROM permissions WHERE name = 'view:vouchers'
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'staff'::user_role, id FROM permissions WHERE name = 'view:vouchers'
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'admin'::user_role, id
FROM permissions
WHERE name IN ('create:vouchers', 'update:vouchers', 'delete:vouchers')
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'manager'::user_role, id
FROM permissions
WHERE name IN ('create:vouchers', 'update:vouchers', 'delete:vouchers')
ON CONFLICT (role, permission_id) DO NOTHING;
