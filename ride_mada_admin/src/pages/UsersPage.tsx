import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function UsersPage() {
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);

  const load = () => api.getUsers().then((r) => setUsers(r.users ?? [])).catch(console.error);
  useEffect(() => { load(); }, []);

  const toggleBlock = async (id: string, blocked: boolean) => {
    if (blocked) await api.unblockUser(id);
    else await api.blockUser(id);
    load();
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="page-title" style={{ margin: 0 }}>Utilisateurs</h2>
        <button
          className="btn btn-primary"
          onClick={() => api.downloadExport('/admin/export/users', 'ridemada-users.csv').catch(alert)}
        >
          Exporter CSV
        </button>
      </div>
      <table>
        <thead>
          <tr><th>Nom</th><th>Téléphone</th><th>Rôle</th><th>Statut</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={String(u.id)}>
              <td>{String(u.name)}</td>
              <td>{String(u.phone)}</td>
              <td><span className="badge badge-gold">{String(u.role)}</span></td>
              <td>
                {u.isBlocked ? <span className="badge badge-red">Bloqué</span> : <span className="badge badge-green">Actif</span>}
              </td>
              <td>
                <button className="btn btn-ghost" onClick={() => toggleBlock(String(u.id), Boolean(u.isBlocked))}>
                  {u.isBlocked ? 'Débloquer' : 'Bloquer'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
