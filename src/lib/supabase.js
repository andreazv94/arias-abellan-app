import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Faltan las variables de entorno de Supabase')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// ==================== AUTH ====================

export const signUp = async (email, password, fullName, role = 'client') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role
      }
    }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

// ==================== CLIENTS (Admin) ====================

export const getClients = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })
  return { data, error }
}

export const updateClient = async (clientId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', clientId)
    .select()
    .single()
  return { data, error }
}

export const createClientAccount = async (email, password, fullName, phone, hasTraining) => {
  // Crear usuario en auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'client'
    }
  })
  
  if (authError) {
    // Si no tienes acceso a admin, usar signUp normal
    const { data, error } = await signUp(email, password, fullName, 'client')
    if (error) return { data: null, error }
    
    // Actualizar perfil con datos adicionales
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ phone, has_training: hasTraining })
        .eq('id', data.user.id)
    }
    return { data, error: null }
  }
  
  // Actualizar perfil con datos adicionales
  if (authData.user) {
    await supabase
      .from('profiles')
      .update({ phone, has_training: hasTraining })
      .eq('id', authData.user.id)
  }
  
  return { data: authData, error: null }
}

// ==================== MEAL PLANS ====================

export const getMealPlans = async (clientId) => {
  const { data, error } = await supabase
    .from('meal_plans')
    .select(`
      *,
      meals (*)
    `)
    .eq('client_id', clientId)
    .order('day_of_week')
  return { data, error }
}

export const upsertMealPlan = async (clientId, dayOfWeek, meals) => {
  // Primero crear o actualizar el plan del día
  const { data: planData, error: planError } = await supabase
    .from('meal_plans')
    .upsert({
      client_id: clientId,
      day_of_week: dayOfWeek
    }, {
      onConflict: 'client_id,day_of_week'
    })
    .select()
    .single()
  
  if (planError) return { data: null, error: planError }
  
  // Luego actualizar las comidas
  for (const meal of meals) {
    await supabase
      .from('meals')
      .upsert({
        meal_plan_id: planData.id,
        meal_type: meal.meal_type,
        name: meal.name,
        time: meal.time,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        notes: meal.notes
      }, {
        onConflict: 'meal_plan_id,meal_type'
      })
  }
  
  return { data: planData, error: null }
}

// ==================== WORKOUT ROUTINES ====================

export const getWorkoutRoutines = async (clientId) => {
  const { data, error } = await supabase
    .from('workout_routines')
    .select(`
      *,
      exercises (*)
    `)
    .eq('client_id', clientId)
    .order('day_of_week')
  return { data, error }
}

export const upsertWorkoutRoutine = async (clientId, dayOfWeek, name, duration, exercises) => {
  // Crear o actualizar rutina
  const { data: routineData, error: routineError } = await supabase
    .from('workout_routines')
    .upsert({
      client_id: clientId,
      day_of_week: dayOfWeek,
      name,
      duration
    }, {
      onConflict: 'client_id,day_of_week'
    })
    .select()
    .single()
  
  if (routineError) return { data: null, error: routineError }
  
  // Eliminar ejercicios anteriores
  await supabase
    .from('exercises')
    .delete()
    .eq('routine_id', routineData.id)
  
  // Insertar nuevos ejercicios
  if (exercises && exercises.length > 0) {
    const exercisesWithRoutine = exercises.map((ex, index) => ({
      routine_id: routineData.id,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
      notes: ex.notes,
      order_index: index
    }))
    
    await supabase
      .from('exercises')
      .insert(exercisesWithRoutine)
  }
  
  return { data: routineData, error: null }
}

export const deleteWorkoutRoutine = async (routineId) => {
  const { error } = await supabase
    .from('workout_routines')
    .delete()
    .eq('id', routineId)
  return { error }
}

// ==================== BONOS ====================

export const getClientBonos = async (clientId) => {
  const { data, error } = await supabase
    .from('client_bonos')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const createBono = async (clientId, bonoData) => {
  const { data, error } = await supabase
    .from('client_bonos')
    .insert({
      client_id: clientId,
      bono_type: bonoData.bono_type,
      sessions_total: bonoData.sessions_total,
      sessions_used: bonoData.sessions_used || 0,
      start_date: bonoData.start_date,
      expiry_date: bonoData.expiry_date,
      notes: bonoData.notes
    })
    .select()
    .single()
  return { data, error }
}

export const updateBono = async (bonoId, updates) => {
  const { data, error } = await supabase
    .from('client_bonos')
    .update(updates)
    .eq('id', bonoId)
    .select()
    .single()
  return { data, error }
}

export const deleteBono = async (bonoId) => {
  const { error } = await supabase
    .from('client_bonos')
    .delete()
    .eq('id', bonoId)
  return { error }
}

// ==================== HORARIOS DE ENTRENO ====================

export const getTrainingSchedule = async (clientId) => {
  const { data, error } = await supabase
    .from('training_schedule')
    .select('*')
    .eq('client_id', clientId)
    .order('day_of_week')
  return { data, error }
}

export const upsertTrainingSchedule = async (clientId, scheduleData) => {
  const { data, error } = await supabase
    .from('training_schedule')
    .upsert({
      client_id: clientId,
      day_of_week: scheduleData.day_of_week,
      start_time: scheduleData.start_time,
      end_time: scheduleData.end_time,
      trainer: scheduleData.trainer || 'Carlos',
      notes: scheduleData.notes
    }, {
      onConflict: 'client_id,day_of_week,start_time'
    })
    .select()
    .single()
  return { data, error }
}

export const deleteTrainingSchedule = async (scheduleId) => {
  const { error } = await supabase
    .from('training_schedule')
    .delete()
    .eq('id', scheduleId)
  return { error }
}

// ==================== ACTUALIZAR PERFIL DEL CLIENTE ====================

export const updateClientProfile = async (clientId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', clientId)
    .select()
    .single()
  return { data, error }
}
