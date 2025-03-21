import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import './Chatbot.css';
import { FaTimes } from 'react-icons/fa';
import { FaComments } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa';
import { FaPaperPlane } from 'react-icons/fa';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Hi there! I'm your fitness assistant. How can I help you today?", 
      sender: 'bot',
      actions: [
        { text: 'Workout recommendations', action: () => setInput('recommend a workout') },
        { text: 'Exercise tips', action: () => setInput('exercise tips') },
        { text: 'Nutrition advice', action: () => setInput('nutrition tips') }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const historyLoadedRef = useRef(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Load chat history for logged in users
  useEffect(() => {
    const loadChatHistory = async () => {
      if (currentUser && currentUser.uid && !historyLoadedRef.current) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.chatHistory && userData.chatHistory.length > 0) {
              // Only load history if it exists and not already loaded
              if (messages.length === 1) {
                const welcomeMessage = { 
                  text: `Welcome back, ${currentUser.displayName || 'fitness enthusiast'}! How can I help with your fitness journey today?`, 
                  sender: 'bot',
                  actions: [
                    { text: 'Workout recommendations', action: () => setInput('recommend a workout') },
                    { text: 'Exercise tips', action: () => setInput('exercise tips') },
                    { text: 'Nutrition advice', action: () => setInput('nutrition tips') }
                  ]
                };
                
                setMessages([welcomeMessage, ...userData.chatHistory]);
                historyLoadedRef.current = true;
              }
            }
          }
        } catch (err) {
          console.error('Error loading chat history:', err);
        }
      }
    };
    
    if (isOpen) {
      loadChatHistory();
    }
  }, [currentUser, isOpen]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Reset history loaded flag when user changes
  useEffect(() => {
    if (!currentUser) {
      historyLoadedRef.current = false;
    }
  }, [currentUser]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Save chat message to Firebase
  const saveChatMessage = async (message) => {
    if (currentUser && currentUser.uid) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          // Check if chatHistory field exists
          await updateDoc(userRef, {
            chatHistory: arrayUnion({
              ...message,
              timestamp: serverTimestamp()
            })
          });
        } else {
          // Create user document with chatHistory if it doesn't exist
          await setDoc(userRef, {
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            chatHistory: [{
              ...message,
              timestamp: serverTimestamp()
            }]
          });
        }
      } catch (err) {
        console.error('Error saving chat message:', err);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = { text: input, sender: 'user' };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to Firebase
    await saveChatMessage(userMessage);
    
    // Clear input and show typing indicator
    setInput('');
    setIsTyping(true);
    
    // Simulate bot "thinking"
    setTimeout(async () => {
      // Generate response
      const botResponse = generateResponse(input, currentUser);
      
      // Add bot response to chat
      setMessages(prev => [...prev, botResponse]);
      
      // Save bot response to Firebase
      await saveChatMessage(botResponse);
      
      // Hide typing indicator
      setIsTyping(false);
    }, 1000);
  };

  // Navigate to different pages
  const navigateTo = (path) => {
    // Add a navigation message
    const navMessage = { 
      text: `Opening ${path.replace('/', '')} page...`,
      sender: 'bot',
      actions: [] // Add empty actions array to prevent errors
    };
    
    setMessages(prevMessages => [...prevMessages, navMessage]);
    
    // Save navigation message to Firebase
    saveChatMessage(navMessage);
    
    // Close chat
    setIsOpen(false);
    
    // Navigate after a short delay (allows message to be seen)
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  // Handle clearing chat history
  const handleClearChat = async () => {
    // Reset to initial message
    setMessages([
      { 
        text: "I've cleared our conversation. How else can I help you?", 
        sender: 'bot',
        actions: [
          { text: 'Workout recommendations', action: () => setInput('recommend a workout') },
          { text: 'Exercise tips', action: () => setInput('exercise tips') },
          { text: 'Nutrition advice', action: () => setInput('nutrition tips') }
        ]
      }
    ]);
    
    // Reset history loaded flag
    historyLoadedRef.current = false;
    
    // Clear chat history in Firebase
    if (currentUser && currentUser.uid) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          await updateDoc(userRef, {
            chatHistory: []
          });
        } else {
          console.error("User document doesn't exist when trying to clear chat history");
        }
      } catch (err) {
        console.error('Error clearing chat history:', err);
      }
    }
  };

  const generateResponse = (userInput, user) => {
    const input = userInput.toLowerCase();
    
    // Greeting patterns
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return { 
        text: `Hi ${user ? user.displayName || 'there' : 'there'}! How can I help with your fitness journey today?`, 
        sender: 'bot',
        actions: [
          { text: 'Workout recommendations', action: () => setInput('recommend a workout') },
          { text: 'Exercise tips', action: () => setInput('exercise tips') },
          { text: 'Nutrition advice', action: () => setInput('nutrition tips') }
        ]
      };
    }
    
    // Workout recommendation patterns
    if (input.includes('workout') && (input.includes('recommend') || input.includes('suggestion'))) {
      if (input.includes('beginner')) {
        return {
          text: 'For beginners, I recommend our "Beginner Full-Body Routine". It focuses on building fundamental strength and proper form. Would you like me to navigate you to our workout section?',
          sender: 'bot',
          actions: [
            { text: 'Show me workouts', action: () => navigateTo('/workouts') }
          ]
        };
      } else if (input.includes('strength') || input.includes('muscle')) {
        return {
          text: 'To build strength, try our "Advanced Strength Training" workout. It includes compound exercises like squats, deadlifts, and bench press to maximize muscle growth.',
          sender: 'bot',
          actions: [
            { text: 'Show me strength workouts', action: () => navigateTo('/workouts') }
          ]
        };
      } else if (input.includes('cardio')) {
        return {
          text: 'For cardio, our "HIIT Cardio Blast" is excellent for burning calories and improving endurance. It alternates between high-intensity bursts and short recovery periods.',
          sender: 'bot',
          actions: [
            { text: 'Show me cardio workouts', action: () => navigateTo('/workouts') }
          ]
        };
      } else if (input.includes('flexibility') || input.includes('stretch')) {
        return {
          text: 'To improve flexibility, try our "Full Body Flexibility" routine. It includes dynamic and static stretches to increase your range of motion and prevent injuries.',
          sender: 'bot',
          actions: [
            { text: 'Show me flexibility workouts', action: () => navigateTo('/workouts') }
          ]
        };
      } else {
        return { 
          text: 'Based on your profile, I recommend trying our "Full Body Strength" workout. It\'s perfect for building overall strength and endurance! Would you like to see our workout selection?', 
          sender: 'bot',
          actions: [
            { text: 'Show me workouts', action: () => navigateTo('/workouts') }
          ]
        };
      }
    }
    
    // Progress tracking patterns
    if (input.includes('progress') || input.includes('stats') || input.includes('tracking')) {
      if (user) {
        return { 
          text: 'You can view your complete progress in the Progress tab. There you\'ll find your workout history, personal records, and body measurements. Would you like to go there now?', 
          sender: 'bot',
          actions: [
            { text: 'Go to Progress', action: () => navigateTo('/progress') }
          ]
        };
      } else {
        return { 
          text: 'To track your progress, please create an account or log in. This will help you monitor your fitness journey over time.', 
          sender: 'bot',
          actions: [
            { text: 'Sign up/Login', action: () => navigateTo('/profile') }
          ]
        };
      }
    }
    
    // Exercise specific advice
    if (input.includes('squat')) {
      return {
        text: 'For proper squat form: Stand with feet shoulder-width apart, keep your back straight, chest up, and squat down until your thighs are parallel to the ground. Common mistakes include rounding your back and letting your knees cave inward.',
        sender: 'bot',
        actions: [
          { text: 'Show related workouts', action: () => navigateTo('/workouts') }
        ]
      };
    }
    
    if (input.includes('push up') || input.includes('pushup')) {
      return {
        text: 'For perfect push-ups: Start in plank position, hands slightly wider than shoulders. Keep your body in a straight line, lower your chest to the floor, then push back up. If regular push-ups are too challenging, try them from your knees first.',
        sender: 'bot',
        actions: [
          { text: 'Show related workouts', action: () => navigateTo('/workouts') }
        ]
      };
    }
    
    if (input.includes('plank')) {
      return {
        text: 'For an effective plank: Forearms on the ground, elbows under shoulders, body in a straight line from head to heels. Engage your core and hold the position. Start with 20 seconds and gradually increase duration as you get stronger.',
        sender: 'bot',
        actions: [
          { text: 'Try core workouts', action: () => navigateTo('/workouts') }
        ]
      };
    }
    
    // Additional exercises
    if (input.includes('deadlift')) {
      return {
        text: 'For deadlift form: Stand with feet hip-width apart, barbell over midfoot. Hinge at hips, grab bar with hands just outside knees. Keep chest up, back flat, and push through heels to stand tall. Avoid rounding your lower back, which is a common injury risk.',
        sender: 'bot',
        actions: [
          { text: 'Show strength workouts', action: () => navigateTo('/workouts') }
        ]
      };
    }
    
    if (input.includes('burpee')) {
      return {
        text: 'Burpees are a full-body exercise: Start standing, drop to a squat position, kick feet back to plank, do a push-up, return to squat, and jump up with arms overhead. Modify by removing the push-up or jump if needed. Great for cardio and strength!',
        sender: 'bot',
        actions: [
          { text: 'Show HIIT workouts', action: () => navigateTo('/workouts') }
        ]
      };
    }
    
    if (input.includes('lunge') || input.includes('lunges')) {
      return {
        text: 'For proper lunges: Step forward with one leg, lowering your hips until both knees are bent at about 90 degrees. Front knee should be over ankle, not pushing past your toes. Keep torso upright and core engaged. Great for targeting quads, hamstrings, and glutes!',
        sender: 'bot',
        actions: [
          { text: 'Show leg workouts', action: () => navigateTo('/workouts') }
        ]
      };
    }
    
    // Diet and nutrition patterns
    if (input.includes('diet') || input.includes('nutrition') || input.includes('food') || input.includes('eat')) {
      if (input.includes('protein') || input.includes('muscle')) {
        return {
          text: 'For muscle building, aim for 1.6-2.2g of protein per kg of body weight daily. Good sources include chicken, turkey, lean beef, fish, eggs, Greek yogurt, cottage cheese, and plant-based options like tofu and legumes.',
          sender: 'bot',
          actions: [
            { text: 'Workout tips', action: () => setInput('workout for muscle building') },
            { text: 'More nutrition info', action: () => setInput('nutrition tips') }
          ]
        };
      } else if (input.includes('weight loss') || input.includes('fat') || input.includes('calorie')) {
        return {
          text: 'For weight loss, focus on creating a moderate calorie deficit (300-500 calories) through both diet and exercise. Emphasize whole foods, lean proteins, and plenty of vegetables. Stay hydrated and limit processed foods and added sugars.',
          sender: 'bot',
          actions: [
            { text: 'Cardio workouts', action: () => setInput('cardio workout recommendations') },
            { text: 'Meal planning', action: () => setInput('meal plan for weight loss') }
          ]
        };
      } else if (input.includes('pre workout') || input.includes('before workout')) {
        return {
          text: 'For pre-workout nutrition, eat a balanced meal 2-3 hours before or a small snack 30-60 minutes before. Include carbs for energy (fruit, oats, rice) and some protein. Hydrate well and consider caffeine for performance if tolerated.',
          sender: 'bot',
          actions: [
            { text: 'Workout suggestions', action: () => navigateTo('/workouts') },
            { text: 'Post-workout nutrition', action: () => setInput('post workout nutrition') }
          ]
        };
      } else if (input.includes('post workout') || input.includes('after workout') || input.includes('recovery')) {
        return {
          text: 'After working out, aim to consume protein and carbs within 30-60 minutes. This "anabolic window" helps muscle recovery and glycogen replenishment. A protein shake with a banana or a meal with chicken and rice are good options.',
          sender: 'bot',
          actions: [
            { text: 'Recovery tips', action: () => setInput('recovery tips') },
            { text: 'Pre-workout nutrition', action: () => setInput('pre workout nutrition') }
          ]
        };
      } else {
        return { 
          text: 'For optimal fitness results, focus on a balanced diet with lean proteins, complex carbohydrates, and healthy fats. Would you like some specific meal suggestions for your fitness goals?', 
          sender: 'bot',
          actions: [
            { text: 'Weight loss tips', action: () => setInput('nutrition for weight loss') },
            { text: 'Muscle building tips', action: () => setInput('nutrition for muscle building') }
          ]
        };
      }
    }
    
    // Account and profile patterns
    if (input.includes('account') || input.includes('profile') || input.includes('login') || input.includes('sign up')) {
      return { 
        text: 'You can manage your account, sign up, or log in from our Profile page. Would you like to go there now?', 
        sender: 'bot',
        actions: [
          { text: 'Go to Profile', action: () => navigateTo('/profile') }
        ] 
      };
    }
    
    // Workout tracking questions
    if (input.includes('track workout') || input.includes('log workout')) {
      if (user) {
        return {
          text: 'You can track your workouts by completing them in our workout section. After finishing, you can add notes and it will be automatically saved to your progress history.',
          sender: 'bot',
          actions: [
            { text: 'Go to Workouts', action: () => navigateTo('/workouts') }
          ]
        };
      } else {
        return {
          text: 'To track your workouts, you\'ll need to create an account first. This lets you save your history and monitor your progress over time.',
          sender: 'bot',
          actions: [
            { text: 'Create Account', action: () => navigateTo('/profile') }
          ]
        };
      }
    }
    
    // Injury prevention
    if (input.includes('injury') || input.includes('pain') || (input.includes('prevent') && input.includes('injury'))) {
      return {
        text: 'To prevent injuries: Always warm up properly, use correct form, increase intensity gradually, listen to your body, and incorporate rest days. If you have pain that persists, consult a healthcare professional.',
        sender: 'bot',
        actions: [
          { text: 'Workout safety tips', action: () => setInput('workout safely') },
          { text: 'Recovery advice', action: () => setInput('recovery tips') }
        ]
      };
    }
    
    // Rest and recovery
    if (input.includes('rest') || input.includes('recovery') || input.includes('soreness') || input.includes('doms')) {
      return {
        text: 'Recovery is crucial for fitness progress. Include rest days, get 7-9 hours of sleep, stay hydrated, and consider active recovery like walking or yoga. For muscle soreness (DOMS), light activity, proper nutrition, and foam rolling can help.',
        sender: 'bot',
        actions: [
          { text: 'Nutrition for recovery', action: () => setInput('post workout nutrition') },
          { text: 'Stretching routines', action: () => navigateTo('/workouts') }
        ]
      };
    }
    
    // Help patterns
    if (input.includes('help') || input.includes('guide') || input.includes('how to')) {
      return {
        text: 'I can help with workout recommendations, exercise form, tracking progress, nutrition advice, and account management. Just ask me anything about your fitness journey!',
        sender: 'bot',
        actions: [
          { text: 'Workout recommendations', action: () => setInput('recommend a workout') },
          { text: 'Nutrition advice', action: () => setInput('nutrition tips') }
        ]
      };
    }
    
    // Thank you patterns
    if (input.includes('thank')) {
      return { 
        text: "You're welcome! I'm always here to help with your fitness needs. Let me know if you have any other questions.", 
        sender: 'bot',
        actions: [
          { text: 'More help', action: () => setInput('help') }
        ]
      };
    }
    
    // Default response
    return { 
      text: "I'm not sure I understand. Try asking about workouts, exercise form, tracking progress, or nutrition advice.", 
      sender: 'bot',
      actions: [
        { text: 'Help me with workouts', action: () => setInput('recommend a workout') },
        { text: 'Nutrition advice', action: () => setInput('nutrition tips') }
      ]
    };
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      <button 
        className="chatbot-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <FaTimes size="16" /> : <FaComments size="16" />}
      </button>
      
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Fitness Assistant</h3>
            <div className="chatbot-controls">
              <button 
                onClick={handleClearChat} 
                className="clear-chat-btn" 
                aria-label="Clear chat"
              >
                <FaTrash size="14" />
              </button>
            </div>
          </div>
          
          <div className="chatbot-messages" ref={messagesEndRef}>
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.sender}`}
              >
                <div className="message-text">{message.text}</div>
                {message.actions && message.actions.length > 0 && (
                  <div className="message-actions">
                    {message.actions.map((action, actionIndex) => (
                      <button 
                        key={actionIndex} 
                        className="action-button"
                        onClick={action.action}
                      >
                        {action.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
          
          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              <FaPaperPlane size="14" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 