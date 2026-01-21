import React, { useState, useEffect } from 'react'
import { User, Utensils, Dumbbell, Home, Clock, Flame, Target, TrendingUp, ArrowLeft, ChevronLeft, ChevronRight, Bell, Calendar, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { signOut, getMealPlans, getWorkoutRoutines } from '../lib/supabase'

// Logo Component
const Logo = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <path d="M50 12 L32 24 L26 50 L32 76 L50 88" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M50 12 L68 24 L74 50 L68 76 L50 88" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <ellipse cx="50" cy="50" rx="14" ry="32" stroke="currentColor" strokeWidth="2.5" fill="none"/>
  </svg>
)

export default function ClientView() {
  const { profile } = useAuth()
  const [currentView, setCurrentView] = useState('nutrition')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [mealPlans, setMealPlans] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  useEffect(() => {
    loadData()
  }, [profile])

  const loadData = async () => {
    if (!profile) return
    setLoading(true)
    
    const [mealsRes, workoutsRes] = await Promise.all([
      getMealPlans(profile.id),
      getWorkoutRoutines(profile.id)
    ])
    
    if (mealsRes.data) setMealPlans(mealsRes.data)
    if (workoutsRes.data) setWorkouts(workoutsRes.data)
    
    setLoading(false)
  }

  const handleLogout = async () => {
    await signOut()
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    for (let i = startPadding; i > 0; i--) {
      days.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false })
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }
    const endPadding = 42 - days.length
    for (let i = 1; i <= endPadding; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }
    return days
  }

  const getMealsForDay = (dayIndex) => {
    const plan = mealPlans.find(p => p.day_of_week === dayIndex)
    return plan?.meals || []
  }

  const getWorkoutForDay = (date) => {
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay()
    return workouts.find(w => w.day_of_week === dayOfWeek)
  }

  const hasWorkout = (date) => {
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay()
    return workouts.some(w => w.day_of_week === dayOfWeek)
  }

  const mealConfig = {
    breakfast: { name: 'Desayuno', icon: '🌅', bg: 'bg-amber-500' },
    mid_morning: { name: 'Media Mañana', icon: '🍎', bg: 'bg-rose-500' },
    lunch: { name: 'Almuerzo', icon: '☀️', bg: 'bg-green-500' },
    snack: { name: 'Merienda', icon: '🥜', bg: 'bg-yellow-500' },
    dinner: { name: 'Cena', icon: '🌙', bg: 'bg-indigo-500' }
  }

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-neutral-900 text-white px-5 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={handleLogout} className="p-2 -ml-2 hover:bg-white/10 rounded-xl">
            <LogOut className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-neutral-400" />
            <div className="w-10 h-10 rounded-full bg-white text-neutral-900 flex items-center justify-center font-semibold">
              {initials}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-white">
            <Logo className="w-10 h-10" />
          </div>
          <div>
            <p className="text-neutral-400 text-sm">Bienvenido/a</p>
            <h1 className="text-xl font-semibold">{profile?.full_name}</h1>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="px-5 -mt-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-xl font-bold text-neutral-900">{profile?.target_calories || 2000}</p>
              <p className="text-xs text-neutral-500">kcal/día</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-xl font-bold text-neutral-900">{profile?.target_weight || '--'}kg</p>
              <p className="text-xs text-neutral-500">Objetivo</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xl font-bold text-neutral-900">
                {profile?.current_weight && profile?.target_weight 
                  ? `${(profile.current_weight - profile.target_weight).toFixed(1)}kg`
                  : '--'}
              </p>
              <p className="text-xs text-neutral-500">Restante</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-5">
        <div className="bg-neutral-200 rounded-xl p-1 flex">
          <button 
            onClick={() => setCurrentView('nutrition')}
            className={`flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              currentView === 'nutrition' ? 'bg-neutral-900 text-white shadow' : 'text-neutral-600'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Nutrición
          </button>
          {profile?.has_training && (
            <button 
              onClick={() => setCurrentView('training')}
              className={`flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                currentView === 'training' ? 'bg-neutral-900 text-white shadow' : 'text-neutral-600'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              Entrenos
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-28">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* NUTRICIÓN */}
            {currentView === 'nutrition' && (
              <div>
                {/* Day Selector */}
                <div className="flex gap-2 mb-5 overflow-x-auto pb-2 -mx-5 px-5 hide-scrollbar">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                    const date = new Date()
                    date.setDate(date.getDate() - date.getDay() + 1 + dayOffset)
                    const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
                    const isSelected = selectedDate.getDay() === (dayOffset + 1) % 7 || (dayOffset === 6 && selectedDate.getDay() === 0)
                    const isToday = new Date().toDateString() === date.toDateString()
                    
                    return (
                      <button
                        key={dayOffset}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 w-14 py-3 rounded-xl text-center transition-all ${
                          isSelected 
                            ? 'bg-neutral-900 text-white' 
                            : isToday 
                              ? 'bg-white border-2 border-neutral-900 text-neutral-900'
                              : 'bg-white text-neutral-600'
                        }`}
                      >
                        <p className="text-xs font-medium opacity-70">{dayLabels[dayOffset]}</p>
                        <p className="text-lg font-bold">{date.getDate()}</p>
                      </button>
                    )
                  })}
                </div>

                {/* Meals */}
                <div className="space-y-3">
                  {(() => {
                    const dayIndex = selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1
                    const meals = getMealsForDay(dayIndex)
                    
                    if (meals.length === 0) {
                      return (
                        <div className="bg-white rounded-2xl p-8 text-center">
                          <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                          <p className="text-neutral-500">No hay plan para este día</p>
                          <p className="text-neutral-400 text-sm mt-1">Tu nutricionista aún no ha configurado este día</p>
                        </div>
                      )
                    }

                    const mealOrder = ['breakfast', 'mid_morning', 'lunch', 'snack', 'dinner']
                    const sortedMeals = [...meals].sort((a, b) => 
                      mealOrder.indexOf(a.meal_type) - mealOrder.indexOf(b.meal_type)
                    )

                    return sortedMeals.map((meal) => {
                      const config = mealConfig[meal.meal_type]
                      if (!config) return null
                      
                      return (
                        <div key={meal.id} className="bg-white rounded-2xl p-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                              {config.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-neutral-900">{config.name}</h3>
                                <span className="text-xs text-neutral-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {meal.time?.slice(0, 5)}
                                </span>
                              </div>
                              <p className="text-sm text-neutral-600 mb-3">{meal.name}</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-lg font-medium">
                                  {meal.calories} kcal
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium">
                                  P: {meal.protein}g
                                </span>
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg font-medium">
                                  C: {meal.carbs}g
                                </span>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-medium">
                                  G: {meal.fat}g
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>

                {/* Daily Summary */}
                {getMealsForDay(selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1).length > 0 && (
                  <div className="mt-5 bg-neutral-900 rounded-2xl p-5 text-white">
                    <h3 className="font-medium mb-4 text-neutral-300">Resumen del día</h3>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {(() => {
                        const dayIndex = selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1
                        const meals = getMealsForDay(dayIndex)
                        const totals = meals.reduce((acc, m) => ({
                          calories: acc.calories + (m.calories || 0),
                          protein: acc.protein + (m.protein || 0),
                          carbs: acc.carbs + (m.carbs || 0),
                          fat: acc.fat + (m.fat || 0)
                        }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
                        
                        return (
                          <>
                            <div className="bg-white/10 rounded-xl p-3">
                              <p className="text-xl font-bold">{totals.calories}</p>
                              <p className="text-xs text-neutral-400">kcal</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3">
                              <p className="text-xl font-bold">{totals.protein}g</p>
                              <p className="text-xs text-neutral-400">Prot</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3">
                              <p className="text-xl font-bold">{totals.carbs}g</p>
                              <p className="text-xs text-neutral-400">Carbs</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3">
                              <p className="text-xl font-bold">{totals.fat}g</p>
                              <p className="text-xs text-neutral-400">Grasas</p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ENTRENAMIENTOS */}
            {currentView === 'training' && profile?.has_training && (
              <div>
                {/* Calendar */}
                <div className="bg-white rounded-2xl p-4 mb-5">
                  <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                      className="p-2 hover:bg-neutral-100 rounded-xl"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="font-semibold">
                      {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </h3>
                    <button 
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                      className="p-2 hover:bg-neutral-100 rounded-xl"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-neutral-400 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(selectedDate).map((day, idx) => {
                      const isSelected = selectedDate.toDateString() === day.date.toDateString()
                      const isToday = new Date().toDateString() === day.date.toDateString()
                      const hasWorkoutDay = hasWorkout(day.date)
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedDate(day.date)}
                          className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative ${
                            !day.isCurrentMonth 
                              ? 'text-neutral-300' 
                              : isSelected 
                                ? 'bg-neutral-900 text-white font-medium' 
                                : isToday 
                                  ? 'bg-neutral-200 font-medium'
                                  : 'hover:bg-neutral-100'
                          }`}
                        >
                          {day.date.getDate()}
                          {hasWorkoutDay && day.isCurrentMonth && (
                            <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-green-400' : 'bg-green-500'}`} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Workout for Selected Day */}
                {(() => {
                  const workout = getWorkoutForDay(selectedDate)
                  
                  if (!workout) {
                    return (
                      <div className="bg-white rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                          <Dumbbell className="w-8 h-8 text-neutral-300" />
                        </div>
                        <p className="font-medium text-neutral-600">Día de descanso</p>
                        <p className="text-sm text-neutral-400 mt-1">Recupérate para el próximo entreno</p>
                      </div>
                    )
                  }

                  return (
                    <div className="bg-white rounded-2xl overflow-hidden">
                      <div className="bg-neutral-900 p-4 text-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-neutral-400 text-sm">{dayNames[selectedDate.getDay()]}, {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}</p>
                            <h3 className="font-bold text-lg mt-1">{workout.name}</h3>
                            <p className="text-neutral-400 text-sm mt-1">Entrenador: {workout.trainer} • {workout.duration}</p>
                          </div>
                          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <Dumbbell className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-2">
                        {workout.exercises?.sort((a, b) => a.order_index - b.order_index).map((exercise, idx) => (
                          <div key={exercise.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                            <div className="w-8 h-8 bg-neutral-900 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{exercise.name}</p>
                              {exercise.notes && <p className="text-xs text-neutral-400">{exercise.notes}</p>}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-sm">{exercise.sets} x {exercise.reps}</p>
                              <p className="text-xs text-neutral-400">Desc: {exercise.rest}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-6 py-4 safe-area-pb">
        <div className="flex justify-around max-w-md mx-auto">
          <button onClick={() => setCurrentView('nutrition')} className={`flex flex-col items-center gap-1 ${currentView === 'nutrition' ? 'text-neutral-900' : 'text-neutral-400'}`}>
            <Utensils className="w-6 h-6" />
            <span className="text-xs font-medium">Nutrición</span>
          </button>
          {profile?.has_training && (
            <button onClick={() => setCurrentView('training')} className={`flex flex-col items-center gap-1 ${currentView === 'training' ? 'text-neutral-900' : 'text-neutral-400'}`}>
              <Dumbbell className="w-6 h-6" />
              <span className="text-xs font-medium">Entrenos</span>
            </button>
          )}
          <button className="flex flex-col items-center gap-1 text-neutral-400">
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
