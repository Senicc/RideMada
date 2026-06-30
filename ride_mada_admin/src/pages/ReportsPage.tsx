import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function ReportsPage() {
  const [reports, setReports] = useState<Array<Record<string, unknown>>>([]);

  const load = () => api.getReports().then((r) => setReports(r.reports ?? [])).catch(console.error);
  useEffect(() => { load(); }, []);

  return (
    <>
      <h2 className="page-title">Réclamations</h2>
      <table>
        <thead>
          <tr><th>Signaleur</th><th>Signalé</th><th>Raison</th><th>Statut</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {reports.map((r) => {
            const reporter = r.reporter as Record<string, unknown> | undefined;
            const reported = r.reported as Record<string, unknown> | undefined;
            return (
              <tr key={String(r.id)}>
                <td>{String(reporter?.name ?? '—')}</td>
                <td>{String(reported?.name ?? '—')}</td>
                <td>{String(r.reason)}</td>
                <td><span className="badge badge-gold">{String(r.status)}</span></td>
                <td>
                  {r.status === 'PENDING' && (
                    <button className="btn btn-success" onClick={async () => { await api.resolveReport(String(r.id)); load(); }}>
                      Résoudre
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
