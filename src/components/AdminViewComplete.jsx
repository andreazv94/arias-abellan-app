// Este archivo contiene el AdminView completo con todas las funcionalidades
// Debido al tamaño, se implementará por partes

// PARTE 1: Imports y estados básicos ya están en AdminView.jsx actual

// PARTE 2: Sección de Profesionales - Añadir después de la sección de clientes

/*
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
*/

// PARTE 3: Sección de Servicios con tabs

/*
{currentSection === 'services' && (
  <div>
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => setServicesTab('bonos')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          servicesTab === 'bonos' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'
        }`}
      >
        Bonos
      </button>
      <button
        onClick={() => setServicesTab('meals')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          servicesTab === 'meals' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'
        }`}
      >
        Comidas
      </button>
      <button
        onClick={() => setServicesTab('workouts')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          servicesTab === 'workouts' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'
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
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm flex items-center gap-2"
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
        </div>
      </div>
    )}

    {servicesTab === 'meals' && (
      <div className="bg-white rounded-2xl p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Biblioteca de Comidas</h3>
          <button
            onClick={() => openModal('meal')}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm flex items-center gap-2"
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
        </div>
      </div>
    )}

    {servicesTab === 'workouts' && (
      <div className="bg-white rounded-2xl p-6 border border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Plantillas de Entrenamientos</h3>
          <button
            onClick={() => openModal('workout')}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm flex items-center gap-2"
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
        </div>
      </div>
    )}
  </div>
)}
*/

// PARTE 4: Calendario

/*
{currentSection === 'calendar' && (
  <div className="bg-white rounded-2xl p-6 border border-neutral-200">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold">Calendario de Citas</h3>
      <button
        onClick={() => openModal('appointment')}
        className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm flex items-center gap-2"
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
*/

// Este archivo es solo de referencia para las implementaciones
export default null
