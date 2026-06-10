CREATE TABLE IF NOT EXISTS patient_vitals (
    id SERIAL PRIMARY KEY,
    heart_rate INT NOT NULL,
    spo2 INT NOT NULL,
    anomaly_status VARCHAR(20), -- Normal / Kritis
    stress_level VARCHAR(20),   -- Rendah / Sedang / Tinggi
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk data model Apnea
CREATE TABLE IF NOT EXISTS apnea_predictions (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    epoch_ms BIGINT NOT NULL,
    prediction INT NOT NULL,
    label VARCHAR(50),
    apnea_probability FLOAT,
    window_sec INT,
    confidence INT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk data model Sleep Detection
CREATE TABLE IF NOT EXISTS sleep_predictions (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    timestamp_ms BIGINT NOT NULL,
    is_sleeping INT NOT NULL,
    label VARCHAR(50),
    sleep_probability FLOAT,
    window_sec INT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);