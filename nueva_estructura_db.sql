-- =============================================
-- NUEVA ESTRUCTURA COMPLETA DE BASE DE DATOS
-- =============================================

-- 1. Actualizar tabla profiles para incluir más roles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role_type TEXT DEFAULT 'client' CHECK (role_type IN ('admin', 'nutritionist', 'trainer', 'client')),
ADD COLUMN IF NOT EXISTS assigned_nutritionist UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS assigned_trainer UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'));

-- Migrar datos existentes de role a role_type
UPDATE profiles SET role_type = 
  CASE 
    WHEN role = 'admin' THEN 'admin'
    WHEN role = 'client' THEN 'client'
    ELSE 'client'
  END
WHERE role_type = 'client';

-- 2. Tabla de tipos de bonos (plantillas)
CREATE TABLE IF NOT EXISTS bono_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  sessions_included INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('nutrition', 'training', 'both')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Actualizar tabla client_bonos para referenciar templates
ALTER TABLE client_bonos 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES bono_templates(id),
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS purchased_date DATE DEFAULT CURRENT_DATE;

-- 4. Tabla de comidas predefinidas (biblioteca)
CREATE TABLE IF NOT EXISTS meal_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'mid_morning', 'lunch', 'snack', 'dinner')),
  description TEXT,
  calories INTEGER DEFAULT 0,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fat INTEGER DEFAULT 0,
  ingredients TEXT,
  preparation TEXT,
  created_by UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de plantillas de entrenamientos
CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('strength', 'cardio', 'hiit', 'flexibility', 'mixed')),
  duration INTEGER DEFAULT 60,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_by UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de ejercicios predefinidos para plantillas
CREATE TABLE IF NOT EXISTS exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  exercise_type TEXT DEFAULT 'strength',
  sets INTEGER DEFAULT 3,
  reps TEXT DEFAULT '10',
  rest TEXT DEFAULT '60s',
  weight TEXT,
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabla de citas (consultas nutricionales)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('nutrition', 'training', 'evaluation')),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Actualizar training_schedule para diferenciar entrenos personales
ALTER TABLE training_schedule 
ADD COLUMN IF NOT EXISTS is_personal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id);

-- 9. Tabla de historial de consultas
CREATE TABLE IF NOT EXISTS consultation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  weight DECIMAL(5, 2),
  body_fat_percentage DECIMAL(5, 2),
  muscle_mass DECIMAL(5, 2),
  notes TEXT,
  next_goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desactivar RLS en todas las nuevas tablas
ALTER TABLE bono_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE meal_library DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_library DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_history DISABLE ROW LEVEL SECURITY;

-- Triggers para updated_at
CREATE OR REPLACE TRIGGER update_bono_templates_updated_at
  BEFORE UPDATE ON bono_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_meal_library_updated_at
  BEFORE UPDATE ON meal_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_workout_templates_updated_at
  BEFORE UPDATE ON workout_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =============================================

-- Insertar bonos de ejemplo
INSERT INTO bono_templates (name, description, duration_days, sessions_included, price, service_type) VALUES
('Bono Mensual Nutrición', '8 sesiones de nutrición', 30, 8, 120.00, 'nutrition'),
('Bono Trimestral Nutrición', '24 sesiones de nutrición', 90, 24, 320.00, 'nutrition'),
('Bono Mensual Entrenamiento', '12 sesiones de entrenamiento personal', 30, 12, 200.00, 'training'),
('Bono Completo Mensual', 'Nutrición + Entrenamiento', 30, 20, 300.00, 'both')
ON CONFLICT DO NOTHING;

-- Insertar comidas de ejemplo
INSERT INTO meal_library (name, meal_type, description, calories, protein, carbs, fat, ingredients) VALUES
('Tostadas con aguacate y huevo', 'breakfast', 'Desayuno completo y equilibrado', 450, 20, 35, 25, '2 rebanadas de pan integral, 1 aguacate, 2 huevos, sal, pimienta'),
('Yogur griego con frutos rojos', 'mid_morning', 'Snack proteico', 180, 15, 20, 5, 'Yogur griego natural, frutos rojos, miel'),
('Pollo a la plancha con verduras', 'lunch', 'Almuerzo proteico', 520, 45, 40, 15, 'Pechuga de pollo, brócoli, zanahoria, arroz integral'),
('Batido de proteína con plátano', 'snack', 'Merienda post-entreno', 250, 25, 30, 3, 'Proteína whey, plátano, leche desnatada'),
('Salmón al horno con espárragos', 'dinner', 'Cena ligera y nutritiva', 480, 40, 25, 22, 'Filete de salmón, espárragos, patata, aceite de oliva')
ON CONFLICT DO NOTHING;

-- Insertar plantillas de entrenamientos
INSERT INTO workout_templates (name, description, workout_type, duration, difficulty) VALUES
('Fuerza Tren Superior', 'Rutina de fuerza para pecho, espalda y brazos', 'strength', 60, 'intermediate'),
('Fuerza Tren Inferior', 'Rutina de piernas y glúteos', 'strength', 60, 'intermediate'),
('Cardio HIIT', 'Entrenamiento de alta intensidad', 'hiit', 30, 'advanced'),
('Movilidad y Flexibilidad', 'Sesión de estiramientos y movilidad', 'flexibility', 45, 'beginner')
ON CONFLICT DO NOTHING;
