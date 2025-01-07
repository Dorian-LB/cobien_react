import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import SensorControl from './components/SensorControl';
import LEDStripControl from './components/LEDStripControl';
import RFIDControl from './components/RFIDControl';
import AddContact from './components/AddContact';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Sensors');
  const [isMobile, setIsMobile] = useState(false);
  const [client, setClient] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');

  // Responsive design setup
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // MQTT setup
  useEffect(() => {
    const mqttClient = mqtt.connect('ws://localhost:9001');

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      setAlertMessage('Connected to MQTT broker');
      setTimeout(() => setAlertMessage(''), 3000);
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT Connection Error:', err);
      setAlertMessage('MQTT Connection Failed');
      setTimeout(() => setAlertMessage(''), 3000);
    });

    mqttClient.on('close', () => {
      console.log('MQTT Connection Closed');
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, []);

  return (
    <div className="app-container">
      <h1>Device Control Interface</h1>
      {alertMessage && <div className="alert">{alertMessage}</div>}

      {isMobile ? (
        <>
          <nav className="navbar">
            <button
              className={activeTab === 'Sensors' ? 'active' : ''}
              onClick={() => setActiveTab('Sensors')}
            >
              Sensors
            </button>
            <button
              className={activeTab === 'LEDStrip' ? 'active' : ''}
              onClick={() => setActiveTab('LEDStrip')}
            >
              LED Strip
            </button>
            <button
              className={activeTab === 'RFIDControl' ? 'active' : ''}
              onClick={() => setActiveTab('RFIDControl')}
            >
              RFID Control
            </button>
            <button
              className={activeTab === 'AddContact' ? 'active' : ''}
              onClick={() => setActiveTab('AddContact')}
            >
              Ajouter Contact
            </button>            
          </nav>
          <div className="content">
            {activeTab === 'Sensors' && <SensorControl />}
            {activeTab === 'LEDStrip' && <LEDStripControl client={client} />}
            {activeTab === 'RFIDControl' && <RFIDControl client={client} />}
            {activeTab === 'AddContact' && <AddContact onContactAdded={() => setActiveTab('Sensors')} />}            
          </div>
        </>
      ) : (
        <div className="desktop-layout">
          <div className="desktop-section">
            <h2>Sensors</h2>
            <SensorControl />
          </div>
          <div className="desktop-section">
            <h2>LED Strip Control</h2>
            <LEDStripControl client={client} />
          </div>
          <div className="desktop-section">
            <h2>RFID Control</h2>
            <RFIDControl client={client} />
          </div>
          <div className='desktop-section'>
            <h2>Ajouter un contact</h2>
            <AddContact onContactAdded={() => setActiveTab('Sensors')}/>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
