import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    api.getPayments().then((r) => setPayments(r.payments ?? [])).catch(console.error);
  }, []);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="page-title" style={{ margin: 0 }}>Paiements</h2>
        <button
          className="btn btn-primary"
          onClick={() => api.downloadExport('/admin/export/payments', 'ridemada-payments.csv').catch(alert)}
        >
          Exporter CSV
        </button>
      </div>
      <table>
        <thead>
          <tr><th>Utilisateur</th><th>Montant</th><th>Méthode</th><th>Statut</th><th>Date</th></tr>
        </thead>
        <tbody>
          {payments.map((p) => {
            const user = p.user as Record<string, unknown> | undefined;
            return (
              <tr key={String(p.id)}>
                <td>{String(user?.name ?? '—')}</td>
                <td>{Number(p.amount).toLocaleString('fr-FR')} Ar</td>
                <td>{String(p.method)}</td>
                <td><span className={`badge ${p.status === 'COMPLETED' ? 'badge-green' : 'badge-gold'}`}>{String(p.status)}</span></td>
                <td>{new Date(String(p.createdAt)).toLocaleDateString('fr-FR')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
