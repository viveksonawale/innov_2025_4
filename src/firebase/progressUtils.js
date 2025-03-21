import { 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';
import { progressData } from '../data/progressData';

// Initialize progress data from Firestore or use default
export const initializeFirebaseProgress = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      // If user has progress data, return it
      if (userData.progress) {
        return userData.progress;
      }
      
      // If no progress data, initialize it
      await updateDoc(userRef, {
        progress: progressData,
        updatedAt: serverTimestamp()
      });
    }
    
    return progressData;
  } catch (error) {
    console.error('Error initializing Firebase progress', error);
    return progressData;
  }
};

// Update workout statistics in Firebase
export const updateFirebaseWorkoutStats = async (userId, workoutType, duration) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const progress = userData.progress || progressData;
      
      // Update total workouts
      progress.statistics.totalWorkouts += 1;
      
      // Update workout type count
      progress.statistics.workoutTypes[workoutType.toLowerCase()] += 1;
      
      // Parse duration to ensure it's a number
      const durationInMinutes = typeof duration === 'string' 
        ? parseInt(duration.replace(/[^0-9]/g, ''), 10) 
        : Number(duration);
      
      // Update total duration only if we have a valid number
      if (!isNaN(durationInMinutes)) {
        progress.statistics.totalDuration += durationInMinutes;
      }
      
      // Update streaks
      const today = new Date();
      const lastWorkout = progress.statistics.lastWorkoutDate 
        ? new Date(progress.statistics.lastWorkoutDate)
        : null;
      
      if (lastWorkout) {
        const daysSinceLastWorkout = Math.floor(
          (today - lastWorkout) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastWorkout === 1) {
          progress.statistics.currentStreak += 1;
          if (progress.statistics.currentStreak > progress.statistics.longestStreak) {
            progress.statistics.longestStreak = progress.statistics.currentStreak;
          }
        } else if (daysSinceLastWorkout > 1) {
          progress.statistics.currentStreak = 1;
        }
      } else {
        progress.statistics.currentStreak = 1;
      }
      
      progress.statistics.lastWorkoutDate = today.toISOString();
      
      // Update weekly and monthly counts
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      
      if (!progress.statistics.weeklyWorkouts) {
        progress.statistics.weeklyWorkouts = 0;
      }
      if (!progress.statistics.monthlyWorkouts) {
        progress.statistics.monthlyWorkouts = 0;
      }
      
      if (lastWorkout && lastWorkout >= weekStart) {
        progress.statistics.weeklyWorkouts += 1;
      } else {
        progress.statistics.weeklyWorkouts = 1;
      }
      
      if (lastWorkout && lastWorkout >= monthStart) {
        progress.statistics.monthlyWorkouts += 1;
      } else {
        progress.statistics.monthlyWorkouts = 1;
      }
      
      // Update user document with new progress data
      await updateDoc(userRef, {
        progress: progress,
        workoutsCompleted: userData.workoutsCompleted + 1,
        updatedAt: serverTimestamp()
      });
      
      return progress;
    }
    
    return null;
  } catch (error) {
    console.error('Error updating Firebase workout stats', error);
    return null;
  }
};

// Update personal record in Firebase
export const updateFirebasePersonalRecord = async (userId, exercise, data) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const progress = userData.progress || progressData;
      
      if (!progress.personalRecords.exercises[exercise]) {
        progress.personalRecords.exercises[exercise] = {};
      }
      
      const currentRecord = progress.personalRecords.exercises[exercise];
      
      // Update only if new record is better
      if (data.weight && (!currentRecord.weight || data.weight > currentRecord.weight)) {
        currentRecord.weight = data.weight;
        currentRecord.date = new Date().toISOString();
      }
      
      if (data.reps && (!currentRecord.reps || data.reps > currentRecord.reps)) {
        currentRecord.reps = data.reps;
        currentRecord.date = new Date().toISOString();
      }
      
      if (data.distance && (!currentRecord.distance || data.distance > currentRecord.distance)) {
        currentRecord.distance = data.distance;
        currentRecord.date = new Date().toISOString();
      }
      
      if (data.time && (!currentRecord.time || data.time < currentRecord.time)) {
        currentRecord.time = data.time;
        currentRecord.date = new Date().toISOString();
      }
      
      // Update user document with new progress data
      await updateDoc(userRef, {
        progress: progress,
        updatedAt: serverTimestamp()
      });
      
      return progress;
    }
    
    return null;
  } catch (error) {
    console.error('Error updating Firebase personal record', error);
    return null;
  }
};

// Add measurement to Firebase
export const addFirebaseMeasurement = async (userId, type, value) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const progress = userData.progress || progressData;
      
      if (!progress.measurements[type]) {
        progress.measurements[type] = [];
      }
      
      progress.measurements[type].push({
        value,
        date: new Date().toISOString()
      });
      
      // Update user document with new progress data
      await updateDoc(userRef, {
        progress: progress,
        updatedAt: serverTimestamp()
      });
      
      return progress;
    }
    
    return null;
  } catch (error) {
    console.error('Error adding Firebase measurement', error);
    return null;
  }
};

// Add progress photo to Firebase
export const addFirebaseProgressPhoto = async (userId, photoUrl) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const progress = userData.progress || progressData;
      
      progress.measurements.photos.push({
        url: photoUrl,
        date: new Date().toISOString()
      });
      
      // Update user document with new progress data
      await updateDoc(userRef, {
        progress: progress,
        updatedAt: serverTimestamp()
      });
      
      return progress;
    }
    
    return null;
  } catch (error) {
    console.error('Error adding Firebase progress photo', error);
    return null;
  }
};

// Update performance metric in Firebase
export const updateFirebasePerformanceMetric = async (userId, category, metric, value) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const progress = userData.progress || progressData;
      
      if (!progress.performance[category]) {
        progress.performance[category] = {};
      }
      
      progress.performance[category][metric] = value;
      
      // Update user document with new progress data
      await updateDoc(userRef, {
        progress: progress,
        updatedAt: serverTimestamp()
      });
      
      return progress;
    }
    
    return null;
  } catch (error) {
    console.error('Error updating Firebase performance metric', error);
    return null;
  }
};

// Add workout to history in Firebase
export const addFirebaseWorkoutToHistory = async (userId, workout) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const progress = userData.progress || progressData;
      
      const workoutWithDate = {
        ...workout,
        date: new Date().toISOString()
      };
      
      progress.workoutHistory.unshift(workoutWithDate);
      
      // Keep only last 100 workouts
      if (progress.workoutHistory.length > 100) {
        progress.workoutHistory = progress.workoutHistory.slice(0, 100);
      }
      
      // Update user document with new progress data
      await updateDoc(userRef, {
        progress: progress,
        workoutHistory: arrayUnion(workoutWithDate),
        updatedAt: serverTimestamp()
      });
      
      return progress;
    }
    
    return null;
  } catch (error) {
    console.error('Error adding Firebase workout to history', error);
    return null;
  }
}; 