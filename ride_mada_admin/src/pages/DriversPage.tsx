import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Array<Record<string, unknown>>>([]);

  const load = () => api.getPendingDrivers().then((r) => setDrivers(r.drivers ?? [])).catch(console.error);
  useEffect(() => { load(); }, []);

  return (
    <>
      <h2 className="page-title">Chauffeurs en attente</h2>
      <table>
        <thead>
          <tr><th>Nom</th><th>Téléphone</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {drivers.length === 0 && (
            <tr><td colSpan={3} style={{ color: '#9aa3b5' }}>Aucun chauffeur en attente</td></tr>
          )}
          {drivers.map((d) => {
            const user = d.user as Record<string, unknown> | undefined;
            return (
              <tr key={String(d.id)}>
                <td>{String(user?.name ?? '—')}</td>
                <td>{String(user?.phone ?? '—')}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-success" onClick={async () => { await api.approveDriver(String(d.id)); load(); }}>Valider</button>
                  <button className="btn btn-danger" onClick={async () => { await api.rejectDriver(String(d.id)); load(); }}>Rejeter</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
