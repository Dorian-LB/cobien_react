import React, { useState, useEffect } from 'react';

function RFIDControl({ client }) {
  const [cardID, setCardID] = useState('');
  const [configuring, setConfiguring] = useState(false);
  const [link, setLink] = useState('');

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
    if (client && cardID && link) {
      client.publish('rfid/config', JSON.stringify({ id: cardID, link }));
      alert(`RFID Card ID ${cardID} linked to ${link}`);
    } else {
      alert('Please enter a valid link and ensure an RFID card is detected.');
    }
    setConfiguring(false);
    setLink('');
  };

  return (
    <div className="rfid-control">
      <button onClick={() => setConfiguring(true)}>Configuration</button>
      {configuring && (
        <div className="rfid-config">
          <label>Card ID: {cardID || 'Waiting for card...'}</label>
          <label>
            Link:
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </label>
          <button onClick={confirmConfiguration}>Confirm</button>
        </div>
      )}
    </div>
  );
}

export default RFIDControl;
