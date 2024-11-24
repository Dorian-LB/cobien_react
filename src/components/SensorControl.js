import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';

function SensorControl() {
  const initialSensors = [
    { id: 1, type: 'Touch', sensitivity: 1, gain: 1, threshold: 50, delta: 0 },
    { id: 2, type: 'Touch', sensitivity: 1, gain: 1, threshold: 50, delta: 0 },
    { id: 3, type: 'Touch', sensitivity: 1, gain: 1, threshold: 50, delta: 0},
    { id: 4, type: 'Proximity', sensitivity: 1, gain: 1, threshold: 50, delta: 0},
    { id: 5, type: 'Proximity', sensitivity: 1, gain: 1, threshold: 50, delta: 0},
    { id: 6, type: 'Proximity', sensitivity: 1, gain: 1, threshold: 50, delta: 0},
  ];

  const [sensors, setSensors] = useState(initialSensors);
  const [mqttClient, setMqttClient] = useState(null);

  // Connect to MQTT broker
  useEffect(() => {
    const client = mqtt.connect('ws://192.168.250.196:9001'); // Replace with your broker's WebSocket URL
    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      client.subscribe('sensor/current-configuration');
    });

    client.on('message', (topic, message) => {
      if (topic === 'sensor/current-configuration') {
        const sensorData = JSON.parse(message.toString());
        updateSensorData(sensorData);
      }
    });

    setMqttClient(client);

    return () => {
      if (client) client.end();
    };
  }, []);

  const updateSensorData = (data) => {
    setSensors((prevSensors) =>
      prevSensors.map((sensor) =>
        sensor.id === data.id
          ? {
              ...sensor,
              //sensitivity: data.sensitivity,
              //gain: data.gain,
              //threshold: data.threshold,
              delta: data.delta,
              ...(sensor.type === 'Touch' && data.color ? { color: data.color } : {}),
            }
          : sensor
      )
    );
  };

  const handleInputChange = (id, field, value) => {
    setSensors((prevSensors) =>
      prevSensors.map((sensor) =>
        sensor.id === id ? { ...sensor, [field]: value } : sensor
      )
    );
  };

  const updateConfiguration = (id) => {
    const sensor = sensors.find((s) => s.id === id);
    if (mqttClient) {
      mqttClient.publish(
        'sensor/update',
        JSON.stringify({
          id: sensor.id,
          sensitivity: sensor.sensitivity,
          gain: sensor.gain,
          threshold: sensor.threshold,
          delta: sensor.delta,
        })
      );
      alert(`Configuration updated for Sensor ${id}`);
    }
  };

  return (
    <div className="sensor-control">
      <div className="sensor-grid">
        {sensors.map((sensor) => (
          <div key={sensor.id} className="sensor-config">
            <h3>
              {sensor.type} Sensor {sensor.id >= 4 && sensor.id <= 6 ? sensor.id - 3 : sensor.id}
            </h3>
            {/* Horizontal bar for Delta visualization */}
            <div className="horizontal-bar">
              <label>Delta:</label>
              <div className="bar-container">
                {/* Dynamic delta bar */}
                <div
                  className="delta-bar"
                  style={{
                    left: sensor.delta < 0 ? `${50 + sensor.delta / 2.54}%` : '50%',
                    width: `${Math.abs(sensor.delta) / 2.54}%`,
                    backgroundColor: sensor.delta > sensor.threshold ? 'red' : 'green',
                  }}
                ></div>

                {/* Threshold line */}
                <div
                  className="threshold-line"
                  style={{
                    left: `${50 + sensor.threshold / 2.54}%`,
                  }}
                ></div>
              </div>
              {/* Show the delta value */}
              <p className="delta-value">Current Delta: {sensor.delta}</p>
            </div>

            <div>
              <label>Sensitivity (Power of 2):</label>
              <select
                value={sensor.sensitivity}
                onChange={(e) => handleInputChange(sensor.id, 'sensitivity', parseInt(e.target.value))}
              >
                {[1, 2, 4, 8, 16, 32, 64, 128].map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Gain (1, 2, 4, 8):</label>
              <select
                value={sensor.gain}
                onChange={(e) => handleInputChange(sensor.id, 'gain', parseInt(e.target.value))}
              >
                {[1, 2, 4, 8].map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Threshold (0-127):</label>
              <input
                type="number"
                min="0"
                max="127"
                value={sensor.threshold}
                onChange={(e) => handleInputChange(sensor.id, 'threshold', parseInt(e.target.value))}
              />
            </div>

            <button onClick={() => updateConfiguration(sensor.id)}>Update Configuration</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SensorControl;
