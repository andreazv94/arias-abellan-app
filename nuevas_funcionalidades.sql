-- =============================================
-- AÑADIR NUEVAS FUNCIONALIDADES A LA APP
-- =============================================

-- 1. Añadir campos a la tabla profiles para nutricionista y próxima consulta
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS nutritionist TEXT DEFAULT 'Carlos Arias',
ADD COLUMN IF NOT EXISTS next_appointment TIMESTAMP WITH TIME ZONE;

-- 2. Crear tabla de bonos
CREATE TABLE IF NOT EXISTS client_bonos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bono_type TEXT NOT NULL, -- 'mensual', 'trimestral', 'anual', etc.
  sessions_total INTEGER NOT NULL DEFAULT 0,
  sessions_used INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla de horarios de entreno
CREATE TABLE IF NOT EXISTS training_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Lunes, 7=Domingo
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  trainer TEXT DEFAULT 'Carlos',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, day_of_week, start_time)
);

-- 4. Modificar tabla workout_routines para añadir más detalles
ALTER TABLE workout_routines 
ADD COLUMN IF NOT EXISTS workout_type TEXT DEFAULT 'fuerza', -- 'fuerza', 'cardio', 'hiit', etc.
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 5. Modificar tabla exercises para añadir más información
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS exercise_type TEXT DEFAULT 'fuerza', -- 'fuerza', 'cardio', etc.
ADD COLUMN IF NOT EXISTS weight TEXT, -- peso utilizado
ADD COLUMN IF NOT EXISTS tempo TEXT; -- tempo de ejecución

-- Desactivar RLS en las nuevas tablas
ALTER TABLE client_bonos DISABLE ROW LEVEL SECURITY;
ALTER TABLE training_schedule DISABLE ROW LEVEL SECURITY;

-- Triggers para updated_at
CREATE OR REPLACE TRIGGER update_client_bonos_updated_at
  BEFORE UPDATE ON client_bonos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =============================================

-- Puedes descomentar esto para añadir datos de prueba
/*
INSERT INTO client_bonos (client_id, bono_type, sessions_total, sessions_used, start_date, expiry_date, notes)
SELECT id, 'Mensual', 8, 2, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'Bono de 8 sesiones'
FROM profiles WHERE role = 'client' LIMIT 1;

INSERT INTO training_schedule (client_id, day_of_week, start_time, end_time, trainer)
SELECT id, 1, '09:00', '10:00', 'Carlos'
FROM profiles WHERE role = 'client' AND has_training = true LIMIT 1;
*/
