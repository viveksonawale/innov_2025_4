import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

// Initialize user profile in Firestore when a new user signs up
export const createUserProfile = async (user) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);
  
  if (!userSnapshot.exists()) {
    try {
      await setDoc(userRef, {
        displayName: user.displayName || '',
        email: user.email,
        createdAt: serverTimestamp(),
        workoutsCompleted: 0,
        daysActive: 0,
        achievements: [],
        workoutHistory: [],
        settings: {
          showRest: true,
          countdownTimer: true,
          darkMode: false
        }
      });
      return userRef;
    } catch (error) {
      console.error('Error creating user profile', error);
    }
  }
  
  return userRef;
};

// Get user profile data from Firestore
export const getUserProfile = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnapshot = await getDoc(userRef);
  
  if (userSnapshot.exists()) {
    return userSnapshot.data();
  }
  
  return null;
};

// Update user profile in Firestore
export const updateUserProfile = async (userId, data) => {
  const userRef = doc(db, 'users', userId);
  
  try {
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile', error);
    return false;
  }
};

// Add a completed workout to user history
export const addWorkoutToHistory = async (userId, workout) => {
  const userRef = doc(db, 'users', userId);
  
  try {
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const workoutHistory = userData.workoutHistory || [];
      const workoutsCompleted = userData.workoutsCompleted || 0;
      
      // Add the workout to history with timestamp
      workoutHistory.push({
        ...workout,
        completedAt: serverTimestamp()
      });
      
      // Update the user document
      await updateDoc(userRef, {
        workoutHistory: workoutHistory,
        workoutsCompleted: workoutsCompleted + 1,
        updatedAt: serverTimestamp()
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error adding workout to history', error);
    return false;
  }
}; 