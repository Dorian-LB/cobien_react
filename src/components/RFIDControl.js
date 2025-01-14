import React, { useState, useEffect } from 'react';

function RFIDControl({ client }) {
  const [cardID, setCardID] = useState('');
  const [configuring, setConfiguring] = useState(false);
  const [action, setAction] = useState('');

  // Listen for MQTT messages to detect RFID cards
  useEffect(() => {
    if (client) {
      client.on('message', (topic, message) => {
        if (topic === 'rfid/card') {
          const detectedCardID = message.toString();
          setCardID(detectedCardID);
          if (!configuring) {
            alert(`Detected RFID Card: ${detectedCardID}`);
          }
        }
      });

      client.subscribe('rfid/card');
    }

    return () => {
      if (client) {
        client.unsubscribe('rfid/card');
      }
    };
  }, [client, configuring]);

  const confirmConfiguration = () => {
    if (client && cardID && action) {
      client.publish('rfid/config', JSON.stringify({ id: cardID, action }));
      alert(`RFID Card ID ${cardID} linked to action: ${action}`);
    } else {
      alert('Please ensure an RFID card is detected and an action is selected.');
    }
    setConfiguring(false);
    setAction('');
    setCardID('');
  };

  const handleConfigurationClick = () => {
    if (client) {
      client.publish('rfid/ini', 'Card_Configuration');
    }
    setConfiguring(true);
  };

  return (
    <div className="rfid-control">
      <button onClick={handleConfigurationClick}>Configuration</button>
      {configuring && (
        <div className="rfid-config">
          <label>Card ID: {cardID || 'Waiting for card...'}</label>
          <div>
            <label className='action-prompt'>A quelle action voulez-vous attribuer cette carte?</label>
            <div className="action-button-prompt">
            <button className="action-button" onClick={() => {setAction('Visio')}}>Visio</button>
            <button className="action-button" onClick={() => setAction('Agenda')}>Agenda</button>
            <button className="action-button" onClick={() => setAction('Question')}>Question</button>
            </div>
          </div>
          <button onClick={confirmConfiguration}>Confirm</button>
        </div>
      )}
    </div>
  );
}

export default RFIDControl;
