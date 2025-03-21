export const progressData = {
  statistics: {
    totalWorkouts: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyWorkouts: 0,
    monthlyWorkouts: 0,
    totalDuration: 0,
    lastWorkoutDate: null,
    workoutTypes: {
      strength: 0,
      cardio: 0,
      flexibility: 0,
      hiit: 0
    }
  },
  personalRecords: {
    exercises: {
      squats: { weight: 0, reps: 0, date: null },
      deadlifts: { weight: 0, reps: 0, date: null },
      benchPress: { weight: 0, reps: 0, date: null },
      pullUps: { reps: 0, date: null },
      pushUps: { reps: 0, date: null },
      running: { distance: 0, time: 0, date: null }
    }
  },
  measurements: {
    weight: [],
    bodyFat: [],
    chest: [],
    waist: [],
    hips: [],
    arms: [],
    legs: [],
    photos: []
  },
  performance: {
    endurance: {
      running: { distance: 0, time: 0 },
      cycling: { distance: 0, time: 0 }
    },
    strength: {
      maxWeight: 0,
      totalVolume: 0
    },
    flexibility: {
      sitAndReach: 0,
      shoulderMobility: 0
    },
    recovery: {
      restingHeartRate: 0,
      sleepQuality: 0
    }
  },
  achievements: {
    badges: [
      {
        id: 'first_workout',
        name: 'First Workout',
        description: 'Completed your first workout',
        icon: '🎯',
        earned: false,
        date: null
      },
      {
        id: 'streak_7',
        name: '7-Day Streak',
        description: 'Worked out for 7 days straight',
        icon: '🔥',
        earned: false,
        date: null
      },
      {
        id: 'streak_30',
        name: '30-Day Streak',
        description: 'Worked out for 30 days straight',
        icon: '🌟',
        earned: false,
        date: null
      },
      {
        id: 'strength_master',
        name: 'Strength Master',
        description: 'Completed 50 strength workouts',
        icon: '💪',
        earned: false,
        date: null
      },
      {
        id: 'cardio_king',
        name: 'Cardio King',
        description: 'Completed 50 cardio workouts',
        icon: '🏃',
        earned: false,
        date: null
      }
    ]
  },
  workoutHistory: []
}; 