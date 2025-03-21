import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { updateWorkoutStats, addWorkoutToHistory, checkAchievements } from '../utils/progressUtils';

// Import homepage video to use as a demo
import homepageVideo from '../assets/videos/HomeVideos/homepageVideo.mp4';

// Video paths organized by exercise type - using imported video objects
const VIDEO_PATHS = {
  // Sample video that we know exists
  DEMO_VIDEO: homepageVideo,
  
  // Default fallback to public URL pattern - can be adjusted if needed
  DEFAULT: '/videos/'
};

// Image paths organized by exercise type
const IMAGE_PATHS = {
  // Strength exercises
  PULL_UPS: '/images/strength/pullups.gif',
  SHOULDER_PRESS: '/images/strength/dumbbell_shoulder_press.gif',
  RUSSIAN_TWISTS: '/images/strength/russian_twists.jpg',
  KETTLEBELL_SWINGS: '/images/strength/kettlebell_swings.gif',
  BICYCLE_CRUNCHES: '/images/strength/bicycle_crunches.gif',
  WALKING_LUNGES: '/images/strength/walking_lunges.gif',
  ROMANIAN_DEADLIFTS: '/images/strength/romanian_deadlifts.gif',
  BARBELL_SQUATS_GIF: '/images/strength/barbell_squats.gif',
  HANGING_LEG_RAISES: '/images/strength/hanging_leg_raises.gif',
  RUSSIAN_TWISTS_WEBP: '/images/strength/russian_twists.webp',
  PLANK_VARIATIONS: '/images/strength/plank_variations.gif',
  DEPTH_JUMPS: '/images/strength/depth_jumps.gif',
  SPRINT_INTERVALS: '/images/strength/sprint_intervals.gif',
  BOX_JUMPS: '/images/strength/box_jumps.webp',
  GLUTE_BRIDGES: '/images/strength/glute_bridges.gif',
  SEATED_FORWARD_FOLD: '/images/strength/seated_forward_fold.png',
  
  // Cardio exercises
  JUMP_SQUATS: '/images/cardio/jump_squats.gif',
  MOUNTAIN_CLIMBERS: '/images/cardio/mountain_climbers.gif',
  BURPEES_GIF: '/images/cardio/burpees.gif',
  JUMP_ROPE_GIF: '/images/cardio/jump_rope.gif',
  PLANK_TO_PUSHUP: '/images/cardio/plank_to_pushup.gif',
  ENDURANCE_RUNNER: '/images/cardio/endurance_runner.gif',
  HIGH_KNEES_GIF: '/images/cardio/high_knees.gif',
  SIDE_SHUFFLES: '/images/cardio/side_shuffles.gif',
  
  // Flexibility exercises
  DOWNWARD_DOG: '/images/flexibility/downward_dog.gif',
  CHILD_POSE: '/images/flexibility/child_pose.gif',
  WARRIOR_POSE: '/images/flexibility/warrior_pose.gif',
  HAMSTRING_STRETCH: '/images/flexibility/hamstring_stretch.gif',
  HIP_FLEXOR_STRETCH: '/images/flexibility/hip_flexor_stretch.gif',
  SHOULDER_STRETCH: '/images/flexibility/shoulder_stretch.gif',
  FOAM_ROLL_BACK: '/images/flexibility/foam_roll_back.gif',
  FOAM_ROLL_IT_BAND: '/images/flexibility/foam_roll_it_band.gif',
  CALF_STRETCH: '/images/flexibility/calf_stretch.gif',
  COBRA_POSE: '/images/flexibility/cobra_pose.gif'
};

