import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Inisialisasi koneksi ke PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'adminpassword',
  database: process.env.DB_NAME || 'health_db',
});

export async function GET() {
  try {
    // 1. Ambil 10 data vitals terbaru untuk grafik dan kartu (diurutkan DESC untuk ambil terbaru, lalu di-reverse untuk grafik)
    const vitalsQuery = await pool.query('SELECT * FROM patient_vitals ORDER BY timestamp DESC LIMIT 10');
    const vitalsData = vitalsQuery.rows;

    // 2. Ambil status Sleep terbaru
    const sleepQuery = await pool.query('SELECT * FROM sleep_predictions ORDER BY received_at DESC LIMIT 1');
    const latestSleep = sleepQuery.rows[0];

    // 3. Ambil status Apnea terbaru
    const apneaQuery = await pool.query('SELECT * FROM apnea_predictions ORDER BY received_at DESC LIMIT 1');
    const latestApnea = apneaQuery.rows[0];

    // Jika tabel masih kosong, kembalikan data default
    if (vitalsData.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data vitals' }, { status: 404 });
    }

    const latestVital = vitalsData[0];

    // Format data untuk dikirim ke frontend
    const responseData = {
      latest: {
        heartRate: latestVital.heart_rate,
        spo2: latestVital.spo2,
        isCritical: latestVital.anomaly_status === 'Kritis',
        stressLevel: latestVital.stress_level || 'Normal',
        lastUpdate: new Date(latestVital.timestamp).toLocaleTimeString('id-ID'),
        
        sleepStatus: latestSleep ? latestSleep.label : 'Menunggu data...',
        sleepProb: latestSleep ? Math.round(latestSleep.sleep_probability * 100) : 0,
        
        apneaWarning: latestApnea ? latestApnea.prediction === 1 : false,
        apneaProb: latestApnea ? Math.round(latestApnea.apnea_probability * 100) : 0,
      },
      // Format array untuk Recharts (waktu berurutan dari paling lama ke terbaru)
      history: vitalsData.reverse().map(row => ({
        time: new Date(row.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second:'2-digit' }),
        hr: row.heart_rate,
        spo2: row.spo2
      }))
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data dari database' }, { status: 500 });
  }
}