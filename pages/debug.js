// Debug utility for Lost Diary
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Story segments for debugging - independent from the main component
const storySegments = [
  { id: 'intro', text: '', buttonText: 'Open the Diary', nextId: 'meta_intro' },
  { id: 'meta_intro', text: 'Your device has established a connection to an unknown network.', nextId: 'meta_device' },
  { id: 'meta_device', text: '> SYSTEM_ANALYSIS.exe completed\n> TARGET_DEVICE: DEVICE_TYPE\n> COMPONENTS_SCAN: [████████████] 100%', nextId: 'segment2' },
  { id: 'segment2', text: "The interface you're seeing appears to be accessing archived data from a digital diary.", nextId: 'segment2A' },
  { id: 'segment2A', text: "March 12, 2025: \nDear Diary, today is the first day I'm writing to you.", nextId: 'segment2B' },
  { id: 'segment2B', text: "Hello? I feel like someone is watching. My name is Lin. I'm 12 years old. Who are you?", inputRequired: true, inputLabel: "Type your name...", inputFor: "userName", nextId: 'segment2C' },
  { id: 'segment2C', text: "That's a nice name. I've never met anyone called that before.", nextId: 'meta_comment1' },
  { id: 'meta_comment1', text: "> USER_IDENTIFICATION: \"USER\"\n> TEMPORAL_BRIDGE: [ACTIVE]\n> SIGNAL_STRENGTH: 87%", nextId: 'segment2D' },
  { id: 'segment2D', text: "Where are you from? I've always wondered what it's like outside.", inputRequired: true, inputLabel: "Tell Lin where you're from...", inputFor: "userLocation", nextId: 'segment2E' },
  { id: 'segment2E', text: "I've never heard of it. Is it nice there?", nextId: 'segment3' },
  { id: 'segment3', text: "March 13, 2025: \nI found some time to write again. Today was long.", choices: [{ text: "What kind of pieces are you working with?", nextId: 'segment3A' }, { text: "Do you go to school?", nextId: 'segment3B' }, { text: "Who yelled at you?", nextId: 'segment3C' }] },
  { id: 'segment3A', text: "Tiny metal and plastic things. Circuit boards, I think they're called?", nextId: 'segment3D' },
  { id: 'segment3B', text: "School? I remember going to one, long ago.", nextId: 'segment3D' },
  { id: 'segment3C', text: "The supervisors. They wear masks sometimes because of the fumes.", nextId: 'meta_reflection1' },
  { id: 'meta_reflection1', text: "SYSTEM: Your device likely contains components similar to those Lin is describing.", nextId: 'segment3D' },
  { id: 'segment3D', text: "March 15, 2025: \nSorry I couldn't write yesterday.", choices: [{ text: "How long do you work each day?", nextId: 'segment4A' }, { text: "Where do you sleep?", nextId: 'segment4B' }, { text: "Do you have friends there?", nextId: 'segment4C' }] },
  { id: 'segment4A', text: "We start before the sun comes up.", nextId: 'segment5' },
  { id: 'segment4B', text: "We have rooms downstairs. Small ones with bunk beds.", nextId: 'segment5' },
  { id: 'segment4C', text: "Min is my friend. She's been here longer than me.", nextId: 'segment5' },
  { id: 'segment5', text: "March 18, 2025: \nI dropped another piece today.", choices: [{ text: "Where exactly are you?", nextId: 'segment5A' }, { text: "Can you leave?", nextId: 'segment5B' }, { text: "Are there adults who help you?", nextId: 'segment5C' }] },
  { id: 'segment5A', text: "I don't know exactly. They brought us here at night.", nextId: 'consumer_reflection1' },
  { id: 'consumer_reflection1', text: "SYSTEM: Analyzing consumer patterns...", nextId: 'segment6' },
  { id: 'segment5B', text: "The doors are always locked.", nextId: 'segment6' },
  { id: 'segment5C', text: "The supervisors aren't here to help us.", nextId: 'segment6' },
  { id: 'segment6', text: "March 22, 2025: \nOne of the machines broke today.", nextId: 'segment6A' },
  { id: 'segment6A', text: "The supervisors seem worried.", choices: [{ text: "What are you making right now?", nextId: 'segment7A' }, { text: "Do you get days off?", nextId: 'segment7B' }, { text: "Are you feeling okay?", nextId: 'segment7C' }] },
  { id: 'segment7A', text: "Small green rectangles with metal lines.", nextId: 'meta_reflection2' },
  { id: 'meta_reflection2', text: "SYSTEM: Analysis indicates Lin is describing PCB boards.", nextId: 'segment8' },
  { id: 'segment7B', text: "We get to rest on Sundays, but only for half the day.", nextId: 'segment8' },
  { id: 'segment7C', text: "My hands shake sometimes now.", nextId: 'segment8' },
  { id: 'segment8', text: "March 28, 2025: \nI'm scared.", nextId: 'segment8A' },
  { id: 'segment8A', text: "Have you ever been really afraid? So afraid you can't even cry?", choices: [{ text: "You need to tell someone what's happening", nextId: 'segment8B' }, { text: "Is there any way I could help you?", nextId: 'segment8C' }, { text: "I wish I could get you out of there", nextId: 'segment8D' }] },
  { id: 'segment8B', text: "Who would I tell? The supervisors know.", nextId: 'segment9' },
  { id: 'segment8C', text: "Just talking to you helps.", nextId: 'segment9' },
  { id: 'segment8D', text: "I dream about that. About sunlight and trees.", nextId: 'segment9' },
  { id: 'consumer_intro', text: "SYSTEM: Analyzing user data...", nextId: 'segment9' },
  { id: 'segment9', text: "April 2, 2025: \nSomething is wrong with the machines.", nextId: 'segment9A' },
  { id: 'segment9A', text: "Min is sick now too.", choices: [{ text: "Can you hide somewhere safer?", nextId: 'segment10A' }, { text: "Are there any emergency exits?", nextId: 'segment10B' }, { text: "Has this happened before?", nextId: 'segment10C' }] },
  { id: 'segment10A', text: "There's nowhere to hide.", nextId: 'segment11' },
  { id: 'segment10B', text: "There are doors with glowing signs, but they're always locked.", nextId: 'segment11' },
  { id: 'segment10C', text: "The machines break sometimes, but they usually fix them quickly.", nextId: 'segment11' },
  { id: 'segment11', text: "April 4, 2025: \nThings are getting worse.", nextId: 'segment11A' },
  { id: 'segment11A', text: "Most of the supervisors are gone now.", nextId: 'segment12' },
  { id: 'segment12', text: "April 5, 2025: \nThe machines are making terrible noises now.", nextId: 'segment12A' },
  { id: 'segment12A', text: "I'm scared. So scared.", nextId: 'segment12B' },
  { id: 'segment12B', text: "It's getting hotter. My eyes burn.", nextId: 'segment12C' },
  { id: 'segment12C', text: "I can't breathe. The smoke is everywhere.", nextId: 'connection_lost' },
  { id: 'connection_lost', text: "> ALERT: CONNECTION_UNSTABLE\n> SIGNAL_STRENGTH: [██░░░░░░░░] 23%\n> ATTEMPTING BUFFER...", nextId: 'connection_attempt' },
  { id: 'connection_attempt', text: "> BRIDGE_RESTORATION.exe [ACTIVE]\n> REESTABLISHING_CONNECTION...", nextId: 'last_message' },
  { id: 'last_message', text: "[PARTIAL MESSAGE RECOVERED]\n\nIf anyone ever reads this... please remember us.", nextId: 'consumer_responsibility' },
  { id: 'consumer_responsibility', text: "> CRITICAL_CONNECTION_ALERT\n> SOURCE_IDENTIFICATION: [VERIFIED]\n> COMPONENT_ID: #XR7-2025-04-B", nextId: 'segment12E' },
  { id: 'segment12E', text: "I don't want to die.", nextId: 'meta_final' },
  { id: 'meta_final', text: "> TEMPORAL_CONNECTION_TERMINATED\n> ARCHIVE_MODE: [ACTIVE]\n> USER: \"USER\"", nextId: 'segment14' },
  { id: 'segment14', text: "April 5, 2025: Industrial Fire at Electronics Manufacturing Facility Claims 43 Lives", nextId: 'real_world_context' },
  { id: 'real_world_context', text: "REAL WORLD CONTEXT:", nextId: 'consumer_reflection' },
  { id: 'consumer_reflection', text: "REFLECTION:", nextId: 'ethical_consumer_system' },
  { id: 'ethical_consumer_system', text: "SYSTEM: This device contains components manufactured in facilities with documented human rights concerns.", nextId: 'ethical_consumer_question' },
  { id: 'ethical_consumer_question', text: "Do you know where your electronics come from?", nextId: 'action_prompt' },
  { id: 'action_prompt', text: "WHAT CAN YOU DO?", buttonText: 'Close the Diary', nextId: 'final_meta' },
  { id: 'final_meta', text: (userResponses) => {
      // Using explicit line breaks with JSX format for better rendering
      return (
          <>
              <p>Thank you for experiencing 'Lost Diary', {userResponses.userName}.</p>
              <p>Date completed: April 5, 2025</p>
              <p>The same date as the tragedy in Lin's story.</p> 
              <p>The same date as today.</p>
              <p>Coincidence?</p>
          </>
      );
  }, buttonText: 'Return to Reality', nextId: 'intro' },
];

