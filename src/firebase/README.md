# Firebase Authentication Setup

This application uses Firebase Authentication and Firestore for user management. Follow these steps to set up Firebase for this project:

## Setup Instructions

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the steps to create a new project
   - Enable Google Analytics if desired

2. **Register your application**
   - In your Firebase project, click "Add app" and select the web icon
   - Register your app with a nickname (e.g., "Fitnest")
   - Copy the Firebase configuration object

3. **Update Firebase Configuration**
   - Open `src/firebase/config.js`
   - Replace the placeholder values in the `firebaseConfig` object with your Firebase project values:
   ```js
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```

4. **Enable Authentication Methods**
   - In the Firebase Console, go to Authentication > Sign-in method
   - Enable Email/Password authentication
   - You can also enable other providers like Google, Facebook, etc. if needed

5. **Set up Firestore Database**
   - In the Firebase Console, go to Firestore Database
   - Click "Create database"
   - Choose "Start in production mode" and select a location close to your users
   - Create the database

6. **Deploy Firestore Rules**
   - Go to Firestore Database > Rules
   - Copy the rules from `src/firebase/firestore.rules` and paste them into the rules editor
   - Click "Publish"

## Firebase Structure

The application uses the following Firebase structure:

- **Authentication:** For user sign-up, login, and management
- **Firestore:** For storing user profiles and workout data
  - `/users/{userId}`: User profile information
  - `/workouts/{workoutId}`: Public workout templates

## Authentication Features

- Email/Password sign up and login
- Password reset functionality
- User profile management
- Protected routes for authenticated users

## Help and Support

If you encounter any issues with Firebase setup, refer to the [Firebase Documentation](https://firebase.google.com/docs). 