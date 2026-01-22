-- =============================================
-- AMPLIAR DATOS DE CLIENTES PARA PLANES NUTRICIONALES
-- =============================================

-- Añadir campos completos a la tabla profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS weight DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS height DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS goal TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Migrar full_name existente a first_name y last_name si es posible
UPDATE profiles
SET first_name = SPLIT_PART(full_name, ' ', 1),
    last_name = SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
WHERE full_name IS NOT NULL AND first_name IS NULL;

-- Verificar los cambios
SELECT id, email, first_name, last_name, phone, weight, height FROM profiles LIMIT 5;
