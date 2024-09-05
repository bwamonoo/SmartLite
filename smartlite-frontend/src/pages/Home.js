import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Header from '../components/Header';
import ToggleSwitch from '../components/ToggleSwitch';
import LightsStatus from '../components/LightsStatus';
import PeopleCount from '../components/PeopleCount';
import lightOn from '../assets/images/light-on.png'
import lightOff from '../assets/images/light-off.png'
import { getStatus, toggleLight } from '../services/api';

const socket = io('http://127.0.0.1:5000');

const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [method, setMethod] = useState("");
  const [lightsStatus, setLightsStatus] = useState(false);
  const [peopleCount, setPeopleCount] = useState(0);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getStatus();
        setPeopleCount(data.people_count);
        setLightsStatus(data.light_status);
      } catch (error) {
        console.error('Failed to fetch initial status:', error);
      }
    };

    fetchStatus();

    // Set up socket listeners
    socket.on('status_update', (data) => {
      setPeopleCount(data.people_count);
      setLightsStatus(data.light_status);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleToggleLight = async () => {
    try {
      const data = await toggleLight({ light_status: !lightsStatus });
      setLightsStatus(data.light_status);
      setMethod("Manually");
    } catch (error) {
      console.error('Failed to toggle light:', error);
    }
  };

  return (
    <div className={`home-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Header />
      <ToggleSwitch isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
      <div className='image-container'>
        <img src={lightsStatus ? lightOn : lightOff} alt="" className='my-image'/>
      </div>
      <LightsStatus status={lightsStatus} />
      <button onClick={handleToggleLight} className="toggle-button">
        {lightsStatus ? 'Turn Off Lights' : 'Turn On Lights'}
      </button>
      <PeopleCount count={peopleCount} />
      <p>Method: {method}</p>
    </div>
  );
};

export default Home;