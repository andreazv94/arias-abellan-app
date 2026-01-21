import React, { useState, useEffect } from 'react'
import { Users, Utensils, Dumbbell, Calendar, Settings, LogOut, Plus, Trash2, Edit, Search, Save, X, Clock, TrendingUp, AlertCircle, Home } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { 
  signOut, 
  getClients, 
  getProfessionals,
  getBonoTemplates,
  getMealLibrary,
  getWorkoutTemplates,
  getAppointments,
  getDashboardStats,
  createProfessional,
  createBonoTemplate,
  createMealInLibrary,
  createWorkoutTemplate,
  createAppointment,
  updateBonoTemplate,
  updateMealInLibrary,
  updateAppointment,
  deleteBonoTemplate,
  deleteMealFromLibrary,
  deleteWorkoutTemplate,
  deleteAppointment
} from '../lib/supabase'

// Logo Component
const Logo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <path d="M50 12 L32 24 L26 50 L32 76 L50 88" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M50 12 L68 24 L74 50 L68 76 L50 88" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <ellipse cx="50" cy="50" rx="14" ry="32" stroke="currentColor" strokeWidth="2.5" fill="none"/>
  </svg>
)

export default function AdminViewNew() {
  const { profile } = useAuth()
  const [currentSection, setCurrentSection] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Data states
  const [stats, setStats] = useState({ activeClients: 0, todayAppointments: 0, expiringBonos: 0 })
  const [clients, setClients] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [bonoTemplates, setBonoTemplates] = useState([])
  const [mealLibrary, setMealLibrary] = useState([])
  const [workoutTemplates, setWorkoutTemplates] = useState([])
  const [appointments, setAppointments] = useState([])
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  
  // Search
  const [searchTerm, setSearchTerm] = useState('')
  
  // Services tab
  const [servicesTab, setServicesTab] = useState('bonos')

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (currentSection === 'clients') loadClients()
    if (currentSection === 'professionals') loadProfessionals()
    if (currentSection === 'services') loadServices()
    if (currentSection === 'calendar') loadAppointments()
  }, [currentSection])

  const loadDashboardData = async () => {
    const statsData = await getDashboardStats()
    setStats(statsData)
  }

  const loadClients = async () => {
    setLoading(true)
    const { data } = await getClients()
    if (data) setClients(data)
    setLoading(false)
  }

  const loadProfessionals = async () => {
    setLoading(true)
    const { data } = await getProfessionals()
    if (data) setProfessionals(data)
    setLoading(false)
  }

  const loadServices = async () => {
    setLoading(true)
    const [bonos, meals, workouts] = await Promise.all([
      getBonoTemplates(),
      getMealLibrary(),
      getWorkoutTemplates()
    ])
    if (bonos.data) setBonoTemplates(bonos.data)
    if (meals.data) setMealLibrary(meals.data)
    if (workouts.data) setWorkoutTemplates(workouts.data)
    setLoading(false)
  }

  const loadAppointments = async () => {
    setLoading(true)
    const { data } = await getAppointments()
    if (data) setAppointments(data)
    setLoading(false)
  }

  const handleLogout = async () => {
    await signOut()
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const openModal = (type, item = null) => {
    setModalType(type)
    setEditingItem(item)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType('')
    setEditingItem(null)
  }

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'professionals', label: 'Profesionales', icon: Users },
    { id: 'services', label: 'Gestión', icon: Settings },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 text-white flex flex-col">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <div>
              <h1 className="font-semibold">Arias Abellán</h1>
              <p className="text-xs text-neutral-400">Nutrición</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors ${
                  currentSection === item.id
                    ? 'bg-white text-neutral-900'
                    : 'text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <div className="px-4 py-3 mb-2 bg-neutral-800 rounded-xl">
            <p className="text-sm font-medium">{profile?.full_name}</p>
            <p className="text-xs text-neutral-400">{profile?.role_type || profile?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-neutral-800"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                {navItems.find(item => item.id === currentSection)?.label}
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                {currentSection === 'dashboard' && 'Resumen general de tu centro'}
                {currentSection === 'clients' && 'Gestiona todos tus clientes'}
                {currentSection === 'professionals' && 'Administra nutricionistas y entrenadores'}
                {currentSection === 'services' && 'Configura bonos, comidas y entrenamientos'}
                {currentSection === 'calendar' && 'Organiza citas y sesiones'}
              </p>
            </div>
            {message.text && (
              <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{message.text}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {/* DASHBOARD */}
          {currentSection === 'dashboard' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-neutral-900">{stats.activeClients}</p>
                  <p className="text-sm text-neutral-500 mt-1">Clientes Activos</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-neutral-900">{stats.todayAppointments}</p>
                  <p className="text-sm text-neutral-500 mt-1">Citas Hoy</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-neutral-900">{stats.expiringBonos}</p>
                  <p className="text-sm text-neutral-500 mt-1">Bonos por Caducar</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                <h3 className="text-lg font-semibold mb-4">Accesos Rápidos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setCurrentSection('clients')}
                    className="p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-left transition-colors"
                  >
                    <Users className="w-6 h-6 text-neutral-700 mb-2" />
                    <p className="font-medium text-sm">Ver Clientes</p>
                  </button>
                  <button
                    onClick={() => setCurrentSection('calendar')}
                    className="p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-left transition-colors"
                  >
                    <Calendar className="w-6 h-6 text-neutral-700 mb-2" />
                    <p className="font-medium text-sm">Calendario</p>
                  </button>
                  <button
                    onClick={() => setCurrentSection('professionals')}
                    className="p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-left transition-colors"
                  >
                    <Users className="w-6 h-6 text-neutral-700 mb-2" />
                    <p className="font-medium text-sm">Profesionales</p>
                  </button>
                  <button
                    onClick={() => setCurrentSection('services')}
                    className="p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-left transition-colors"
                  >
                    <Settings className="w-6 h-6 text-neutral-700 mb-2" />
                    <p className="font-medium text-sm">Gestión</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CLIENTS SECTION - Placeholder */}
          {currentSection === 'clients' && (
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Buscar clientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {clients.filter(c => 
                    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(client => (
                    <div key={client.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                      <div>
                        <p className="font-medium">{client.full_name}</p>
                        <p className="text-sm text-neutral-500">{client.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          client.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          {client.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {clients.length === 0 && (
                    <p className="text-center text-neutral-400 py-8">No hay clientes registrados</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PROFESSIONALS SECTION */}
          {currentSection === 'professionals' && (
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Profesionales</h3>
                <button
                  onClick={() => openModal('professional')}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-neutral-800"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Profesional
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {professionals.map(prof => (
                    <div key={prof.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{prof.full_name}</p>
                          <p className="text-sm text-neutral-500">{prof.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          prof.role_type === 'admin' ? 'bg-purple-100 text-purple-700' :
                          prof.role_type === 'nutritionist' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {prof.role_type === 'admin' ? 'Admin' :
                           prof.role_type === 'nutritionist' ? 'Nutricionista' : 'Entrenador'}
                        </span>
                      </div>
                      <button
                        onClick={() => openModal('professional', prof)}
                        className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        Editar
                      </button>
                    </div>
                  ))}
                  {professionals.length === 0 && (
                    <div className="col-span-full text-center text-neutral-400 py-8">
                      No hay profesionales registrados
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SERVICES SECTION */}
          {currentSection === 'services' && (
            <div>
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setServicesTab('bonos')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    servicesTab === 'bonos' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                  }`}
                >
                  Bonos
                </button>
                <button
                  onClick={() => setServicesTab('meals')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    servicesTab === 'meals' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                  }`}
                >
                  Comidas
                </button>
                <button
                  onClick={() => setServicesTab('workouts')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    servicesTab === 'workouts' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                  }`}
                >
                  Entrenamientos
                </button>
              </div>

              {servicesTab === 'bonos' && (
                <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Plantillas de Bonos</h3>
                    <button
                      onClick={() => openModal('bono')}
                      className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-neutral-800"
                    >
                      <Plus className="w-4 h-4" />
                      Nuevo Bono
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bonoTemplates.map(bono => (
                      <div key={bono.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold">{bono.name}</p>
                            <p className="text-sm text-neutral-500">{bono.description}</p>
                          </div>
                          <button
                            onClick={() => openModal('bono', bono)}
                            className="p-2 hover:bg-neutral-200 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-neutral-500">Precio</p>
                            <p className="font-medium">{bono.price}€</p>
                          </div>
                          <div>
                            <p className="text-neutral-500">Sesiones</p>
                            <p className="font-medium">{bono.sessions_included}</p>
                          </div>
                          <div>
                            <p className="text-neutral-500">Duración</p>
                            <p className="font-medium">{bono.duration_days}d</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {bonoTemplates.length === 0 && (
                      <div className="col-span-full text-center text-neutral-400 py-8">
                        No hay plantillas de bonos
                      </div>
                    )}
                  </div>
                </div>
              )}

              {servicesTab === 'meals' && (
                <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Biblioteca de Comidas</h3>
                    <button
                      onClick={() => openModal('meal')}
                      className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-neutral-800"
                    >
                      <Plus className="w-4 h-4" />
                      Nueva Comida
                    </button>
                  </div>
                  <div className="space-y-3">
                    {mealLibrary.map(meal => (
                      <div key={meal.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{meal.name}</p>
                          <p className="text-sm text-neutral-500">{meal.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-neutral-600">
                            <span>{meal.calories} kcal</span>
                            <span>P: {meal.protein}g</span>
                            <span>C: {meal.carbs}g</span>
                            <span>G: {meal.fat}g</span>
                          </div>
                        </div>
                        <button
                          onClick={() => openModal('meal', meal)}
                          className="p-2 hover:bg-neutral-200 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {mealLibrary.length === 0 && (
                      <p className="text-center text-neutral-400 py-8">No hay comidas en la biblioteca</p>
                    )}
                  </div>
                </div>
              )}

              {servicesTab === 'workouts' && (
                <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Plantillas de Entrenamientos</h3>
                    <button
                      onClick={() => openModal('workout')}
                      className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-neutral-800"
                    >
                      <Plus className="w-4 h-4" />
                      Nuevo Entrenamiento
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workoutTemplates.map(workout => (
                      <div key={workout.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold">{workout.name}</p>
                            <p className="text-sm text-neutral-500">{workout.description}</p>
                          </div>
                          <button
                            onClick={() => openModal('workout', workout)}
                            className="p-2 hover:bg-neutral-200 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 bg-neutral-200 rounded">{workout.workout_type}</span>
                          <span className="px-2 py-1 bg-neutral-200 rounded">{workout.duration} min</span>
                          <span className="px-2 py-1 bg-neutral-200 rounded">{workout.difficulty}</span>
                        </div>
                      </div>
                    ))}
                    {workoutTemplates.length === 0 && (
                      <div className="col-span-full text-center text-neutral-400 py-8">
                        No hay plantillas de entrenamientos
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CALENDAR SECTION */}
          {currentSection === 'calendar' && (
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Calendario de Citas</h3>
                <button
                  onClick={() => openModal('appointment')}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-neutral-800"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Cita
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map(apt => (
                    <div key={apt.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            apt.appointment_type === 'nutrition' ? 'bg-green-100 text-green-700' :
                            apt.appointment_type === 'training' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {apt.appointment_type === 'nutrition' ? 'Nutrición' :
                             apt.appointment_type === 'training' ? 'Entrenamiento' : 'Evaluación'}
                          </span>
                          <span className="text-sm font-medium">
                            {new Date(apt.appointment_date).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="font-medium">{apt.client?.full_name}</p>
                        <p className="text-sm text-neutral-500">Con: {apt.professional?.full_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal('appointment', apt)}
                          className="p-2 hover:bg-neutral-200 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('¿Eliminar esta cita?')) {
                              await deleteAppointment(apt.id)
                              loadAppointments()
                            }
                          }}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <p className="text-center text-neutral-400 py-8">No hay citas programadas</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals - Placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Modal en desarrollo</h3>
              <button onClick={closeModal} className="p-2 hover:bg-neutral-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-neutral-500">Tipo: {modalType}</p>
          </div>
        </div>
      )}
    </div>
  )
}
