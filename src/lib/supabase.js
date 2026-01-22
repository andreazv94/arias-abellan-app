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
    .eq('role_type', 'client')
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

// ==================== PROFESIONALES ====================

export const getProfessionals = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role_type', ['admin', 'nutritionist', 'trainer'])
    .order('created_at', { ascending: false })
  return { data, error }
}

export const createProfessional = async (email, password, fullName, roleType) => {
  // Crear usuario en auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        full_name: fullName,
        role_type: roleType
      }
    }
  })
  
  if (authError) return { data: null, error: authError }
  
  // Crear perfil en la tabla profiles
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email: email,
      full_name: fullName,
      role: roleType,
      role_type: roleType,
      is_active: true
    })
    .select()
    .single()
  
  if (profileError) return { data: null, error: profileError }
  
  return { data: profileData, error: null }
}

export const updateProfessional = async (professionalId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', professionalId)
    .select()
    .single()
  return { data, error }
}

export const deleteProfessional = async (professionalId) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', professionalId)
  return { error }
}

// ==================== PLANTILLAS DE BONOS ====================

export const getBonoTemplates = async () => {
  const { data, error } = await supabase
    .from('bono_templates')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const createBonoTemplate = async (templateData) => {
  const { data, error } = await supabase
    .from('bono_templates')
    .insert(templateData)
    .select()
    .single()
  return { data, error }
}

export const updateBonoTemplate = async (templateId, updates) => {
  const { data, error } = await supabase
    .from('bono_templates')
    .update(updates)
    .eq('id', templateId)
    .select()
    .single()
  return { data, error }
}

export const deleteBonoTemplate = async (templateId) => {
  const { error } = await supabase
    .from('bono_templates')
    .update({ is_active: false })
    .eq('id', templateId)
  return { error }
}

// ==================== BIBLIOTECA DE COMIDAS ====================

export const getMealLibrary = async () => {
  const { data, error } = await supabase
    .from('meal_library')
    .select('*')
    .eq('is_public', true)
    .order('meal_type')
  return { data, error }
}

export const createMealInLibrary = async (mealData) => {
  const { data, error } = await supabase
    .from('meal_library')
    .insert(mealData)
    .select()
    .single()
  return { data, error }
}

export const updateMealInLibrary = async (mealId, updates) => {
  const { data, error } = await supabase
    .from('meal_library')
    .update(updates)
    .eq('id', mealId)
    .select()
    .single()
  return { data, error }
}

export const deleteMealFromLibrary = async (mealId) => {
  const { error } = await supabase
    .from('meal_library')
    .delete()
    .eq('id', mealId)
  return { error }
}

// ==================== PLANTILLAS DE ENTRENAMIENTOS ====================

export const getWorkoutTemplates = async () => {
  const { data, error } = await supabase
    .from('workout_templates')
    .select(`
      *,
      exercises:exercise_library(*)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const createWorkoutTemplate = async (templateData, exercises) => {
  // Crear la plantilla
  const { data: template, error: templateError } = await supabase
    .from('workout_templates')
    .insert(templateData)
    .select()
    .single()
  
  if (templateError) return { data: null, error: templateError }
  
  // Añadir ejercicios
  if (exercises && exercises.length > 0) {
    const exercisesWithTemplate = exercises.map((ex, idx) => ({
      template_id: template.id,
      name: ex.name,
      exercise_type: ex.exercise_type || 'strength',
      sets: ex.sets || 3,
      reps: ex.reps || '10',
      rest: ex.rest || '60s',
      weight: ex.weight,
      notes: ex.notes,
      order_index: idx
    }))
    
    await supabase
      .from('exercise_library')
      .insert(exercisesWithTemplate)
  }
  
  return { data: template, error: null }
}

export const updateWorkoutTemplate = async (templateId, updates) => {
  const { data, error } = await supabase
    .from('workout_templates')
    .update(updates)
    .eq('id', templateId)
    .select()
    .single()
  return { data, error }
}

export const deleteWorkoutTemplate = async (templateId) => {
  const { error } = await supabase
    .from('workout_templates')
    .delete()
    .eq('id', templateId)
  return { error }
}

// ==================== CITAS ====================

export const getAppointments = async (filters = {}) => {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      client:client_id(id, full_name, email),
      professional:professional_id(id, full_name, role_type)
    `)
    .order('appointment_date', { ascending: true })
  
  if (filters.professionalId) {
    query = query.eq('professional_id', filters.professionalId)
  }
  
  if (filters.clientId) {
    query = query.eq('client_id', filters.clientId)
  }
  
  if (filters.date) {
    const startOfDay = new Date(filters.date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(filters.date)
    endOfDay.setHours(23, 59, 59, 999)
    query = query.gte('appointment_date', startOfDay.toISOString())
                 .lte('appointment_date', endOfDay.toISOString())
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  
  const { data, error } = await query
  return { data, error }
}

export const createAppointment = async (appointmentData) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single()
  return { data, error }
}

export const updateAppointment = async (appointmentId, updates) => {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .select()
    .single()
  return { data, error }
}

export const deleteAppointment = async (appointmentId) => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId)
  return { error }
}

// ==================== HISTORIAL DE CONSULTAS ====================

export const getConsultationHistory = async (clientId) => {
  const { data, error } = await supabase
    .from('consultation_history')
    .select(`
      *,
      appointment:appointment_id(*),
      professional:professional_id(full_name)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const createConsultationRecord = async (recordData) => {
  const { data, error } = await supabase
    .from('consultation_history')
    .insert(recordData)
    .select()
    .single()
  return { data, error }
}

// ==================== ESTADÍSTICAS ====================

export const getDashboardStats = async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Clientes activos
  const { data: activeClients } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .eq('role_type', 'client')
    .eq('status', 'active')
  
  // Citas de hoy
  const { data: todayAppointments } = await supabase
    .from('appointments')
    .select('id', { count: 'exact' })
    .gte('appointment_date', today.toISOString())
    .lt('appointment_date', tomorrow.toISOString())
    .eq('status', 'scheduled')
  
  // Bonos por caducar (próximos 7 días)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const { data: expiringBonos } = await supabase
    .from('client_bonos')
    .select('id', { count: 'exact' })
    .gte('expiry_date', today.toISOString().split('T')[0])
    .lte('expiry_date', nextWeek.toISOString().split('T')[0])
    .eq('is_active', true)
  
  return {
    activeClients: activeClients?.length || 0,
    todayAppointments: todayAppointments?.length || 0,
    expiringBonos: expiringBonos?.length || 0
  }
}
