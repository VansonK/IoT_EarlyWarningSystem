'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Heart, Wind, AlertTriangle, CheckCircle, Moon, AlertOctagon, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data dari API Route Next.js
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ambil data pertama kali saat halaman dimuat
    fetchData();

    // Lakukan polling setiap 3 detik agar data ter-update real-time
    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval); // Bersihkan interval saat komponen di-unmount
  }, []);

  // Tampilan Loading saat awal dimuat
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Menghubungkan ke Database...</p>
      </div>
    );
  }

  // Jika tabel database masih kosong
  if (!data || data.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-red-100">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Data Belum Tersedia</h2>
          <p className="text-gray-500 mt-2">Pastikan ESP32 atau simulasi MQTT sudah mengirimkan data.</p>
        </div>
      </div>
    );
  }

  const { latest, history } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Edge AI</h1>
            <p className="text-gray-500 mt-1">Pemantauan Pasien Real-time Terintegrasi IoT</p>
          </div>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            Terakhir diperbarui: <span className="font-semibold text-gray-700">{latest.lastUpdate}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card: Heart Rate */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-lg"><Heart className="w-6 h-6 text-red-500" /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Heart Rate (BPM)</p>
              <h2 className="text-2xl font-bold text-gray-900">{latest.heartRate}</h2>
            </div>
          </div>

          {/* Card: SpO2 */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg"><Wind className="w-6 h-6 text-blue-500" /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Saturasi Oksigen (SpO2)</p>
              <h2 className="text-2xl font-bold text-gray-900">{latest.spo2}%</h2>
            </div>
          </div>

          {/* Card: Tingkat Stres */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg"><Activity className="w-6 h-6 text-purple-500" /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Tingkat Stres</p>
              <h2 className="text-2xl font-bold text-gray-900">{latest.stressLevel}</h2>
            </div>
          </div>

          {/* Card: Status Anomali */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${latest.isCritical ? 'bg-red-100' : 'bg-green-100'}`}>
              {latest.isCritical ? <AlertTriangle className="w-6 h-6 text-red-600" /> : <CheckCircle className="w-6 h-6 text-green-600" />}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Status Vital</p>
              <h2 className={`text-xl font-bold ${latest.isCritical ? 'text-red-600' : 'text-green-600'}`}>
                {latest.isCritical ? 'Kritis' : 'Normal'}
              </h2>
            </div>
          </div>

          {/* Card: Status Tidur */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${latest.sleepStatus === 'Sleeping' ? 'bg-indigo-100' : 'bg-yellow-100'}`}>
              <Moon className={`w-6 h-6 ${latest.sleepStatus === 'Sleeping' ? 'text-indigo-600' : 'text-yellow-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Status Tidur</p>
              <h2 className="text-xl font-bold text-gray-900">
                {latest.sleepStatus} <span className="text-sm text-gray-400 font-normal">({latest.sleepProb}%)</span>
              </h2>
            </div>
          </div>

          {/* Card: Deteksi Apnea */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${latest.apneaWarning ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertOctagon className={`w-6 h-6 ${latest.apneaWarning ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Deteksi Apnea</p>
              <h2 className={`text-xl font-bold ${latest.apneaWarning ? 'text-red-600' : 'text-green-600'}`}>
                {latest.apneaWarning ? 'Terdeteksi' : 'Aman'}
              </h2>
              {latest.apneaWarning && (
                <p className="text-xs text-red-400 mt-1">Probabilitas: {latest.apneaProb}%</p>
              )}
            </div>
          </div>
        </div>

        {/* Grafik Riwayat Recharts */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Riwayat Heart Rate & SpO2</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                
                <YAxis yAxisId="left" stroke="#ef4444" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={12} tickLine={false} axisLine={false} domain={[90, 100]} />
                
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                
                <Line yAxisId="left" type="monotone" dataKey="hr" name="Heart Rate (BPM)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="spo2" name="SpO2 (%)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}