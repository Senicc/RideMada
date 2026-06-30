import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function DashboardPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    api.getStats().then((r) => setStats(r.stats)).catch(console.error);
  }, []);

  if (!stats) return <p>Chargement...</p>;

  const cards = [
    { label: 'Utilisateurs', value: stats.totalUsers, color: '#6c5ce7' },
    { label: 'Chauffeurs', value: stats.totalDrivers, color: '#00b894' },
    { label: 'En attente', value: stats.pendingDrivers, color: '#fdcb6e' },
    { label: 'Courses actives', value: stats.activeRides, color: '#74b9ff' },
    { label: 'Réservations', value: stats.totalBookings, color: '#a29bfe' },
    { label: 'Revenus (Ar)', value: stats.totalRevenue, color: '#00cec9' },
  ];

  return (
    <>
      <h2 className="page-title">Tableau de bord</h2>
      <div className="card-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="label">{c.label}</div>
            <div className="value" style={{ color: c.color }}>{c.value?.toLocaleString('fr-FR')}</div>
          </div>
        ))}
      </div>
    </>
  );
}
