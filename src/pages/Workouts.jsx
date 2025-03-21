import { useState } from 'react'
import { workouts } from '../data/workouts'
import WorkoutDetail from '../components/WorkoutDetail'

const Workouts = () => {
  const [selectedGoal, setSelectedGoal] = useState('strength')
  const [selectedWorkout, setSelectedWorkout] = useState(null)

  const handleWorkoutClick = (workout) => {
    setSelectedWorkout(workout)
  }

  const handleCloseWorkout = () => {
    setSelectedWorkout(null)
  }

  return (
    <div className="workouts-page">
      <div className="workouts-header">
        <h1>Workout Library</h1>
        <div className="goal-buttons">
          <button 
            className={selectedGoal === 'strength' ? 'active' : ''} 
            onClick={() => setSelectedGoal('strength')}
          >
            Strength
          </button>
          <button 
            className={selectedGoal === 'cardio' ? 'active' : ''} 
            onClick={() => setSelectedGoal('cardio')}
          >
            Cardio
          </button>
          <button 
            className={selectedGoal === 'flexibility' ? 'active' : ''} 
            onClick={() => setSelectedGoal('flexibility')}
          >
            Flexibility
          </button>
        </div>
      </div>

      <div className="workout-grid">
        {workouts[selectedGoal].map((workout) => (
          <div 
            key={workout.id} 
            className="workout-card"
            onClick={() => handleWorkoutClick(workout)}
          >
            <img src={workout.image} alt={workout.title} />
            <div className="workout-card-content">
              <h3>{workout.title}</h3>
              <p className="workout-meta">{workout.duration} • {workout.level}</p>
              <p className="workout-description">{workout.description}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedWorkout && (
        <WorkoutDetail 
          workout={selectedWorkout} 
          onClose={handleCloseWorkout}
        />
      )}
    </div>
  )
}

export default Workouts 