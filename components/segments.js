import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const isDiaryEntry = (line) => /\w+ \d+, \d{4}:/.test(line);

const formatDate = (date) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const calculateStoryDates = () => {
  const today = new Date();
  
  const totalDays = 24;
  
  const finalDate = new Date(today);
  
  const firstDate = new Date(today);
  firstDate.setDate(firstDate.getDate() - totalDays);
  
  const dates = {
    'March 12, 2025': formatDate(firstDate),
    'March 13, 2025': formatDate(new Date(firstDate.getTime() + 1 * 24 * 60 * 60 * 1000)),
    'March 15, 2025': formatDate(new Date(firstDate.getTime() + 3 * 24 * 60 * 60 * 1000)),
    'March 18, 2025': formatDate(new Date(firstDate.getTime() + 6 * 24 * 60 * 60 * 1000)),
    'March 22, 2025': formatDate(new Date(firstDate.getTime() + 10 * 24 * 60 * 60 * 1000)),
    'March 28, 2025': formatDate(new Date(firstDate.getTime() + 16 * 24 * 60 * 60 * 1000)),
    'April 2, 2025': formatDate(new Date(firstDate.getTime() + 21 * 24 * 60 * 60 * 1000)),
    'April 4, 2025': formatDate(new Date(firstDate.getTime() + 23 * 24 * 60 * 60 * 1000)),
    'April 5, 2025': formatDate(today),
  };
  
  return {
    dates,
    today: formatDate(today),
    firstDate: formatDate(firstDate)
  };
};

