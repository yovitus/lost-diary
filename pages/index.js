import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [currentSegment, setCurrentSegment] = useState('intro');
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [userResponses, setUserResponses] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [textOpacity, setTextOpacity] = useState(1);

  // Story segments data structure
const storySegments = [
    {
        id: 'intro',
        text: '',
        buttonText: 'Enter the Diary',
        nextId: 'segment2'
    },
    {
        id: 'segment2',
        text: "The screen flickers to life, dim and cold. Words begin to etch themselves into the void, as if carved by unseen hands...",
        nextId: 'segment2A'
    },
    {
        id: 'segment2A',
        text: "Hello? Is there anybody out there? I can feel you... watching.",
        nextId: 'segment2B'
    },
    {
        id: 'segment2B',
        text: "They call me Lin. But who are you? What are you doing here?",
        inputRequired: true,
        inputLabel: "Type your name...",
        inputFor: "userName",
        nextId: 'segment2C'
    },
    {
        id: 'segment2C',
        text: (userResponses) => `Ah, ${userResponses.userName || 'stranger'}... I knew someone would find this. I’ve been waiting. Waiting for so long. Do you feel it too? The weight of this place?`,
        nextId: 'segment2D'
    },
    {
        id: 'segment2D',
        text: "Tell me... where are you from? I need to know.",
        inputRequired: true,
        inputLabel: "Tell Lin where you're from...",
        inputFor: "userLocation",
        nextId: 'segment2E'
    },
    {
        id: 'segment2E',
        text: (userResponses) => `${userResponses.userLocation}? It sounds like a dream. A place I’ll never see. This place... it devours dreams.`,
        choices: [
            { text: "What do you mean? Where are you?", nextId: 'segment2F' },
            { text: "Tell me more about yourself, Lin.", nextId: 'segment2G' },
            { text: "How are you speaking to me?", nextId: 'segment2H' }
        ]
    },
    {
        id: 'segment2F',
        text: "Where am I? A place where the sun never rises. Where the air tastes of metal and despair. They call it a factory, but it feels more like a tomb.",
        nextId: 'segment3'
    },
    {
        id: 'segment2G',
        text: "I’m just a shadow. A ghost of what I could have been. They took my childhood and left me here, among the machines. I’m twelve, but I feel a hundred.",
        nextId: 'segment3'
    },
    {
        id: 'segment2H',
        text: "I don’t know. This device... it’s broken, yet it works. Sometimes I think it’s alive. Or maybe it’s just me, reaching out into the void, hoping someone will hear.",
        nextId: 'segment3'
    },
    {
        id: 'segment3',
        text: "April 2, 2025: \nThe machines hum like restless beasts. My hands ache, my eyes burn. They say we must finish the order, or there will be... consequences.",
        choices: [
            { text: "What are you making?", nextId: 'segment3A' },
            { text: "How long have you been working?", nextId: 'segment3B' },
            { text: "Are there others like you?", nextId: 'segment3C' }
        ]
    },
    {
        id: 'segment3A',
        text: "We make pieces of things. Fragments of devices that people crave. Tiny circuits, wires, and boards. They say they’re for the future, but they feel like chains.",
        nextId: 'segment3D'
    },
    {
        id: 'segment3B',
        text: "Time doesn’t exist here. Only the endless rhythm of the machines. We start before the light, and we stop when they let us. Sometimes, not even then.",
        nextId: 'segment3D'
    },
    {
        id: 'segment3C',
        text: "Yes, there are others. Children like me. Some younger. Some older. We are the forgotten. The unseen. The ones who make the world turn, but are never allowed to live in it.",
        nextId: 'segment3D'
    },
    {
        id: 'segment3D',
        text: "The supervisor is coming. I have to hide this. I’ll write more when it’s safe...",
        nextId: 'segment4'
    },
    {
        id: 'segment4',
        text: "I’m back. The air feels heavier today. The machines groan like they’re in pain. Something is wrong. I can feel it.",
        choices: [
            { text: "What’s wrong? Are you safe?", nextId: 'segment5A' },
            { text: "Can you leave the factory?", nextId: 'segment5B' },
            { text: "Tell me more about this place.", nextId: 'segment5C' }
        ]
    },
    {
        id: 'segment5A',
        text: "Safe? There’s no such thing here. The walls close in, the air chokes us, and the machines... they never stop.",
        nextId: 'segment6'
    },
    {
        id: 'segment5B',
        text: "Leave? The doors are locked. The windows are barred. We are prisoners, though no one will ever call us that.",
        nextId: 'segment6'
    },
    {
        id: 'segment5C',
        text: "This place is a labyrinth of metal and shadows. The machines are our masters, and the supervisors are their cruel enforcers. There is no escape.",
        nextId: 'segment6'
    },
    {
        id: 'segment6',
        text: "April 4, 2025: \nThe smell of burning plastic fills the air. The machines scream louder than ever. Something is coming. I can feel it in my bones.",
        nextId: 'segment6A'
    },
    {
        id: 'segment6A',
        text: (userResponses) => `${userResponses.userName}, the doors are locked. The smoke is thick. The supervisors are gone. We are alone.`,
        choices: [
            { text: "You need to find a way out!", nextId: 'segment6B' },
            { text: "Stay calm. Is there anywhere safe?", nextId: 'segment6C' },
            { text: "This is madness. Someone must help you!", nextId: 'segment6D' }
        ]
    },
    {
        id: 'segment6B',
        text: "We’ve tried. The doors won’t budge. The windows are barred. The walls feel alive, like they’re watching us.",
        nextId: 'segment7'
    },
    {
        id: 'segment6C',
        text: "Safe? There’s no safety here. Only the machines, the smoke, and the darkness.",
        nextId: 'segment7'
    },
    {
        id: 'segment6D',
        text: "Help? No one is coming. No one ever comes. We are the forgotten, the discarded, the invisible.",
        nextId: 'segment7'
    },
    {
        id: 'segment7',
        text: "April 5, 2025: \nThe fire is spreading. The machines are melting. The screams... they echo in my head. I can’t breathe.",
        nextId: 'segment7A'
    },
    {
        id: 'segment7A',
        text: (userResponses) => `${userResponses.userName}, if you’re still there... remember us. Remember what you’ve seen. Tell the world what they’ve done to us.`,
        nextId: 'segment8'
    },
    {
        id: 'segment8',
        text: "The screen flickers. The words fade. And then, silence.",
        nextId: 'segment9'
    },
    {
        id: 'segment9',
        text: "BREAKING NEWS: FACTORY FIRE CLAIMS 27 LIVES, MOSTLY CHILDREN - No Survivors.",
        nextId: 'segment10'
    },
    {
        id: 'segment10',
        text: "The story ends here. But the truth? It’s still out there, waiting to be uncovered.",
        buttonText: 'Restart',
        nextId: 'intro'
    }
];

  // Find the current segment
  const segment = storySegments.find(seg => seg.id === currentSegment);

  // Handle button click with animation
  const handleButtonClick = (nextId) => {
    handleTransition(nextId);
    window.scrollTo(0, 0);
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle input submission with animation
  const handleInputSubmit = (inputFor) => {
    if (inputValue.trim()) {
      if (inputFor === 'userName') {
        setUserName(inputValue);
        setUserResponses({...userResponses, userName: inputValue});
      } else if (inputFor === 'userLocation') {
        setUserLocation(inputValue);
        setUserResponses({...userResponses, userLocation: inputValue});
      }
      setInputValue('');
      handleTransition(segment.nextId);
    }
  };

  // Process text that might be a function
  const processText = (text) => {
    if (typeof text === 'function') {
      return text(userResponses);
    }
    // Return text as is - no string replacement needed since template literals work in the functions
    return text;
  };
  
  // Animation function for transitioning between segments
  const handleTransition = (nextId) => {
    setIsAnimating(true);
    
    // Fade out current text
    const fadeOutAnimation = () => {
      let opacity = 1;
      const fadeOutInterval = setInterval(() => {
        opacity -= 0.1;
        setTextOpacity(opacity);
        
        if (opacity <= 0) {
          clearInterval(fadeOutInterval);
          // Change to next segment when fully faded out
          setCurrentSegment(nextId);
          // Start fade in animation
          fadeInAnimation();
        }
      }, 40); // Faster fade out for better synchronization
    };
    
    // Fade in new text
    const fadeInAnimation = () => {
      let opacity = 0;
      const fadeInInterval = setInterval(() => {
        opacity += 0.05; // Slower fade in than fade out
        setTextOpacity(opacity);
        
        if (opacity >= 1) {
          clearInterval(fadeInInterval);
          setIsAnimating(false);
        }
      }, 60); // Adjusted timing for better synchronization
    };
    
    fadeOutAnimation();
  };

  return (
    <div className="container">
      <Head>
        <title>Lost Diary</title>
        <meta name="description" content="An interactive horror story" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <h1 className="title">Lost Diary</h1>
        
        <div className={`story-content ${isAnimating ? 'animating' : ''}`}>
          <p className="story-text" style={{ 
            opacity: textOpacity,
            transition: `opacity ${isAnimating ? '0.5s' : '0s'} ease-in-out`,
            transform: `scale(${0.9 + (textOpacity * 0.1)})`,
            filter: `blur(${(1 - textOpacity) * 3}px)`
          }}>{processText(segment.text)}</p>
          
          {segment.inputRequired ? (
            <div className="input-container" style={{ opacity: textOpacity }}>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={segment.inputLabel}
                className="user-input"
                disabled={isAnimating}
              />
              <button 
                onClick={() => handleInputSubmit(segment.inputFor)}
                className="submit-button"
                disabled={isAnimating}
              >
                Send
              </button>
            </div>
          ) : segment.choices ? (
            <div className="choices" style={{ opacity: textOpacity }}>
              {segment.choices.map((choice, index) => (
                <button 
                  key={index} 
                  onClick={() => handleButtonClick(choice.nextId)}
                  className="choice-button"
                  disabled={isAnimating}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          ) : (
            <button 
              onClick={() => handleButtonClick(segment.nextId)}
              className="next-button"
              style={{ opacity: textOpacity }}
              disabled={isAnimating}
            >
              {segment.buttonText || 'Next'}
            </button>
          )}
        </div>
      </main>

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background-color: #111;
          color: #eee;
          font-family: 'Arial', sans-serif;
          min-height: 100vh;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 20px 0;
        }
        
        .title {
          text-align: center;
          margin-bottom: 40px;
          font-size: 3rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          letter-spacing: 2px;
        }
        
        .story-content {
          background-color: rgba(0, 0, 0, 0.3);
          padding: 30px;
          border-radius: 6px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
        }
        
        .story-content::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%);
          opacity: 0;
          transition: opacity 0.8s ease-in-out;
          pointer-events: none;
          z-index: 1;
        }
        
        .story-content.animating::after {
          opacity: 1;
        }
        
        .story-text {
          line-height: 1.8;
          white-space: pre-line;
          margin-bottom: 40px;
          font-size: 1.1rem;
          position: relative;
          z-index: 2;
          text-shadow: 0 0 10px rgba(255,255,255,0.1);
        }
        
        button {
          background: #333;
          color: #fff;
          border: none;
          padding: 12px 24px;
          margin-top: 20px;
          cursor: pointer;
          border-radius: 4px;
          font-size: 1rem;
          transition: background 0.3s, transform 0.2s;
          display: block;
          position: relative;
          z-index: 2;
        }
        
        button:hover {
          background: #444;
          transform: translateY(-2px);
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .next-button {
          margin-left: auto;
          margin-right: auto;
        }
        
        .choices {
          display: flex;
          flex-direction: column;
          gap: 15px;
          position: relative;
          z-index: 2;
        }
        
        .choice-button {
          width: 100%;
          text-align: left;
        }
        
        .input-container {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          position: relative;
          z-index: 2;
        }
        
        .user-input {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 4px;
          background: #222;
          color: #fff;
          font-size: 1rem;
        }
        
        .submit-button {
          margin-top: 0;
        }
        
        @keyframes textShadowPulse {
          0% { text-shadow: 0 0 4px rgba(255,255,255,0.1); }
          50% { text-shadow: 0 0 8px rgba(255,255,255,0.2); }
          100% { text-shadow: 0 0 4px rgba(255,255,255,0.1); }
        }
        
        .story-text {
          animation: textShadowPulse 4s infinite;
        }
      `}</style>
    </div>
  );
}