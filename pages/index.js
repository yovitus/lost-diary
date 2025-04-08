import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { storySegments, calculateStoryDates, formatDate, isDiaryEntry } from '../components/segments';

// isDiaryEntry, formatDate, and calculateStoryDates are now imported from segments.js
// No need to redefine them here

export default function Home() {
  const [currentSegment, setCurrentSegment] = useState('intro');
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [userResponses, setUserResponses] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [textOpacity, setTextOpacity] = useState(1);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [storyDates, setStoryDates] = useState(null);

  useEffect(() => {
    setStoryDates(calculateStoryDates());
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDebugMode = localStorage.getItem('debugMode') === 'true';
      
      if (isDebugMode) {
        const startSegment = localStorage.getItem('startSegment');
        const debugUserResponses = JSON.parse(localStorage.getItem('debugUserResponses') || '{}');
        
        if (startSegment) {
          setCurrentSegment(startSegment);
        }
        
        if (debugUserResponses) {
          if (debugUserResponses.userName) {
            setUserName(debugUserResponses.userName);
          }
          
          if (debugUserResponses.userLocation) {
            setUserLocation(debugUserResponses.userLocation);
          }
          
          setUserResponses(debugUserResponses);
        }
        
        localStorage.removeItem('debugMode');
        localStorage.removeItem('startSegment');
        localStorage.removeItem('debugUserResponses');
      }
    }
  }, []);

  useEffect(() => {
    const detectDeviceInfo = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const deviceType = isMobile ? 'mobile' : 'desktop';
      const browser = navigator.userAgent.indexOf("Chrome") > -1 ? "Chrome" : 
                     navigator.userAgent.indexOf("Safari") > -1 ? "Safari" : 
                     navigator.userAgent.indexOf("Firefox") > -1 ? "Firefox" : 
                     navigator.userAgent.indexOf("MSIE") > -1 ? "IE" : "Unknown";
      
      const today = new Date();
      const isApril2025 = today.getMonth() === 3 && today.getFullYear() === 2025;
      
      setDeviceInfo({
        deviceType,
        browser,
        isApril2025,
        hasCameraAccess: 'mediaDevices' in navigator,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
      });
    };
    
    detectDeviceInfo();
  }, []);

  const segment = storySegments.find(seg => seg.id === currentSegment);

  const fadeOutRef = useRef(null);
  const fadeInRef = useRef(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    return () => {
      if (fadeOutRef.current) {
        cancelAnimationFrame(fadeOutRef.current);
      }
      if (fadeInRef.current) {
        cancelAnimationFrame(fadeInRef.current);
      }
    };
  }, []);

  const processText = (text) => {
    if (typeof text === 'function') {
      return text(userResponses, deviceInfo, storyDates);
    }
    return text;
  };
  
  const handleTransition = useCallback((nextId) => {
    setIsAnimating(true);
    
    const fadeOut = () => {
      setTextOpacity(prev => {
        const newOpacity = Math.max(0, prev - 0.05);
        if (newOpacity <= 0) {
          setCurrentSegment(nextId);
          fadeInRef.current = requestAnimationFrame(fadeIn);
          return 0;
        }
        fadeOutRef.current = requestAnimationFrame(fadeOut);
        return newOpacity;
      });
    };
    
    const fadeIn = () => {
      setTextOpacity(prev => {
        const newOpacity = Math.min(1, prev + 0.03);
        if (newOpacity >= 1) {
          setIsAnimating(false);
          return 1;
        }
        fadeInRef.current = requestAnimationFrame(fadeIn);
        return newOpacity;
      });
    };
    
    if (fadeOutRef.current) {
      cancelAnimationFrame(fadeOutRef.current);
    }
    if (fadeInRef.current) {
      cancelAnimationFrame(fadeInRef.current);
    }
    
    fadeOutRef.current = requestAnimationFrame(fadeOut);
  }, []);

  const handleButtonClick = useCallback((nextId) => {
    setHistory(prev => [...prev, currentSegment]);
    handleTransition(nextId);
    window.scrollTo(0, 0);
  }, [handleTransition, currentSegment]);

  const handleBackClick = useCallback(() => {
    if (history.length > 0) {
      const previousSegment = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      handleTransition(previousSegment);
      window.scrollTo(0, 0);
    }
  }, [history, handleTransition]);

  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputSubmit = useCallback((inputFor) => {
    if (inputValue.trim()) {
      if (inputFor === 'userName') {
        setUserName(inputValue);
        setUserResponses(prev => ({...prev, userName: inputValue}));
      } else if (inputFor === 'userLocation') {
        setUserLocation(inputValue);
        setUserResponses(prev => ({...prev, userLocation: inputValue}));
      }
      setInputValue('');
      setHistory(prev => [...prev, currentSegment]);
      handleTransition(segment.nextId);
    }
  }, [inputValue, segment, handleTransition, currentSegment]);

  const processedText = useMemo(() => {
    return processText(segment.text);
  }, [segment.text, userResponses]);
  
  const renderedText = useMemo(() => {
    const isSystemMessage = segment.id.includes('meta_') || 
                            segment.id === 'consumer_intro' || 
                            segment.id === 'consumer_responsibility' || 
                            segment.id === 'consumer_reflection1' || 
                            segment.id === 'meta_reflection1' || 
                            segment.id === 'meta_reflection2' || 
                            segment.id === 'connection_lost' || 
                            segment.id === 'connection_attempt' ||
                            segment.id === 'ethical_consumer_system';
    
    if (typeof processedText !== 'string') {
      return processedText;
    }
    
    if (isSystemMessage) {
      return <div className="system-text">{processedText}</div>;
    }

    if (segment.bulletPoints && segment.bulletPoints.length > 0) {
      return (
        <>
          <div>{processedText}</div>
          <ul className="bullet-list">
            {segment.bulletPoints.map((item, index) => (
              <li key={`bullet-${index}`}>{item}</li>
            ))}
          </ul>
          {segment.footer && <div className="list-footer">{segment.footer}</div>}
        </>
      );
    }

    const sections = processedText.split('\n\n');
    
    return sections.map((section, sectionIndex) => {
      const lines = section.split('\n');
      
      return (
        <span key={sectionIndex} className="text-section">
          {lines.map((line, lineIndex) => {
            if (line.trim() === "WHAT CAN YOU DO?" || line.trim() === "RESOURCES FOR FURTHER INVESTIGATION:") {
              return <span key={`title-${lineIndex}`} className="list-title">{line}</span>;
            }
            
            if (isDiaryEntry(line)) {
              return <span key={`diary-${lineIndex}`} className="diary-entry">{line}</span>;
            } 
            
            if (lineIndex > 0 && isDiaryEntry(lines[lineIndex-1])) {
              return <span key={`diary-content-${lineIndex}`} className="diary-content">{line}</span>;
            }
            
            if (line.trim().startsWith('•')) {
              const prevLine = lineIndex > 0 ? lines[lineIndex-1] : '';
              const isNewList = !prevLine.trim().startsWith('•');
              
              if (isNewList) {
                const bulletLines = [];
                let i = lineIndex;
                while (i < lines.length && lines[i].trim().startsWith('•')) {
                  const cleanLine = lines[i].trim().replace(/^•\s*/, '');
                  bulletLines.push(cleanLine);
                  i++;
                }
                
                return (
                  <ul key={`list-${lineIndex}`} className="bullet-list">
                    {bulletLines.map((item, itemIndex) => (
                      <li key={`item-${itemIndex}`}>{item}</li>
                    ))}
                  </ul>
                );
              }
              
              return null;
            }
            
            return (
              <span key={`line-${lineIndex}`}>
                {line}{lineIndex < lines.length - 1 && !lines[lineIndex+1].trim().startsWith('•') ? <br /> : ''}
              </span>
            );
          }).filter(Boolean)} {/* Filter out null values */}
        </span>
      );
    });
  }, [processedText, segment.id, segment.bulletPoints, segment.footer]);

  const videoBackground = (
    <div className="video-background">
      <video autoPlay muted loop>         
        <source src="/videos/video-1.mp4" type="video/mp4"/>       
      </video>
    </div>
  );

  return (
    <div className="container">
      {videoBackground}
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
          }}>
            {renderedText}
          </p>
          
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
          ) : currentSegment === 'intro' ? (
            <button 
              onClick={() => handleButtonClick(segment.nextId)}
              className="solo-next-button"
              style={{ opacity: textOpacity }}
              disabled={isAnimating}
            >
              {segment.buttonText || 'Next'}
            </button>
          ) : (
            <div className="navigation-buttons" style={{ opacity: textOpacity }}>
              <button 
                onClick={handleBackClick}
                className="nav-button back-button"
                disabled={isAnimating || history.length === 0}
              >
                Back
              </button>
              <button 
                onClick={() => handleButtonClick(segment.nextId)}
                className="nav-button next-button"
                disabled={isAnimating}
              >
                {segment.buttonText || 'Next'}
              </button>
            </div>
          )}
          
          {(segment.choices || segment.inputRequired) && history.length > 0 && (
            <button 
              onClick={handleBackClick}
              className="standalone-back-button"
              disabled={isAnimating || history.length === 0}
              style={{ opacity: textOpacity }}
            >
              Back
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
          position: relative;
          z-index: 1;
        }

        .video-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }

        .video-background video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
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
        
        /* Properly formated lists with bullet points */
        .story-text ul {
          list-style-position: outside;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        
        .story-text li {
          padding-left: 0.5rem;
          margin-bottom: 0.5rem;
          text-indent: -1.2rem;
          padding-left: 1.2rem;
        }
        
        .story-text span {
          display: inline-block;
        }
        
        .story-text span[class*="bullet-line"] {
          padding-left: 1.2rem;
          text-indent: -1.2rem;
          display: block;
          margin-bottom: 0.5rem;
        }
        
        /* Hacker-style formatting for system messages */
        .system-text {
          font-family: 'Courier New', monospace;
          line-height: 1.4;
          color: #33ff33;
          background-color: rgba(0, 20, 0, 0.3);
          padding: 10px;
          border-radius: 3px;
          border-left: 2px solid #33ff33;
          margin: 15px 0;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
          text-shadow: 0 0 5px rgba(51, 255, 51, 0.3);
          overflow-x: auto;
        }
        
        .story-text {
          animation: textShadowPulse 4s infinite;
        }
        
        .diary-entry {
          display: block;
          font-style: italic;
          font-weight: 600;
          color: #e3c27a;
          margin-bottom: 6px;
          letter-spacing: 0.5px;
          text-shadow: 1px 1px 3px rgba(0,0,0,0.7);
        }
        
        .diary-content {
          display: block;
          font-style: italic;
          margin-bottom: 12px;
          color: #d2c4a8;
          padding-left: 8px;
          border-left: 2px solid rgba(227, 194, 122, 0.3);
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
        
        .standalone-back-button {
          margin: 20px auto 0;
          background: #222;
          font-size: 0.9rem;
          padding: 8px 18px;
          opacity: 0.8;
          width: 100px;
        }
        
        .standalone-back-button:hover {
          background: #333;
          opacity: 1;
        }
        
        .next-button {
          margin-left: auto;
          margin-right: auto;
        }
        
        .back-button {
          background: #222;
          margin-left: auto;
          margin-right: auto;
          margin-top: 10px;
          font-size: 0.9rem;
          padding: 8px 18px;
          opacity: 0.8;
        }
        
        .back-button:hover {
          background: #333;
          opacity: 1;
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

        .navigation-buttons {
          display: flex;
          justify-content: center;
          gap: 2px;
          margin: 20px auto 0;
          position: relative;
          z-index: 2;
          overflow: visible;
        }
        
        .nav-button {
          margin: 0;
          border-radius: 4px;
          min-width: 100px;
          padding: 12px 20px;
          font-size: 0.95rem;
          background: #333;
        }
        
        .back-button {
          border-right: none;
        }
        
        .back-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .next-button {
          border-left: none;
        }

        .solo-next-button {
          display: block;
          margin: 0 auto;
          background: #333;
          color: #fff;
          border: none;
          padding: 12px 24px;
          cursor: pointer;
          border-radius: 4px;
          font-size: 1rem;
          transition: background 0.3s, transform 0.2s;
        }
        
        @keyframes textShadowPulse {
          0% { text-shadow: 0 0 4px rgba(255,255,255,0.1); }
          50% { text-shadow: 0 0 8px rgba(255,255,255,0.2); }
          100% { text-shadow: 0 0 4px rgba(255,255,255,0.1); }
        }
        
        .story-text {
          animation: textShadowPulse 4s infinite;
        }

        /* Standard list styling */
        .story-text ul {
          list-style-type: disc;
          padding-left: 2rem;
          margin: 1rem 0;
        }
        
        .story-text li {
          margin-bottom: 0.5rem;
          padding-left: 0.5rem;
          text-indent: -0.5rem;
        }
        
        .bullet-list {
          list-style-type: none;
          padding-left: 0.5rem;
          margin: 1rem 0;
        }
        
        .bullet-list li {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 0.8rem;
          line-height: 1.4;
        }
        
        .bullet-list li:before {
          content: "";  /* Removed the bullet character "•" here */
          position: absolute;
          left: 0;
          color: #e3c27a;
        }
        
        .list-title {
          display: block;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #e3c27a;
        }
        
        .list-footer {
          margin-top: 1.5rem;
          font-style: italic;
          color: #d2c4a8;
        }
      `}</style>
    </div>
  );
}