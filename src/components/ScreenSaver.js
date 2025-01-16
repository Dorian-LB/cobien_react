import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
// import './App.css'; // External CSS for styling
import mqtt from 'mqtt';

const ScreenSaver = () => {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather data from WeatherAPI
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `http://api.weatherapi.com/v1/current.json?key=6c3a609150684ef9b5a144000251301&q=Toulouse`
        );
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };
    fetchWeather();
  }, []);

  // Helper function to format time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Render analog clock
  const renderClock = () => {
    const hours = (time.getHours() % 12) + time.getMinutes() / 60;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    return (
      <div className="analog-clock">
        <div
          className="hour-hand"
          style={{ transform: `rotate(${hours * 30}deg)` }}
        />
        <div
          className="minute-hand"
          style={{ transform: `rotate(${minutes * 6}deg)` }}
        />
        <div
          className="second-hand"
          style={{ transform: `rotate(${seconds * 6}deg)` }}
        />
        <div className="center-dot" />
      </div>
    );
  };

  const mqttClient = mqtt.connect('ws://192.168.160.216:9001');
  // const mqttClient = mqtt.connect('ws://localhost:9001'); 

  // Navigate to the NextPage when the screen is clicked
  const handleScreenClick = () => {
    // voice/"siwis" pour l'accent français; "ona" pour l'accent catalan; "riccardo" pour l'accet italien
    mqttClient.publish('voice/siwis', "Pour planifier une visio, cliquer sur le bouton Démarrer une Visio ou poser la carte"); 
    navigate('/home');
  };

  return (
    <div className="screen-saver" onClick={handleScreenClick}>
      <div className="time-container">
        <div className="digital-clock">{formatTime(time)}</div>
        {renderClock()}
      </div>
      <div className="weather-container">
        {weather ? (
          <div>
            <h2>{weather.location.name}</h2>
            <p>{Math.round(weather.current.temp_c)}°C</p>
            <p>{weather.current.condition.text}</p>
          </div>
        ) : (
          <p>Loading weather...</p>
        )}
      </div>
    </div>
  );
};

export default ScreenSaver;