import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function RidesPage() {
  const [rides, setRides] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    api.getActiveRides().then((r) => setRides(r.rides ?? [])).catch(console.error);
  }, []);

  return (
    <>
      <h2 className="page-title">Courses actives</h2>
      <table>
        <thead>
          <tr><th>Départ</th><th>Arrivée</th><th>Statut</th><th>Prix</th><th>Conducteur</th></tr>
        </thead>
        <tbody>
          {rides.map((r) => {
            const driver = r.driver as Record<string, unknown> | undefined;
            const driverUser = driver?.user as Record<string, unknown> | undefined;
            return (
              <tr key={String(r.id)}>
                <td>{String(r.departureAddress)}</td>
                <td>{String(r.arrivalAddress)}</td>
                <td><span className="badge badge-gold">{String(r.status)}</span></td>
                <td>{String(r.price)} Ar</td>
                <td>{String(driverUser?.name ?? '—')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
