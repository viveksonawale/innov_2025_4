import { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { createUserProfile } from '../firebase/authUtils';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    workoutsCompleted: 0,
    daysActive: 0,
    achievements: []
  });

  const { currentUser, login, signup, logout, resetPassword, updateUserProfile } = useAuth();

  // Fetch user stats when user is logged in
  useEffect(() => {
    async function fetchUserStats() {
      if (currentUser && currentUser.uid) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserStats({
              workoutsCompleted: userData.workoutsCompleted || 0,
              daysActive: userData.progress?.statistics?.daysActive || 0,
              achievements: userData.progress?.achievements || []
            });
          }
        } catch (err) {
          console.error('Error fetching user stats:', err);
        }
      }
    }
    
    fetchUserStats();
  }, [currentUser]);

  async function handleLogin(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      setMessage('Successfully logged in!');
    } catch (err) {
      setError('Failed to log in: ' + err.message);
    }
    
    setLoading(false);
  }

  async function handleSignup(e) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      const userCredential = await signup(email, password);
      
      // Update user profile with display name
      await updateUserProfile(userCredential.user, { displayName });
      
      // Create user profile in Firestore
      await createUserProfile(userCredential.user);
      
      setMessage('Account created successfully!');
      setActiveTab('login');
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    }
    
    setLoading(false);
  }

  async function handleLogout() {
    setError('');
    
    try {
      await logout();
      setMessage('Logged out successfully');
    } catch (err) {
      setError('Failed to log out: ' + err.message);
    }
  }

  async function handlePasswordReset(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError('Failed to reset password: ' + err.message);
    }
    
    setLoading(false);
  }

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      
      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}
      
      {currentUser ? (
        <div className="profile-info">
          <h2>Welcome, {currentUser.displayName || 'User'}</h2>
          <p>Email: {currentUser.email}</p>
          <button 
            className="logout-button"
            onClick={handleLogout}
            disabled={loading}
          >
            Log Out
          </button>
          <div className="profile-stats">
            <h3>Your Fitness Stats</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Workouts Completed</h4>
                <p className="stat-value">{userStats.workoutsCompleted}</p>
              </div>
              <div className="stat-card">
                <h4>Days Active</h4>
                <p className="stat-value">{userStats.daysActive}</p>
              </div>
              <div className="stat-card">
                <h4>Achievements</h4>
                <p className="stat-value">{userStats.achievements.length}</p>
              </div>
            </div>
            {userStats.achievements.length > 0 && (
              <div className="achievements-list">
                <h3>Your Achievements</h3>
                <ul>
                  {userStats.achievements.map((achievement, index) => (
                    <li key={index}>
                      <span className="achievement-title">{achievement.title}</span>
                      <span className="achievement-date">
                        {new Date(achievement.date).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="auth-tabs">
            <button 
              className={activeTab === 'login' ? 'active' : ''}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button 
              className={activeTab === 'signup' ? 'active' : ''}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
            <button 
              className={activeTab === 'reset' ? 'active' : ''}
              onClick={() => setActiveTab('reset')}
            >
              Reset Password
            </button>
          </div>
          
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                Login
              </button>
            </form>
          )}
          
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="auth-form">
              <div className="form-group">
                <label htmlFor="signup-name">Display Name</label>
                <input
                  id="signup-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-confirm">Confirm Password</label>
                <input
                  id="signup-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                Sign Up
              </button>
            </form>
          )}
          
          {activeTab === 'reset' && (
            <form onSubmit={handlePasswordReset} className="auth-form">
              <div className="form-group">
                <label htmlFor="reset-email">Email</label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                Reset Password
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default Profile; 