import * as mqtt from 'mqtt';
import { Pool } from 'pg';

// Konfigurasi Database PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Koneksi ke MQTT Broker
const mqttUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const client = mqtt.connect(mqttUrl);
const TOPIC = 'wearable/data';

client.on('connect', () => {
  console.log('Terhubung ke MQTT Broker');
  client.subscribe(TOPIC, (err) => {
    if (!err) console.log(`Subscribed ke topik: ${TOPIC}`);
  });
});

// Menangani pesan masuk dari ESP32
client.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    
    // Cek jenis data berdasarkan key "model" dari JSON Python
    switch (data.model) {
      case 'vitals':
        const queryVitals = `
          INSERT INTO patient_vitals (heart_rate, spo2, anomaly_status, stress_level)
          VALUES ($1, $2, $3, $4)
        `;
        const valuesVitals = [data.hr, data.spo2, data.anomaly, data.stress];
        await pool.query(queryVitals, valuesVitals);
        console.log('[VITALS] Data tersimpan');
        break;

      case 'apnea_detection':
        const queryApnea = `
          INSERT INTO apnea_predictions (device_id, epoch_ms, prediction, label, apnea_probability, window_sec, confidence)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const valuesApnea = [
          data.deviceId, data.epochMs, data.prediction, data.label, 
          data.apneaProbability, data.windowSec, data.confidence
        ];
        await pool.query(queryApnea, valuesApnea);
        console.log('[APNEA] Data tersimpan:', data.label);
        break;

      case 'sleep_detection':
        const querySleep = `
          INSERT INTO sleep_predictions (device_id, timestamp_ms, is_sleeping, label, sleep_probability, window_sec)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const valuesSleep = [
          data.deviceId, data.timestamp, data.isSleeping, data.label, 
          data.sleepProbability, data.windowSec
        ];
        await pool.query(querySleep, valuesSleep);
        console.log('[SLEEP] Data tersimpan:', data.label);
        break;

      default:
        console.log('Tipe data tidak dikenali:', data.model);
        break;
    }
  } catch (error) {
    console.error('Gagal memproses pesan:', error);
  }
});

client.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    
    // Cek jenis data berdasarkan key "model"
    switch (data.model) {
      case 'apnea_detection':
        const queryApnea = `
          INSERT INTO apnea_predictions (device_id, epoch_ms, prediction, label, apnea_probability, window_sec, confidence)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const valuesApnea = [
          data.deviceId, data.epochMs, data.prediction, data.label, 
          data.apneaProbability, data.windowSec, data.confidence
        ];
        await pool.query(queryApnea, valuesApnea);
        console.log('[APNEA] Data tersimpan:', data.label);
        break;

      case 'sleep_detection':
        const querySleep = `
          INSERT INTO sleep_predictions (device_id, timestamp_ms, is_sleeping, label, sleep_probability, window_sec)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const valuesSleep = [
          data.deviceId, data.timestamp, data.isSleeping, data.label, 
          data.sleepProbability, data.windowSec
        ];
        await pool.query(querySleep, valuesSleep);
        console.log('[SLEEP] Data tersimpan:', data.label);
        break;

      default:
        const query = `
          INSERT INTO patient_vitals (heart_rate, spo2, anomaly_status, stress_level)
          VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const values = [data.hr, data.spo2, data.anomaly, data.stress];
        
        await pool.query(query, values);
        console.log('Data berhasil disimpan ke PostgreSQL:', data);        
        break;
    }
  } catch (error) {
    console.error('Gagal memproses pesan:', error);
  }
});