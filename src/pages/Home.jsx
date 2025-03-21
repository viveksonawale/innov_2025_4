import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import homepageVideo from '../assets/videos/HomeVideos/homepageVideo.mp4'

const Home = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleGetStarted = () => {
    navigate('/workouts');
  };

  const handleLearnMore = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <header className="hero">
        <div className="hero-video">
          <video autoPlay muted loop playsInline className="background-video">
            <source src={homepageVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="overlay"></div>
        </div>
        <div className="hero-content">
          <h1>Your Personal Home Workout Guide</h1>
          <p>Transform your life with personalized workout routines, expert guidance, and progress tracking tools designed for your fitness journey</p>
          <div className="hero-cta">
            <button onClick={handleGetStarted}>Get Started</button>
            <button onClick={handleLearnMore}>Learn More</button>
          </div>
        </div>
      </header>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>About Fitnest</h2>
            <p>Fitnest is your ultimate home workout companion designed to help you achieve your fitness goals without expensive gym memberships.</p>
            <p>Our app features:</p>
            <ul>
              <li>Personalized workout routines based on your fitness level</li>
              <li>Step-by-step exercise instructions with video demonstrations</li>
              <li>Progress tracking to monitor your fitness journey</li>
              <li>Customizable workout schedules to fit your lifestyle</li>
              <li>Nutrition tips and advice to complement your workout routine</li>
            </ul>
            <p>Start your fitness journey today with Fitnest and transform your life from the comfort of your home!</p>
          </div>
        </div>
      )}

      <main>
        <section className="progress-tracking">
          <h2>Track Your Progress</h2>
          <div className="progress-cards">
            <div className="progress-card">
              <h3>Weekly Workouts</h3>
              <div className="progress-circle">4/5</div>
            </div>
            <div className="progress-card">
              <h3>Calories Burned</h3>
              <div className="progress-circle">2,500</div>
            </div>
            <div className="progress-card">
              <h3>Workout Streak</h3>
              <div className="progress-circle">7 days</div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default Home 