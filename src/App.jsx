import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Workouts from './pages/Workouts'
import Progress from './components/Progress'
import Profile from './pages/Profile'
import Chatbot from './components/Chatbot'
import { useState } from 'react'
import './pages/Profile.css'
import logoImage from './assets/logo/dark.png'

function App() {
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="logo hover-underline">
            <img src={logoImage} alt="Fitnest Logo" className="logo-icon" />
            Fitnest
          </div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/workouts">Workouts</Link>
            <Link to="/progress">Progress</Link>
            <Link to="/profile">Profile</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/workouts" 
            element={
              <Workouts 
                onWorkoutSelect={setSelectedWorkout}
                selectedWorkout={selectedWorkout}
              />
            } 
          />
          <Route path="/progress" element={<Progress />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>

        <footer>
          <p>© 2024 Fitnest. All rights reserved.</p>
        </footer>
        
        {/* Chatbot component */}
        <Chatbot />
      </div>
    </Router>
  )
}

export default App
