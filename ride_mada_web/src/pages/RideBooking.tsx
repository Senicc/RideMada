import { useEffect, useState } from 'react';
import MapDisplay from '../components/maps/MapDisplay';
import BookingPanel from '../components/booking/BookingPanel';
import { initSocket } from '../services/socket';

// Pour simplifier le test, on va simuler la connexion avec le compte CLIENT créé par le script de seed.
// Dans une vraie app, on utiliserait un contexte d'authentification.
const TEST_CLIENT = { phone: '0340000003', password: 'Client@1234' };

export default function RideBooking() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Connexion automatique avec le compte de test
    fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_CLIENT)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setToken(data.accessToken);
        initSocket(data.accessToken);
      }
    })
    .catch(console.error);
  }, []);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg">
      <MapDisplay token={token} />
      <BookingPanel token={token} />
    </div>
  );
}
