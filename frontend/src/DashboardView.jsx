import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function DashboardView({ sessions, onAddClick }) {
  const [timeframe, setTimeframe] = useState('weekly');
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalDuration: 0,
    sessions: []
  });

  useEffect(() => {
    calculateStats();
  }, [timeframe, sessions]);

  const calculateStats = () => {
    const now = new Date();
    let filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      switch (timeframe) {
        case 'weekly':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return sessionDate >= weekAgo;
        case 'monthly':
          return sessionDate.getMonth() === now.getMonth() && 
                 sessionDate.getFullYear() === now.getFullYear();
        case 'yearly':
          return sessionDate.getFullYear() === now.getFullYear();
        default:
          return false;
      }
    });

    // Trier les sessions par date
    filteredSessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalSessions = filteredSessions.length;
    const totalDuration = filteredSessions.reduce((sum, session) => sum + session.duree, 0);
    
    setStats({
      totalSessions,
      totalDuration,
      sessions: filteredSessions
    });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return timeframe === 'yearly' 
      ? d.toLocaleDateString('fr-FR', { month: 'short' })
      : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const chartData = {
    labels: stats.sessions?.map(s => formatDate(s.date)) || [],
    datasets: [
      {
        label: 'Durée (minutes)',
        data: stats.sessions?.map(s => s.duree) || [],
        borderColor: '#4361ee',
        backgroundColor: 'rgba(67, 97, 238, 0.1)',
        tension: 0.4,
        fill: true
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#999'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#999'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff'
        }
      },
      title: {
        display: true,
        text: 'Durée des séances',
        color: '#fff'
      },
    },
  };

  return (
    <div className="dashboard">
      <div className="dashboard-top">
        <h2>Tableau de bord</h2>
        <button className="add-session-btn" onClick={onAddClick}>
          + Nouvelle séance
        </button>
      </div>
      <div className="timeframe-selector">
        <button 
          className={timeframe === 'weekly' ? 'active' : ''} 
          onClick={() => setTimeframe('weekly')}
        >
          Cette semaine
        </button>
        <button 
          className={timeframe === 'monthly' ? 'active' : ''} 
          onClick={() => setTimeframe('monthly')}
        >
          Ce mois
        </button>
        <button 
          className={timeframe === 'yearly' ? 'active' : ''} 
          onClick={() => setTimeframe('yearly')}
        >
          Cette année
        </button>
      </div>

      <div className="dashboard-header">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Nombre total de séances</h3>
            <p className="stat-value">{stats.totalSessions}</p>
          </div>
          <div className="stat-card">
            <h3>Durée totale d'entraînement</h3>
            <p className="stat-value">{stats.totalDuration} min</p>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <Line options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}

export default DashboardView;