const WorkoutDetail = ({ workout, onClose }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [videoError, setVideoError] = useState({});

  // Determine the workout category/type
  const getWorkoutType = (workoutTitle, exerciseName) => {
    const title = workoutTitle.toLowerCase();
    const exercise = exerciseName.toLowerCase();
    
    if (title.includes('cardio') || 
        title.includes('hiit') || 
        exercise.includes('jump') || 
        exercise.includes('burpee') ||
        exercise.includes('run') ||
        exercise.includes('sprint') ||
        exercise.includes('mountain climber') ||
        exercise.includes('high knee') ||
        exercise.includes('jump rope')) {
      return 'cardio';
    } else if (title.includes('flexibility') || 
        title.includes('mobility') || 
        title.includes('yoga') ||
        exercise.includes('stretch') ||
        exercise.includes('fold') ||
        exercise.includes('pose') ||
        exercise.includes('foam roll') ||
        exercise.includes('yoga')) {
      return 'flexibility';
    } else {
      return 'strength';
    }
  };

  // Function to get video source for an exercise
  const getVideoSource = (exerciseName) => {
    const workoutType = getWorkoutType(workout.title, exerciseName);
    
    // Set time offset for the demo video based on workout type
    let timeOffset = 0;
    
    if (workoutType === 'strength') {
      timeOffset = 0; // Start at the beginning for strength
    } else if (workoutType === 'cardio') {
      timeOffset = 5; // Start 5 seconds in for cardio
    } else if (workoutType === 'flexibility') {
      timeOffset = 10; // Start 10 seconds in for flexibility
    }
    
    // Return the video with a time offset to simulate different videos
    return `${homepageVideo}#t=${timeOffset}`;
  };

  // Handle video loading errors
  const handleVideoError = (exerciseName) => {
    setVideoError(prev => ({...prev, [exerciseName]: true}));
  };

  // Function to handle completing a workout
  const handleCompleteWorkout = () => {
    if (isCompleted) return; // Prevent multiple completions

    // Convert workout type to match progress tracking categories
    let workoutType = 'strength';
    if (workout.title.toLowerCase().includes('cardio') || workout.title.toLowerCase().includes('hiit')) {
      workoutType = 'cardio';
    } else if (workout.title.toLowerCase().includes('flexibility') || workout.title.toLowerCase().includes('mobility') || workout.title.toLowerCase().includes('yoga')) {
      workoutType = 'flexibility';
    } else if (workout.title.toLowerCase().includes('hiit')) {
      workoutType = 'hiit';
    }

    // Convert duration string to minutes (e.g., "30-45 minutes" -> 30)
    const durationMinutes = parseInt(workout.duration.split('-')[0].replace(/\D/g, ''));

    // Create workout data object
    const workoutData = {
      title: workout.title,
      type: workoutType,
      duration: durationMinutes,
      difficulty: workout.level.toLowerCase() === 'beginner' ? 'easy' :
                  workout.level.toLowerCase() === 'advanced' ? 'hard' : 'medium',
      notes: notes
    };

    // Update progress stats
    updateWorkoutStats(workoutType, durationMinutes);
    addWorkoutToHistory(workoutData);
    checkAchievements();

    // Show success message
    setIsCompleted(true);
    
    // Auto close after 2 seconds
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="workout-detail-overlay">
      <div className="workout-detail">
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="workout-detail-header">
          <h2>{workout.title}</h2>
          <div className="workout-meta">
            <span>{workout.duration}</span>
            <span>•</span>
            <span>{workout.level}</span>
          </div>
          <p className="workout-description">{workout.description}</p>
        </div>

        <div className="workout-exercises">
          <h3>Exercises</h3>
          {workout.exercises.map((exercise, index) => {
            const videoSrc = getVideoSource(exercise.name);
            const hasVideoError = videoError[exercise.name];
            const exerciseType = getWorkoutType(workout.title, exercise.name);

            return (
              <div key={index} className="exercise-card">
                <div className="exercise-header">
                  <h4>{exercise.name}</h4>
                  <div className="exercise-meta">
                    <span>{exercise.sets} sets</span>
                    <span>•</span>
                    <span>{exercise.reps}</span>
                    <span>•</span>
                    <span>{exercise.duration}</span>
                    <span className="exercise-type-badge">{exerciseType}</span>
                  </div>
                </div>

                <div className="video-placeholder">
                  {videoSrc && !hasVideoError ? (
                    <div className="video-container">
                      <video 
                        controls 
                        className={`exercise-video ${exerciseType}-video`}
                        onError={() => handleVideoError(exercise.name)}
                        preload="metadata"
                      >
                        <source src={videoSrc} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <div className="video-placeholder-content">
                      <p>Visual guide coming soon</p>
                    </div>
                  )}
                </div>

                <div className="exercise-instructions">
                  <h5>Instructions:</h5>
                  <pre>{exercise.instructions}</pre>
                </div>
              </div>
            );
          })}
        </div>

        <div className="workout-complete-section">
          {!isCompleted ? (
            <>
              <div className="workout-notes">
                {showNotes ? (
                  <div className="notes-form">
                    <textarea 
                      placeholder="Add notes about your workout (optional)" 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <button 
                      className="save-notes-button"
                      onClick={() => setShowNotes(false)}
                    >
                      Save Notes
                    </button>
                  </div>
                ) : (
                  <button 
                    className="add-notes-button"
                    onClick={() => setShowNotes(true)}
                  >
                    Add Notes
                  </button>
                )}
              </div>
              <button 
                className="complete-workout-button"
                onClick={handleCompleteWorkout}
              >
                Complete Workout
              </button>
            </>
          ) : (
            <div className="workout-completed-message">
              <span className="success-icon">✓</span>
              <p>Workout completed! Progress updated.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

WorkoutDetail.propTypes = {
  workout: PropTypes.shape({
    title: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    level: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    exercises: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        sets: PropTypes.number.isRequired,
        reps: PropTypes.string.isRequired,
        duration: PropTypes.string.isRequired,
        videoUrl: PropTypes.string,
        instructions: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default WorkoutDetail; 