export default function Debug() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [userResponses, setUserResponses] = useState({
    userName: 'TestUser',
    userLocation: 'TestLocation'
  });

  const handleSegmentClick = (segmentId) => {
    localStorage.setItem('debugMode', 'true');
    localStorage.setItem('startSegment', segmentId);
    localStorage.setItem('debugUserResponses', JSON.stringify(userResponses));
    
    router.push('/');
  };

  const handleInputChange = (e, field) => {
    setUserResponses(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const filteredSegments = storySegments.filter(segment => 
    segment.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (typeof segment.text === 'string' && segment.text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper function to safely display segment text preview
  const getTextPreview = (text) => {
    if (typeof text === 'string') {
      return text.substring(0, 100) + (text.length > 100 ? '...' : '');
    } else if (typeof text === 'function') {
      return '[Function: Dynamic Content]';
    } else {
      return '[JSX Content]';
    }
  };

  return (
    <div className="debug-container">
      <Head>
        <title>Lost Diary - Debug Mode</title>
      </Head>

      <h1>Lost Diary - Debug Mode</h1>
      <p className="debug-warning">This page is for development purposes only</p>
      <p>Current date: April 5, 2025 (matches the story's final date)</p>

      <div className="debug-controls">
        <h3>Test User Information</h3>
        <div className="debug-input-group">
          <label>
            User Name:
            <input 
              type="text" 
              value={userResponses.userName} 
              onChange={(e) => handleInputChange(e, 'userName')}
            />
          </label>
          <label>
            User Location:
            <input 
              type="text" 
              value={userResponses.userLocation} 
              onChange={(e) => handleInputChange(e, 'userLocation')}
            />
          </label>
        </div>

        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search segments..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="segments-list">
        <h3>Story Segments ({filteredSegments.length} segments)</h3>
        {filteredSegments.map((segment) => (
          <div key={segment.id} className="segment-item">
            <h4>{segment.id}</h4>
            <p>
              {getTextPreview(segment.text)}
            </p>
            <div className="segment-details">
              {segment.nextId && <span>Next: {segment.nextId}</span>}
              {segment.inputRequired && <span className="tag input-tag">Input Required</span>}
              {segment.choices && <span className="tag choices-tag">Has Choices</span>}
            </div>
            <button onClick={() => handleSegmentClick(segment.id)}>
              Jump to this segment
            </button>
          </div>
        ))}
      </div>

      <div className="debug-footer">
        <Link href="/">Return to Story</Link>
      </div>

      <style jsx>{`
        .debug-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: #1e1e1e;
          color: #ddd;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .debug-warning {
          background: #ff5500;
          color: black;
          padding: 8px 12px;
          border-radius: 4px;
          font-weight: bold;
        }
        
        h1 {
          border-bottom: 1px solid #444;
          padding-bottom: 10px;
        }
        
        .debug-controls {
          background: #2d2d2d;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        
        .debug-input-group {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
        }
        
        label {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
        }
        
        input {
          padding: 8px;
          background: #3c3c3c;
          border: 1px solid #555;
          color: #fff;
          border-radius: 3px;
        }
        
        .search-box input {
          width: 100%;
          padding: 10px;
          font-size: 16px;
        }
        
        .segments-list {
          margin-top: 30px;
        }
        
        .segment-item {
          background: #2a2a2a;
          margin-bottom: 15px;
          padding: 15px;
          border-radius: 4px;
          border-left: 3px solid #666;
        }
        
        .segment-item h4 {
          margin-top: 0;
          color: #7cb7ff;
        }
        
        .segment-details {
          display: flex;
          gap: 10px;
          margin: 10px 0;
          flex-wrap: wrap;
        }
        
        .tag {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: bold;
        }
        
        .input-tag {
          background: #2c5282;
          color: white;
        }
        
        .choices-tag {
          background: #553c9a;
          color: white;
        }
        
        button {
          background: #444;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }
        
        button:hover {
          background: #555;
        }
        
        .debug-footer {
          margin-top: 40px;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #444;
        }
        
        .debug-footer a {
          color: #7cb7ff;
          text-decoration: none;
        }
        
        .debug-footer a:hover {
          text-decoration: underline;
        }
        
        /* Properly format bullet points for story segment preview text */
        .segment-item p ul {
          list-style-position: outside;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        
        .segment-item p li {
          padding-left: 0.5rem;
          margin-bottom: 0.5rem;
          text-indent: -1.2rem;
          padding-left: 1.2rem;
        }
        
        /* Style for text that uses bullet character instead of ul/li */
        .segment-item p {
          white-space: pre-line;
        }
        
        /* Style for lines starting with bullet characters */
        .segment-item p span {
          display: inline-block;
        }
        
        .segment-item p span[class*="bullet-line"] {
          padding-left: 1.2rem;
          text-indent: -1.2rem;
          display: block;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}