const storySegments = [
    {
        id: 'intro',
        text: '',
        buttonText: 'Open the Diary',
        nextId: 'meta_intro'
    },
    {
        id: 'meta_intro',
        text: (userResponses, deviceInfo) => `Your ${deviceInfo?.deviceType || 'device'} has established a connection to an unknown network. The screen flickers as data from another time begins to load...`,
        nextId: 'meta_device'
    },
    {
        id: 'meta_device',
        text: (userResponses, deviceInfo, storyDates) => {
          if (!storyDates) return "Loading...";
          const today = new Date();
          const month = (today.getMonth() + 1).toString().padStart(2, '0');
          const year = today.getFullYear();
          
          return `> SYSTEM_ANALYSIS.exe completed
> TARGET_DEVICE: ${deviceInfo?.deviceType || 'UNKNOWN_HARDWARE'}
> COMPONENTS_SCAN: [████████████] 100%
> ORIGIN_TRACE: manufacturing_zone "XR-7" [CLASSIFIED]
> PRODUCTION_TIMESTAMP: ${month}.${year}
> CONNECTION_STATUS: ESTABLISHED`;
        },
        nextId: 'meta_diary_interface'
    },
    {
        id: 'meta_diary_interface',
        text: (userResponses) => {
          const currentYear = new Date().getFullYear();
          return `The interface you're seeing appears to be accessing archived data from a digital diary. Many of the files are corrupted. Date stamp shows these entries are from ${currentYear}.`;
        },
        nextId: 'segment2A'
    },
    {
        id: 'segment2A',
        text: (userResponses, deviceInfo, storyDates) => {
          if (!storyDates) return "Loading...";
          return `${storyDates.dates['March 12, 2025']}: \nDear Diary, today is the first day I'm writing to you. I found this old device hidden under a loose floorboard. It still works, somehow. I wonder if anyone will ever read this... Is anyone there?`;
        },
        nextId: 'segment2B'
    },
    {
        id: 'segment2B',
        text: "Hello? I feel like someone is watching. My name is Lin. I'm 12 years old. Who are you?",
        inputRequired: true,
        inputLabel: "Type your name...",
        inputFor: "userName",
        nextId: 'segment2C'
    },
    {
        id: 'segment2C',
        text: (userResponses) => `${userResponses.userName}... That's a nice name. I've never met anyone called ${userResponses.userName} before. It's nice to meet you. I don't get to meet new people very often.`,
        nextId: 'meta_comment1'
    },
    {
        id: 'meta_comment1',
        text: (userResponses) => `> USER_IDENTIFICATION: "${userResponses.userName}"
> TEMPORAL_BRIDGE: [ACTIVE]
> SIGNAL_STRENGTH: 87%
> CONNECTION_TYPE: historical_archive_access
> DISCLAIMER: User is accessing archived_temporal_data
> TIMELINE_INTEGRITY: preserved

All documented events have already transpired. Interaction is simulated.`,
        nextId: 'segment2D'
    },
    {
        id: 'segment2D',
        text: "Where are you from? I've always wondered what it's like outside.",
        inputRequired: true,
        inputLabel: "Tell Lin where you're from...",
        inputFor: "userLocation",
        nextId: 'segment2E'
    },
    {
        id: 'segment2E',
        text: (userResponses) => `${userResponses.userLocation}? I've never heard of it. Is it nice there? Do you have trees? And real sunlight? I try to remember what those look like sometimes.`,
        nextId: 'segment3'
    },
    {
        id: 'segment3',
        text: (userResponses, deviceInfo, storyDates) => {
          if (!storyDates) return "Loading...";
          return `${storyDates.dates['March 13, 2025']}: \nI found some time to write again. Today was long. My fingers hurt from all the small pieces. I dropped one and got yelled at. One of the younger kids cried today until they made her stop. I shared my water with her when no one was looking.`;
        },
        choices: [
            { text: "What kind of pieces are you working with?", nextId: 'segment3A' },
            { text: "Do you go to school?", nextId: 'segment3B' },
            { text: "Who yelled at you?", nextId: 'segment3C' }
        ]
    },
    {
        id: 'segment3A',
        text: "Tiny metal and plastic things. Circuit boards, I think they're called? They go into devices people use every day. They told us we're helping make the future, but I don't think the future is meant for us.",
        nextId: 'segment3D'
    },
    {
        id: 'segment3B',
        text: "School? I remember going to one, long ago. We don't do that here. We learn how to make things, how to be quiet, and how to work fast. Those are the important lessons, they say.",
        nextId: 'segment3D'
    },
    {
        id: 'segment3C',
        text: "The supervisors. They wear masks sometimes because of the fumes, but we don't get any. They watch us all day. They don't like mistakes. They don't like questions either.",
        nextId: 'meta_reflection1'
    },
    {
        id: 'meta_reflection1',
        text: (userResponses, deviceInfo) => `> ALERT: MANUFACTURING_DATABASE.query
> USER: "${userResponses.userName}"
> DEVICE_TYPE: ${deviceInfo?.deviceType || 'UNKNOWN_HARDWARE'}
> SCAN_RESULTS: [POSITIVE MATCH]

__COMPONENT_SOURCE_ANALYSIS__
* Similar components detected in user device
* Global manufacturing report: ~160M child laborers in supply chain
* Hazardous conditions: CONFIRMED
* Transparency protocol: [INSUFFICIENT DATA]`,
        nextId: 'segment3D'
    },
    {
        id: 'segment3D',
        text: (userResponses, deviceInfo, storyDates) => {
          if (!storyDates) return "Loading...";
          return `${storyDates.dates['March 15, 2025']}: \nSorry I couldn't write yesterday. We had to work late because a big order came in. My eyes hurt from looking at the tiny pieces all day. Some of the older kids say they can't see as well anymore.`;
        },
        choices: [
            { text: "How long do you work each day?", nextId: 'segment4A' },
            { text: "Where do you sleep?", nextId: 'segment4B' },
            { text: "Do you have friends there?", nextId: 'segment4C' }
        ]
    },
    {
        id: 'segment4A',
        text: "We start before the sun comes up. Sometimes we finish when it's dark again. Sometimes later. The machines never stop, so why should we? That's what they say.",
        nextId: 'segment5'
    },
    {
        id: 'segment4B',
        text: "We have rooms downstairs. Small ones with bunk beds. Six of us share mine. The little ones cry sometimes at night. I try to tell them stories to help them sleep.",
        nextId: 'segment5'
    },
    {
        id: 'segment4C',
        text: "Min is my friend. She's been here longer than me. She remembers her family a little bit. I don't remember mine anymore. Sometimes I make up memories just so I have something to hold onto.",
        nextId: 'segment5'
    },
    {
        id: 'segment5',
        text: (userResponses, deviceInfo, storyDates) => {
          if (!storyDates) return "Loading...";
          return `${storyDates.dates['March 18, 2025']}: \nI dropped another piece today. They took away my dinner. I'm so hungry. But I saved this small candy Min gave me. It's the only sweet thing I've tasted in months.`;
        },
        choices: [
            { text: "Where exactly are you?", nextId: 'segment5A' },
            { text: "Can you leave?", nextId: 'segment5B' },
            { text: "Are there adults who help you?", nextId: 'segment5C' }
        ]
    },
    {
        id: 'segment5A',
        text: "I don't know exactly. They brought us here at night. It's a big building with lots of machines. The windows are high up and covered. I think we're far from any city. It's always quiet outside. Just the hum of machines inside.",
        nextId: 'consumer_reflection1'
    },
    {
        id: 'consumer_reflection1',
        text: (userResponses, deviceInfo) => `> CONSUMER_PATTERN_ANALYSIS.exe
> USER: "${userResponses.userName}"
> LOCATION: "${userResponses.userLocation}"
> SCAN_DEPTH: 24 months

__PURCHASE_HISTORY_ANALYSIS__
* Devices with similar components: 3+
* Accelerated replacement rate: 63% above sustainable threshold
* Correlation to production quotas: [DIRECT]
* Individual impact rating: [SIGNIFICANT]`,
        nextId: 'ethical_consumer_question'
    },
    {
        id: 'ethical_consumer_question',
        text: (userResponses) => `${userResponses.userName}, did you ever wonder where your devices come from? Have you bought phones, tablets, or computers recently?`,
        choices: [
            { text: "Yes, I have", nextId: 'segment6' },
            { text: "I don't know", nextId: 'ethical_consumer_system' },
            { text: "No, I haven't", nextId: 'ethical_consumer_system' }
        ]
    },
    {
        id: 'ethical_consumer_system',
        text: (userResponses, deviceInfo) => `> USER_VERIFICATION.exe
> ANALYZING: "${userResponses.userName}"
> DEVICE_FOOTPRINT: CONFIRMED
> RESULT: YOUR DEVICE contains components manufactured by children like Lin. YOU PURCHASED this product.
> WARNING: Electronic components in YOUR POSSESSION directly linked to facilities with documented abuses.
> NOTE: Every purchase supports this system. YOUR CONSUMER CHOICES have consequences.
> TEMPORAL_BRIDGE: Re-establishing connection to Lin...`,
        nextId: 'segment6'
    },
    {
        id: 'segment5B',
        text: (userResponses) => `${userResponses.userName}, the doors are always locked. Once a boy tried to run when they opened the loading doors. They caught him. We never saw him again. Nobody tries anymore.`,
        nextId: 'consumer_reflection1'
    },
    {
        id: 'segment5C',
        text: "The supervisors aren't here to help us. They're here to make sure we work. There's a woman who brings food sometimes. Once she snuck me medicine when I was sick. She looked sad but didn't say anything.",
        nextId: 'consumer_reflection1'
    },
    {
        id: 'segment6',
        text: (userResponses, deviceInfo, storyDates) => {
          if (!storyDates) return "Loading...";
          return `${storyDates.dates['March 22, 2025']}: \nOne of the machines broke today. It made a terrible noise and then smoke came out. They made us keep working anyway. My throat hurts from the smoke.`;
        },
        nextId: 'segment6A'
    },
    {
        id: 'segment6A',
        text: "The supervisors seem worried. They were talking in whispers. Something about quotas and deadlines. They're making us work faster now.",
        choices: [
            { text: "What are you making right now?", nextId: 'segment7A' },
            { text: "Do you get days off?", nextId: 'segment7B' },
            { text: "Are you feeling okay?", nextId: 'segment7C' }
        ]
    },
    {
        id: 'segment7A',
        text: "Small green rectangles with metal lines. They smell bad when we solder them. My head hurts after working on them all day. Min says they go into phones and computers. Things I'll never get to use.",
        nextId: 'meta_reflection2'
    },
    {
        id: 'meta_reflection2',
        text: (userResponses, deviceInfo) => `> COMPONENT_SCAN.exe [COMPLETE]
> PCB_IDENTIFICATION: 96% match
> DESCRIPTION: Printed Circuit Board (PCB)
> DETECTED: ${deviceInfo?.deviceType || 'current_device'} contains 6 similar boards
> MANUFACTURING_SOURCE: [CROSS-REFERENCE] "small green rectangles with metal lines"
> HEALTH_IMPACT: Soldering fumes contain lead(Pb), flux, tin(Sn)
> RESPIRATORY_DAMAGE_RISK: HIGH`,
        nextId: 'segment8'
    },
    {
        id: 'segment7B',
        text: "We get to rest on Sundays, but only for half the day. Unless there's a big order. Then we work every day until it's finished. The last time we had a full day of rest was... I can't remember.",
        nextId: 'segment8'
    },
    {
        id: 'segment7C',
        text: "My hands shake sometimes now. And I cough a lot at night. Some of the chemicals we use smell really strong. Min says they're bad for us, but we don't have masks or gloves most of the time.",
        nextId: 'segment8'
    },
    {
        id: 'segment8',
        text: (userResponses, deviceInfo, storyDates) => {
          if (!storyDates) return "Loading...";
          return `${storyDates.dates['March 28, 2025']}: \nI'm scared. Three of the younger kids got sick today. High fevers. Coughing. The supervisors took them away. Min says they might not come back.`;
        },
        nextId: 'segment8A'
    },
    {
        id: 'segment8A',
        text: (userResponses) => `${userResponses.userName}, have you ever been really afraid? So afraid you can't even cry? That's how I feel right now.`,
        choices: [
            { text: "You need to tell someone what's happening", nextId: 'segment8B' },
            { text: "Is there any way I could help you?", nextId: 'segment8C' },
            { text: "I wish I could get you out of there", nextId: 'segment8D' }
        ]
    },
    {
        id: 'segment8B',
        text: "Who would I tell? The supervisors know. They're the ones doing this. There's no one else. We're so far from everything. Sometimes I wonder if the outside world even knows we exist.",
        nextId: 'segment9'
    },
    {
        id: 'segment8C',
        text: "Just talking to you helps. It makes me feel like I'm real. Like someone knows I exist. Sometimes I think I'm just a ghost already.",
        nextId: 'segment9'
    },
    {
        id: 'segment8D',
        text: "I dream about that. About sunlight and trees and not being afraid all the time. About eating when I'm hungry and sleeping when I'm tired. Simple things.",
        nextId: 'segment9'
    },
    {
        id: 'consumer_intro',
        text: (userResponses, deviceInfo) => `> USER_PURCHASE_ANALYSIS.exe
> TARGET: "${userResponses.userName}"
> DEVICE_TYPE: ${deviceInfo?.deviceType || 'UNKNOWN_HARDWARE'}
> MANUFACTURING_ORIGIN: facility XR-7 [CONFIRMED]
> TEMPORAL_CORRELATION: Components manufactured Q1.2025
> IMPACT_ASSESSMENT: Direct contribution to accelerated quota fulfillment
> CORRELATION: [VERIFIED]`,
        nextId: 'segment9'
    },
    {
        id: 'segment9',
        text: (userResponses, deviceInfo, storyDates) => {
          if (!storyDates) return "Loading...";
          return `${storyDates.dates['April 2, 2025']}: \nSomething is wrong with the machines. They're making strange noises. The air smells different - like burning metal. The supervisors are arguing. I heard one say it's not safe, but the other said the order has to be finished or they'll all be fired.`;
        },
        nextId: 'segment9A'
    },
    {
        id: 'segment9A',
        text: "Min is sick now too. She's trying to hide it because she's afraid they'll take her away. I gave her my water. I don't know how to help her.",
        choices: [
            { text: "Can you hide somewhere safer?", nextId: 'segment10A' },
            { text: "Are there any emergency exits?", nextId: 'segment10B' },
            { text: "Has this happened before?", nextId: 'segment10C' }
        ]
    },
    {
        id: 'segment10A',
        text: "There's nowhere to hide. They count us every few hours. If they can't find you, they search until they do. The last boy who hid... they made an example of him. In front of everyone.",
        nextId: 'segment11'
    },
    {
        id: 'segment10B',
        text: "There are doors with glowing signs, but they're always locked. I tried one once when no one was looking. I think they need special keys or cards to open. We're not meant to leave.",
        nextId: 'segment11'
    },
    {
        id: 'segment10C',
        text: "The machines break sometimes, but they usually fix them quickly. This feels different. The supervisors seem scared. Some of them didn't come back after lunch. Why would they leave unless something was really wrong?",
        nextId: 'segment11'
    },
    {
        id: 'segment11',
        text: (userResponses, deviceInfo, storyDates) => {
          if (!storyDates) return "Loading...";
          return `${storyDates.dates['April 4, 2025']}: \nThings are getting worse. The smoke is thicker now. It hurts to breathe. Min collapsed today. They didn't even take her away. They just told us to keep working.`;
        },
        nextId: 'segment11A'
    },
    {
        id: 'segment11A',
        text: (userResponses) => `${userResponses.userName}, most of the supervisors are gone now. The doors are still locked. Some of the older kids tried to break the windows, but they're too high and too strong.`,
        nextId: 'segment12'
    },
    {
        id: 'segment12',
        text: (userResponses, deviceInfo, storyDates) => {
          if (!storyDates) return "Loading...";
          return `${storyDates.dates['April 5, 2025']}: \nThe machines are making terrible noises now. One of them caught fire. The smoke is everywhere. It's hard to see. Hard to breathe.`;
        },
        nextId: 'segment12A'
    },
    {
        id: 'segment12A',
        text: "I'm scared. So scared. I can hear screaming. People are running but there's nowhere to go. The doors won't open.",
        nextId: 'segment12B'
    },
    {
        id: 'segment12B',
        text: "It's getting hotter. My eyes burn. I can't stop coughing.",
        nextId: 'segment12C'
    },
    {
        id: 'segment12C',
        text: (userResponses) => `${userResponses.userName}, I can't breathe. The smoke is everywhere. Why did they leave us here? Why didn't anyone help us?`,
        nextId: 'connection_lost'
    },
    {
        id: 'connection_lost',
        text: `> ALERT: CONNECTION_UNSTABLE
> SIGNAL_STRENGTH: [██░░░░░░░░] 23%
> ATTEMPTING BUFFER...
> PACKET_LOSS: CRITICAL
> ERROR: 0x8704B - TEMPORAL_BRIDGE_COLLAPSE
> RETRY_ATTEMPT: FAILED

[CONNECTION_TERMINATED]`,
        nextId: 'connection_attempt'
    },
    {
        id: 'connection_attempt',
        text: (userResponses, deviceInfo, storyDates) => {
          if (!storyDates) return "Loading...";
          
          const now = new Date();
          
          const hours = now.getHours().toString().padStart(2, '0');
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const seconds = now.getSeconds().toString().padStart(2, '0');
          
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                             'July', 'August', 'September', 'October', 'November', 'December'];
          const month = monthNames[now.getMonth()];
          const day = now.getDate();
          
          return `> BRIDGE_RESTORATION.exe [ACTIVE]
> REESTABLISHING_CONNECTION...
> SIGNAL_SEARCH: [■■■■░░░░░░] 42%
> TEMPORAL_COORDINATES: ${month}.${day} ${hours}:${minutes}:${seconds}
> INTEGRITY_CHECK: failed
> ATTEMPTING_BACKUP_PROTOCOL...
> FRAGMENTS_DETECTED...`;
        },
        nextId: 'last_message'
    },
    {
        id: 'last_message',
        text: (userResponses) => `[PARTIAL MESSAGE RECOVERED]\n\n${userResponses.userName}, if anyone ever reads this... please remember us. Tell them we were here. Tell them we existed.`,
        nextId: 'consumer_responsibility'
    },
    {
        id: 'consumer_responsibility',
        text: (userResponses, deviceInfo, storyDates) => {
          if (!storyDates) return "Loading...";
          
          const now = new Date();
          
          const hours = now.getHours().toString().padStart(2, '0');
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const seconds = now.getSeconds().toString().padStart(2, '0');
          
          const day = now.getDate().toString().padStart(2, '0');
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const year = now.getFullYear();
          const formattedDate = `${day}.${month}.${year}`;
          
          return `> SOURCE_IDENTIFICATION: [VERIFIED]
> COMPONENT_ID: #XR7-2025-07-B
> MANUFACTURER: Lin (ID: 12-1894)
> DATE_STAMP: ${formattedDate}/${hours}:${minutes}:${seconds}
> STATUS: [DEFECTIVE] - Soldering error under duress
> DEFECT_ANALYSIS: Direct contribution to system overload
> FACILITY: XR-7 [CONFIRMED]
> USER_DEVICE_MATCH: 100% [VERIFIED]`;
        },
        nextId: 'segment12E'
    },
    {
        id: 'segment12E',
        text: "I don't want to die.",
        nextId: 'segment14'
    },
    {
        id: 'meta_final',
        text: (userResponses, deviceInfo, storyDates) => {
            return (
                <>
                    <p>Thank you for experiencing 'Lost Diary', {userResponses.userName}.</p>
                    <p>Date completed: {storyDates ? storyDates.today : 'today'}</p>
                    <p>The same date as the tragedy in Lin's story.</p> 
                    <p>The same date as today.</p>
                    <p>Coincidence?</p>
                </>
            );
        },
        buttonText: 'Return to Reality',
        nextId: 'intro'
    },
    {
        id: 'segment14',
        text: "April 5, 2025: Industrial Fire at Electronics Manufacturing Facility Claims 43 Lives\n\nAn explosion and subsequent fire at an unregistered electronics manufacturing facility in [REDACTED] has resulted in the deaths of 43 individuals, most of them children between the ages of 8-14. Authorities discovered the facility was operating illegally and employing child labor in hazardous conditions. Initial investigations suggest safety regulations were ignored to meet production quotas for consumer electronics components. The facility's operators fled the scene prior to the explosion, leaving all exits locked. There were no survivors.\n\nComponents from this facility were reportedly supplied to multiple major tech corporations. Advocacy groups are calling for increased transparency in electronics supply chains.",
        nextId: 'real_world_context'
    },
    {
        id: 'real_world_context',
        text: "REAL WORLD CONTEXT:\n\nWhile Lin's story is fictional, similar tragedies occur regularly in global manufacturing:",
        bulletPoints: [
            "Foxconn Factory Suicides (2010-2016): At least 14 deaths at electronics manufacturing facilities in China producing components for major tech brands. Workers faced extreme pressure, long hours, and toxic conditions.",
            "Garment Factory Disasters (Bangladesh, Pakistan): Fires and building collapses at Tazreen Fashions (2012), Ali Enterprises (2012), and Rana Plaza (2013) claimed thousands of lives, including child workers locked inside facilities with barred windows and blocked exits.",
            "Tantalum Mining in Congo: Children as young as 7 mine minerals for electronics in dangerous conditions. An estimated 40,000 children work in Congolese mines that supply components for devices like the one you're using now.",
            "Electronics Factory Fires (Malaysia, India): Multiple fires in electronics manufacturing facilities have occurred in recent years, often linked to unsafe working conditions and locked exits."
        ],
        nextId: 'consumer_reflection'
    },
    {
        id: 'consumer_reflection',
        text: (userResponses) => `REFLECTION:\n\n${userResponses.userName}, every purchase decision is a vote for the systems that created that product. The device in your hands connects you to a complex web of human lives.\n\nAs consumers, we often remain blind to the true cost of convenience and innovation. We rarely see the faces of those whose labor makes our digital lives possible.\n\nYour actions have consequences that echo across supply chains:\n\n• The pressure for lower prices drives cost-cutting that impacts worker safety\n• The demand for faster production leads to excessive quotas and forced overtime\n• The constant cycle of upgrades creates pressure for ever-faster manufacturing\n\nThrough your experience with Lin, you've glimpsed a reality that exists beyond the sleek exteriors of our devices - a reality we have collective power to change.`,
        nextId: 'action_prompt'
    },
    {
        id: 'action_prompt',
        text: "WHAT CAN YOU DO?",
        bulletPoints: [
            "Research the brands you purchase from and their supply chain transparency",
            "Support organizations fighting for workers' rights in manufacturing",
            "Extend the life of your devices instead of upgrading frequently", 
            "Demand transparency from companies about working conditions",
            "Share this knowledge with others"
        ],
        footer: "Remember: A different world is possible, but only if we recognize our role in creating it.",
        buttonText: 'Close the Diary',
        nextId: 'final_meta'
    },
    {
        id: 'final_meta',
        text: (userResponses, deviceInfo, storyDates) => {
            return (
                <>
                    <p>Thank you for experiencing 'Lost Diary', {userResponses.userName}.</p>
                    <p>Date completed: {storyDates ? storyDates.today : 'today'}</p>
                    <p>The same date as the tragedy in Lin's story.</p> 
                    <p>The same date as today.</p>
                    <p>Coincidence?</p>
                </>
            );
        },
        buttonText: 'Return to Reality',
        nextId: 'intro'
    },
    {
        id: 'segment16',
        text: "This experience was designed to provoke critical reflection on our relationship with technology and the hidden human costs of our digital world. The story may be over, but the issues it raises continue in reality.",
        buttonText: 'Close the Diary',
        nextId: 'resources'
    },
    {
        id: 'resources',
        text: "RESOURCES FOR FURTHER INVESTIGATION:",
        bulletPoints: [
            "International Labour Organization: Child Labour",
            "Electronics Watch: Fair Electronics Production",
            "Clean Clothes Campaign: Supply Chain Transparency",
            "Good Electronics Network"
        ],
        footer: "Creating ethical technology requires questioning not just what we build, but how we build it, and who pays the price.",
        buttonText: 'Restart Experience',
        nextId: 'intro'
    }
];

export { 
  storySegments,
  calculateStoryDates, 
  formatDate,
  isDiaryEntry
};