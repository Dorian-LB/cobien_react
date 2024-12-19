import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';

function SensorControl() {
  // Initial sensor configuration
  const initialSensors = [
    { id: 1, type: 'Touch', threshold: 100, scaling: 1, deviation: 0 },
    { id: 2, type: 'Proximity', threshold: 100, scaling: 1, deviation: 0 },
    { id: 3, type: 'Touch', threshold: 100, scaling: 1, deviation: 0 },
    { id: 4, type: 'Proximity', threshold: 100, scaling: 1, deviation: 0 },
  ];

  const [sensors, setSensors] = useState(initialSensors);
  const [mqttClient, setMqttClient] = useState(null);

  // Connect to MQTT broker
  useEffect(() => {
    const client = mqtt.connect('ws://192.168.228.196:9001'); 
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
      prevSensors.map((sensor) => {
        const updatedSensor = { ...sensor };

        if (sensor.id === 1 && data.PIC1?.touchDeviation !== undefined) {
          updatedSensor.deviation = data.PIC1.touchDeviation;
        }

        if (sensor.id === 2 && data.PIC1?.proximityDeviation !== undefined) {
          updatedSensor.deviation = data.PIC1.proximityDeviation;
        }

        if (sensor.id === 3 && data.PIC2?.touchDeviation !== undefined) {
          updatedSensor.deviation = data.PIC2.touchDeviation;
        }

        if (sensor.id === 4 && data.PIC2?.proximityDeviation !== undefined) {
          updatedSensor.deviation = data.PIC2.proximityDeviation;
        }

        return updatedSensor;
      })
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
          sensorId: sensor.id,
          threshold: sensor.threshold,
          scaling: sensor.scaling,
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
              {sensor.type} Sensor {sensor.id}
            </h3>
            {/* Horizontal bar for Deviation visualization */}
            <div className="horizontal-bar">
              <label>Deviation:</label>
              <div className="bar-container">
                {/* Dynamic deviation bar */}
                <div
                  className="deviation-bar"
                  style={{
                    width: `${sensor.deviation / 1.27}%`,
                    backgroundColor: sensor.deviation > sensor.threshold ? 'red' : 'green',
                  }}
                ></div>

                {/* Threshold line */}
                <div
                  className="threshold-line"
                  style={{
                    left: `${sensor.threshold / 1.27}%`,
                  }}
                ></div>
              </div>
              {/* Show the deviation value */}
              <p className="deviation-value">Current Deviation: {sensor.deviation}</p>
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

            <div>
              <label>Scaling (0-4):</label>
              <select
                value={sensor.scaling}
                onChange={(e) => handleInputChange(sensor.id, 'scaling', parseInt(e.target.value))}
              >
                {[0, 1, 2, 3, 4].map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={() => updateConfiguration(sensor.id)}>Update Configuration</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SensorControl;
