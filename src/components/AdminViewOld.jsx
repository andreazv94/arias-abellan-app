import React, { useState, useEffect } from 'react'
import { Users, Utensils, Dumbbell, Plus, Trash2, Edit, Search, Check, X, ArrowLeft, LogOut, Save, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { signOut, getClients, updateClient, getMealPlans, getWorkoutRoutines, upsertMealPlan, upsertWorkoutRoutine, deleteWorkoutRoutine, signUp, getClientBonos, createBono, updateBono, deleteBono, getTrainingSchedule, upsertTrainingSchedule, deleteTrainingSchedule, updateClientProfile } from '../lib/supabase'

// Logo Component
const Logo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <path d="M50 12 L32 24 L26 50 L32 76 L50 88" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M50 12 L68 24 L74 50 L68 76 L50 88" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <ellipse cx="50" cy="50" rx="14" ry="32" stroke="currentColor" strokeWidth="2.5" fill="none"/>
  </svg>
)

export default function AdminView() {
  const { profile } = useAuth()
  const [currentView, setCurrentView] = useState('clients')
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  // Form states
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', password: '', hasTraining: false })
  const [selectedDay, setSelectedDay] = useState(0)
  const [mealPlans, setMealPlans] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [editingMeals, setEditingMeals] = useState({})
  const [editingWorkout, setEditingWorkout] = useState(null)
  const [bonos, setBonos] = useState([])
  const [trainingSchedule, setTrainingSchedule] = useState([])
  const [showBonoModal, setShowBonoModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [editingBono, setEditingBono] = useState(null)
  const [editingSchedule, setEditingSchedule] = useState(null)

  const dayLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  const mealTypes = [
    { key: 'breakfast', name: 'Desayuno', time: '08:00' },
    { key: 'mid_morning', name: 'Media mañana', time: '11:00' },
    { key: 'lunch', name: 'Almuerzo', time: '14:00' },
    { key: 'snack', name: 'Merienda', time: '17:30' },
    { key: 'dinner', name: 'Cena', time: '21:00' }
  ]

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    if (selectedClient) {
      loadClientData()
    }
  }, [selectedClient])

  const loadClients = async () => {
    setLoading(true)
    const { data, error } = await getClients()
    if (data) setClients(data)
    setLoading(false)
  }

  const loadClientData = async () => {
    if (!selectedClient) return
    
    const [mealsRes, workoutsRes, bonosRes, scheduleRes] = await Promise.all([
      getMealPlans(selectedClient.id),
      getWorkoutRoutines(selectedClient.id),
      getClientBonos(selectedClient.id),
      getTrainingSchedule(selectedClient.id)
    ])
    
    if (mealsRes.data) {
      setMealPlans(mealsRes.data)
      // Preparar datos para edición
      const mealsMap = {}
      mealsRes.data.forEach(plan => {
        mealsMap[plan.day_of_week] = {}
        plan.meals?.forEach(meal => {
          mealsMap[plan.day_of_week][meal.meal_type] = meal
        })
      })
      setEditingMeals(mealsMap)
    }
    
    if (workoutsRes.data) {
      setWorkouts(workoutsRes.data)
    }
    
    if (bonosRes.data) {
      setBonos(bonosRes.data)
    }
    
    if (scheduleRes.data) {
      setTrainingSchedule(scheduleRes.data)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  const handleToggleClient = async (client) => {
    const { data, error } = await updateClient(client.id, { is_active: !client.is_active })
    if (!error) {
      setClients(clients.map(c => c.id === client.id ? { ...c, is_active: !c.is_active } : c))
    }
  }

  const handleCreateClient = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const { data, error } = await signUp(
        newClient.email,
        newClient.password,
        newClient.name,
        'client'
      )

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Cliente creado exitosamente' })
        setShowNewClientModal(false)
        setNewClient({ name: '', email: '', phone: '', password: '', hasTraining: false })
        
        // Recargar clientes y seleccionar el nuevo cliente
        await loadClients()
        
        // Buscar el cliente recién creado por email
        const newClientData = await getClients()
        const createdClient = newClientData.data?.find(c => c.email === newClient.email)
        
        if (createdClient) {
          setSelectedClient(createdClient)
          setCurrentView('editNutrition')
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al crear cliente' })
    }

    setSaving(false)
  }

  const handleSaveMealPlan = async () => {
    if (!selectedClient) return
    setSaving(true)

    const meals = Object.entries(editingMeals[selectedDay] || {}).map(([type, meal]) => ({
      meal_type: type,
      name: meal.name || '',
      time: meal.time || mealTypes.find(m => m.key === type)?.time || '12:00',
      calories: parseInt(meal.calories) || 0,
      protein: parseInt(meal.protein) || 0,
      carbs: parseInt(meal.carbs) || 0,
      fat: parseInt(meal.fat) || 0
    })).filter(m => m.name)

    const { error } = await upsertMealPlan(selectedClient.id, selectedDay, meals)
    
    if (!error) {
      setMessage({ type: 'success', text: 'Plan guardado correctamente' })
      loadClientData()
    } else {
      setMessage({ type: 'error', text: 'Error al guardar' })
    }

    setSaving(false)
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleSaveWorkout = async () => {
    if (!selectedClient || !editingWorkout) return
    setSaving(true)

    const { error } = await upsertWorkoutRoutine(
      selectedClient.id,
      editingWorkout.day_of_week,
      editingWorkout.name,
      editingWorkout.duration,
      editingWorkout.exercises
    )

    if (!error) {
      setMessage({ type: 'success', text: 'Entreno guardado correctamente' })
      loadClientData()
    } else {
      setMessage({ type: 'error', text: 'Error al guardar' })
    }

    setSaving(false)
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const updateMeal = (mealType, field, value) => {
    setEditingMeals(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [mealType]: {
          ...prev[selectedDay]?.[mealType],
          [field]: value
        }
      }
    }))
  }

  const addExercise = () => {
    if (!editingWorkout) return
    setEditingWorkout({
      ...editingWorkout,
      exercises: [
        ...(editingWorkout.exercises || []),
        { name: '', sets: 3, reps: '10', rest: '60s', notes: '', order_index: (editingWorkout.exercises?.length || 0) }
      ]
    })
  }

  const updateExercise = (index, field, value) => {
    if (!editingWorkout) return
    const exercises = [...editingWorkout.exercises]
    exercises[index] = { ...exercises[index], [field]: value }
    setEditingWorkout({ ...editingWorkout, exercises })
  }

  const removeExercise = (index) => {
    if (!editingWorkout) return
    const exercises = editingWorkout.exercises.filter((_, i) => i !== index)
    setEditingWorkout({ ...editingWorkout, exercises })
  }

  const filteredClients = clients.filter(c => 
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-neutral-900 text-white px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={handleLogout} className="p-2 -ml-2 hover:bg-white/10 rounded-xl">
            <LogOut className="w-5 h-5" />
          </button>
          <div className="text-white">
            <Logo className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-xl font-semibold">Panel de Administración</h1>
        <p className="text-neutral-400 text-sm mt-1">Hola, {profile?.full_name}</p>
      </header>

      {/* Message */}
      {message.text && (
        <div className={`mx-5 mt-4 p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Stats */}
      <div className="px-5 pt-5 pb-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{clients.filter(c => c.is_active).length}</p>
                <p className="text-xs text-neutral-500">Clientes activos</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{clients.filter(c => c.has_training && c.is_active).length}</p>
                <p className="text-xs text-neutral-500">Con entrenos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 py-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => { setCurrentView('clients'); setSelectedClient(null); }}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
              currentView === 'clients' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600'
            }`}
          >
            <Users className="w-4 h-4" />
            Clientes
          </button>
          {selectedClient && (
            <>
              <button 
                onClick={() => setCurrentView('editNutrition')}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  currentView === 'editNutrition' ? 'bg-green-600 text-white' : 'bg-white text-neutral-600'
                }`}
              >
                <Utensils className="w-4 h-4" />
                Nutrición
              </button>
              {selectedClient.has_training && (
                <button 
                  onClick={() => setCurrentView('editTraining')}
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                    currentView === 'editTraining' ? 'bg-purple-600 text-white' : 'bg-white text-neutral-600'
                  }`}
                >
                  <Dumbbell className="w-4 h-4" />
                  Entrenos
                </button>
              )}
              <button 
                onClick={() => setCurrentView('clientInfo')}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  currentView === 'clientInfo' ? 'bg-blue-600 text-white' : 'bg-white text-neutral-600'
                }`}
              >
                <Users className="w-4 h-4" />
                Info Cliente
              </button>
            </>
          )}
        </div>
      </div>

      <div className="px-5 pb-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Client List */}
            {currentView === 'clients' && !showNewClientModal && (
              <div>
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input 
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar cliente..." 
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                  <button 
                    onClick={() => setShowNewClientModal(true)}
                    className="px-4 py-3 bg-neutral-900 text-white rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {filteredClients.map((client) => (
                    <div key={client.id} className={`bg-white rounded-2xl p-4 ${!client.is_active ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${client.is_active ? 'bg-neutral-900' : 'bg-neutral-400'}`}>
                          {client.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{client.full_name}</h3>
                            {client.has_training && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                Entrenos
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-500 truncate">{client.email}</p>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => { setSelectedClient(client); setCurrentView('editNutrition'); }}
                            className="p-2.5 hover:bg-green-50 rounded-xl text-green-600"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleToggleClient(client)}
                            className={`p-2.5 rounded-xl ${client.is_active ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-500'}`}
                          >
                            {client.is_active ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredClients.length === 0 && (
                    <div className="bg-white rounded-2xl p-8 text-center">
                      <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-neutral-500">No hay clientes</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* New Client Form */}
            {showNewClientModal && (
              <div className="bg-white rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-6">Nuevo Cliente</h2>
                <form onSubmit={handleCreateClient} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-2">Nombre completo</label>
                    <input 
                      type="text"
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-100 rounded-xl"
                      placeholder="Nombre del cliente"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-2">Email</label>
                    <input 
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-100 rounded-xl"
                      placeholder="email@ejemplo.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-2">Contraseña inicial</label>
                    <input 
                      type="password"
                      value={newClient.password}
                      onChange={(e) => setNewClient({...newClient, password: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-100 rounded-xl"
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-500 mb-2">Teléfono</label>
                    <input 
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-100 rounded-xl"
                      placeholder="612 345 678"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                    <input 
                      type="checkbox"
                      id="hasTraining"
                      checked={newClient.hasTraining}
                      onChange={(e) => setNewClient({...newClient, hasTraining: e.target.checked})}
                      className="w-5 h-5 rounded text-purple-600"
                    />
                    <label htmlFor="hasTraining">Incluir servicio de entrenamiento</label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowNewClientModal(false)}
                      className="flex-1 py-3.5 bg-neutral-100 rounded-xl font-medium"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3.5 bg-neutral-900 text-white rounded-xl font-medium disabled:opacity-50"
                    >
                      {saving ? 'Creando...' : 'Crear Cliente'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Nutrition */}
            {currentView === 'editNutrition' && selectedClient && (
              <div>
                <div className="bg-green-600 rounded-2xl p-4 text-white mb-4">
                  <p className="text-sm opacity-80">Plan nutricional de</p>
                  <h2 className="text-xl font-semibold">{selectedClient.full_name}</h2>
                </div>

                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 hide-scrollbar">
                  {dayLabels.map((day, idx) => (
                    <button 
                      key={day}
                      onClick={() => setSelectedDay(idx)}
                      className={`px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap ${
                        selectedDay === idx ? 'bg-green-600 text-white' : 'bg-white'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {mealTypes.map((meal) => (
                    <div key={meal.key} className="bg-white rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{meal.name}</h3>
                        <input 
                          type="time"
                          value={editingMeals[selectedDay]?.[meal.key]?.time?.slice(0,5) || meal.time}
                          onChange={(e) => updateMeal(meal.key, 'time', e.target.value)}
                          className="text-sm bg-neutral-100 rounded-lg px-3 py-1.5"
                        />
                      </div>
                      <textarea 
                        placeholder="Descripción de la comida..."
                        value={editingMeals[selectedDay]?.[meal.key]?.name || ''}
                        onChange={(e) => updateMeal(meal.key, 'name', e.target.value)}
                        className="w-full px-3 py-2.5 bg-neutral-100 rounded-xl text-sm mb-3 resize-none"
                        rows={2}
                      />
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-xs text-neutral-400">Kcal</label>
                          <input 
                            type="number"
                            value={editingMeals[selectedDay]?.[meal.key]?.calories || ''}
                            onChange={(e) => updateMeal(meal.key, 'calories', e.target.value)}
                            className="w-full px-2 py-2 bg-orange-50 rounded-lg text-sm text-center"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-neutral-400">Prot.</label>
                          <input 
                            type="number"
                            value={editingMeals[selectedDay]?.[meal.key]?.protein || ''}
                            onChange={(e) => updateMeal(meal.key, 'protein', e.target.value)}
                            className="w-full px-2 py-2 bg-blue-50 rounded-lg text-sm text-center"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-neutral-400">Carbs</label>
                          <input 
                            type="number"
                            value={editingMeals[selectedDay]?.[meal.key]?.carbs || ''}
                            onChange={(e) => updateMeal(meal.key, 'carbs', e.target.value)}
                            className="w-full px-2 py-2 bg-yellow-50 rounded-lg text-sm text-center"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-neutral-400">Grasas</label>
                          <input 
                            type="number"
                            value={editingMeals[selectedDay]?.[meal.key]?.fat || ''}
                            onChange={(e) => updateMeal(meal.key, 'fat', e.target.value)}
                            className="w-full px-2 py-2 bg-purple-50 rounded-lg text-sm text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleSaveMealPlan}
                  disabled={saving}
                  className="w-full mt-5 py-4 bg-green-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar {dayLabels[selectedDay]}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Edit Training */}
            {currentView === 'editTraining' && selectedClient?.has_training && (
              <div>
                <div className="bg-purple-600 rounded-2xl p-4 text-white mb-4">
                  <p className="text-sm opacity-80">Plan de entrenos de</p>
                  <h2 className="text-xl font-semibold">{selectedClient.full_name}</h2>
                </div>

                {/* Existing Workouts */}
                <div className="space-y-4">
                  {workouts.map((workout) => (
                    <div key={workout.id} className="bg-white rounded-2xl overflow-hidden">
                      <div 
                        className="p-4 border-b border-neutral-100 cursor-pointer"
                        onClick={() => setEditingWorkout(editingWorkout?.id === workout.id ? null : {...workout})}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-neutral-500">{dayLabels[workout.day_of_week - 1]}</span>
                            <h3 className="font-semibold">{workout.name}</h3>
                          </div>
                          <Edit className="w-5 h-5 text-neutral-400" />
                        </div>
                      </div>

                      {editingWorkout?.id === workout.id && (
                        <div className="p-4">
                          <div className="flex gap-3 mb-4">
                            <select 
                              value={editingWorkout.day_of_week}
                              onChange={(e) => setEditingWorkout({...editingWorkout, day_of_week: parseInt(e.target.value)})}
                              className="px-3 py-2.5 bg-neutral-100 rounded-xl text-sm font-medium"
                            >
                              {dayLabels.map((d, i) => (
                                <option key={d} value={i + 1}>{d}</option>
                              ))}
                            </select>
                            <input 
                              type="text"
                              value={editingWorkout.name}
                              onChange={(e) => setEditingWorkout({...editingWorkout, name: e.target.value})}
                              className="flex-1 px-3 py-2.5 bg-neutral-100 rounded-xl text-sm"
                              placeholder="Nombre del entreno"
                            />
                          </div>
                          <input 
                            type="text"
                            value={editingWorkout.duration || ''}
                            onChange={(e) => setEditingWorkout({...editingWorkout, duration: e.target.value})}
                            className="w-full px-3 py-2.5 bg-neutral-100 rounded-xl text-sm mb-4"
                            placeholder="Duración (ej: 60 min)"
                          />

                          <div className="space-y-2 mb-4">
                            {editingWorkout.exercises?.map((exercise, eIdx) => (
                              <div key={eIdx} className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-xl">
                                <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                                  {eIdx + 1}
                                </div>
                                <input 
                                  type="text"
                                  value={exercise.name}
                                  onChange={(e) => updateExercise(eIdx, 'name', e.target.value)}
                                  className="flex-1 px-2 py-1.5 bg-white rounded-lg text-sm min-w-0"
                                  placeholder="Ejercicio"
                                />
                                <input 
                                  type="number"
                                  value={exercise.sets}
                                  onChange={(e) => updateExercise(eIdx, 'sets', parseInt(e.target.value))}
                                  className="w-12 px-1 py-1.5 bg-white rounded-lg text-sm text-center"
                                />
                                <span className="text-neutral-300">×</span>
                                <input 
                                  type="text"
                                  value={exercise.reps}
                                  onChange={(e) => updateExercise(eIdx, 'reps', e.target.value)}
                                  className="w-16 px-1 py-1.5 bg-white rounded-lg text-sm text-center"
                                />
                                <button 
                                  onClick={() => removeExercise(eIdx)}
                                  className="p-1.5 text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button 
                            onClick={addExercise}
                            className="w-full py-2.5 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 text-sm flex items-center justify-center gap-2 mb-4"
                          >
                            <Plus className="w-4 h-4" />
                            Añadir ejercicio
                          </button>

                          <button 
                            onClick={handleSaveWorkout}
                            disabled={saving}
                            className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
                          >
                            {saving ? 'Guardando...' : 'Guardar Entreno'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add New Workout */}
                  <button 
                    onClick={() => setEditingWorkout({
                      day_of_week: 1,
                      name: 'Nuevo Entreno',
                      duration: '60 min',
                      exercises: []
                    })}
                    className="w-full py-4 border-2 border-dashed border-neutral-300 rounded-2xl text-neutral-500 font-medium flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Añadir día de entreno
                  </button>

                  {editingWorkout && !editingWorkout.id && (
                    <div className="bg-white rounded-2xl p-4">
                      <h3 className="font-semibold mb-4">Nuevo Entreno</h3>
                      <div className="flex gap-3 mb-4">
                        <select 
                          value={editingWorkout.day_of_week}
                          onChange={(e) => setEditingWorkout({...editingWorkout, day_of_week: parseInt(e.target.value)})}
                          className="px-3 py-2.5 bg-neutral-100 rounded-xl text-sm font-medium"
                        >
                          {dayLabels.map((d, i) => (
                            <option key={d} value={i + 1}>{d}</option>
                          ))}
                        </select>
                        <input 
                          type="text"
                          value={editingWorkout.name}
                          onChange={(e) => setEditingWorkout({...editingWorkout, name: e.target.value})}
                          className="flex-1 px-3 py-2.5 bg-neutral-100 rounded-xl text-sm"
                        />
                      </div>

                      <div className="space-y-2 mb-4">
                        {editingWorkout.exercises?.map((exercise, eIdx) => (
                          <div key={eIdx} className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-xl">
                            <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                              {eIdx + 1}
                            </div>
                            <input 
                              type="text"
                              value={exercise.name}
                              onChange={(e) => updateExercise(eIdx, 'name', e.target.value)}
                              className="flex-1 px-2 py-1.5 bg-white rounded-lg text-sm min-w-0"
                            />
                            <input 
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => updateExercise(eIdx, 'sets', parseInt(e.target.value))}
                              className="w-12 px-1 py-1.5 bg-white rounded-lg text-sm text-center"
                            />
                            <span className="text-neutral-300">×</span>
                            <input 
                              type="text"
                              value={exercise.reps}
                              onChange={(e) => updateExercise(eIdx, 'reps', e.target.value)}
                              className="w-16 px-1 py-1.5 bg-white rounded-lg text-sm text-center"
                            />
                            <button onClick={() => removeExercise(eIdx)} className="p-1.5 text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button onClick={addExercise} className="w-full py-2.5 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 text-sm flex items-center justify-center gap-2 mb-4">
                        <Plus className="w-4 h-4" />
                        Añadir ejercicio
                      </button>

                      <div className="flex gap-3">
                        <button onClick={() => setEditingWorkout(null)} className="flex-1 py-3 bg-neutral-100 rounded-xl font-medium">
                          Cancelar
                        </button>
                        <button onClick={handleSaveWorkout} disabled={saving} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium disabled:opacity-50">
                          {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CLIENT INFO VIEW */}
            {currentView === 'clientInfo' && selectedClient && (
              <div className="bg-white rounded-2xl p-5">
                <h2 className="text-lg font-semibold mb-4">Información del Cliente</h2>
                
                {/* Datos básicos */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-neutral-600 mb-3">Datos Generales</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-neutral-500">Nutricionista</label>
                      <input 
                        type="text"
                        defaultValue={selectedClient.nutritionist || 'Carlos Arias'}
                        onBlur={(e) => updateClientProfile(selectedClient.id, { nutritionist: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-50 rounded-lg text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500">Próxima Consulta</label>
                      <input 
                        type="datetime-local"
                        defaultValue={selectedClient.next_appointment ? new Date(selectedClient.next_appointment).toISOString().slice(0, 16) : ''}
                        onBlur={(e) => updateClientProfile(selectedClient.id, { next_appointment: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-50 rounded-lg text-sm mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Horarios de entreno */}
                {selectedClient.has_training && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-neutral-600">Horarios de Entreno</h3>
                      <button 
                        onClick={() => setShowScheduleModal(true)}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Añadir
                      </button>
                    </div>
                    <div className="space-y-2">
                      {trainingSchedule.map((schedule) => (
                        <div key={schedule.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{dayLabels[schedule.day_of_week - 1]}</p>
                            <p className="text-xs text-neutral-600">{schedule.start_time} - {schedule.end_time}</p>
                            <p className="text-xs text-neutral-500">Entrenador: {schedule.trainer}</p>
                          </div>
                          <button 
                            onClick={async () => {
                              await deleteTrainingSchedule(schedule.id)
                              loadClientData()
                            }}
                            className="p-2 text-red-400 hover:bg-red-100 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {trainingSchedule.length === 0 && (
                        <p className="text-sm text-neutral-400 text-center py-4">No hay horarios configurados</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Bonos */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-neutral-600">Bonos Contratados</h3>
                    <button 
                      onClick={() => setShowBonoModal(true)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Añadir
                    </button>
                  </div>
                  <div className="space-y-2">
                    {bonos.map((bono) => {
                      const daysLeft = Math.ceil((new Date(bono.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
                      const sessionsLeft = bono.sessions_total - bono.sessions_used
                      return (
                        <div key={bono.id} className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">{bono.bono_type}</p>
                            <button 
                              onClick={async () => {
                                await deleteBono(bono.id)
                                loadClientData()
                              }}
                              className="p-1 text-red-400 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-neutral-500">Sesiones</p>
                              <p className="font-medium">{sessionsLeft} de {bono.sessions_total}</p>
                            </div>
                            <div>
                              <p className="text-neutral-500">Caduca en</p>
                              <p className="font-medium">{daysLeft} días</p>
                            </div>
                          </div>
                          {bono.notes && (
                            <p className="text-xs text-neutral-600 mt-2">{bono.notes}</p>
                          )}
                        </div>
                      )
                    })}
                    {bonos.length === 0 && (
                      <p className="text-sm text-neutral-400 text-center py-4">No hay bonos activos</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Nuevo Bono */}
      {showBonoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nuevo Bono</h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              await createBono(selectedClient.id, {
                bono_type: formData.get('bono_type'),
                sessions_total: parseInt(formData.get('sessions_total')),
                sessions_used: 0,
                start_date: formData.get('start_date'),
                expiry_date: formData.get('expiry_date'),
                notes: formData.get('notes')
              })
              setShowBonoModal(false)
              loadClientData()
            }}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-500">Tipo de Bono</label>
                  <input name="bono_type" required className="w-full px-3 py-2 bg-neutral-50 rounded-lg text-sm mt-1" placeholder="Ej: Mensual, Trimestral" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Sesiones Totales</label>
                  <input name="sessions_total" type="number" required className="w-full px-3 py-2 bg-neutral-50 rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Fecha Inicio</label>
                  <input name="start_date" type="date" required className="w-full px-3 py-2 bg-neutral-50 rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Fecha Caducidad</label>
                  <input name="expiry_date" type="date" required className="w-full px-3 py-2 bg-neutral-50 rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Notas</label>
                  <textarea name="notes" className="w-full px-3 py-2 bg-neutral-50 rounded-lg text-sm mt-1" rows="2"></textarea>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setShowBonoModal(false)} className="flex-1 py-2.5 bg-neutral-100 rounded-xl text-sm font-medium">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Horario */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nuevo Horario</h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              await upsertTrainingSchedule(selectedClient.id, {
                day_of_week: parseInt(formData.get('day_of_week')),
                start_time: formData.get('start_time'),
                end_time: formData.get('end_time'),
                trainer: formData.get('trainer'),
                notes: formData.get('notes')
              })
              setShowScheduleModal(false)
              loadClientData()
            }}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-500">Día de la Semana</label>
                  <select name="day_of_week" required className="w-full px-3 py-2 bg-neutral-50 rounded-lg text-sm mt-1">
                    {dayLabels.map((day, idx) => (
                      <option key={idx} value={idx + 1}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Hora Inicio</label>
                  <input name="start_time" type="time" required className="w-full px-3 py-2 bg-neutral-50 rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Hora Fin</label>
                  <input name="end_time" type="time" required className="w-full px-3 py-2 bg-neutral-50 rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Entrenador</label>
                  <input name="trainer" defaultValue="Carlos" className="w-full px-3 py-2 bg-neutral-50 rounded-lg text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Notas</label>
                  <textarea name="notes" className="w-full px-3 py-2 bg-neutral-50 rounded-lg text-sm mt-1" rows="2"></textarea>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="flex-1 py-2.5 bg-neutral-100 rounded-xl text-sm font-medium">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
