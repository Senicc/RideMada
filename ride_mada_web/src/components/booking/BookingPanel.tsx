import { useState } from 'react';
import { useBookingStore } from '../../store';
import AddressAutocomplete from '../maps/AddressAutocomplete';
import { fetchDirections, estimateFare, fetchReverseGeocode } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, MapPin, Clock, CreditCard, CheckCircle, Car, LocateFixed } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

interface Props {
  token: string;
}

export default function BookingPanel({ token }: Props) {
  const { pickup, dropoff, route, fare, status, setPickup, setDropoff, setRoute, setFare, setStatus } = useBookingStore();
  
  const [pickupText, setPickupText] = useState(pickup?.address || '');
  const [dropoffText, setDropoffText] = useState(dropoff?.address || '');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const calculateRoute = async (newPickup: any, newDropoff: any) => {
    if (newPickup && newDropoff) {
      setLoading(true);
      try {
        const routeData = await fetchDirections(token, newPickup, newDropoff);
        setRoute(routeData);
        // Get fare from backend
        const fareData = await estimateFare(token, newPickup, newDropoff, 'SEDAN');
        if (fareData.estimate) {
          setFare(fareData.estimate);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      if (!navigator.geolocation) {
        alert('La géolocalisation n\'est pas supportée par votre navigateur');
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;
      const reverseData = await fetchReverseGeocode(token, lat, lng);
      const address = reverseData.formattedAddress || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      const newPickup = { lat, lng, address };
      
      setPickup(newPickup);
      setPickupText(address);
      
      if (dropoff) {
        calculateRoute(newPickup, dropoff);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Impossible d\'obtenir votre position');
    } finally {
      setLocating(false);
    }
  };

  const createRideRequest = async (pickup: any, dropoff: any) => {
    const res = await fetch(`${API_URL}/ride-requests`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        pickupAddress: pickup.address,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
        dropoffAddress: dropoff.address,
        vehicleType: 'SEDAN',
      }),
    });
    return res.json();
  };

  const handleRequestRide = async () => {
    if (!pickup || !dropoff) return;
    setLoading(true);
    try {
      const res = await createRideRequest(pickup, dropoff);
      if (res.success) {
        setStatus('SEARCHING');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={window.innerWidth < 768 ? { y: 400, opacity: 0 } : { x: -350, opacity: 0 }}
      animate={window.innerWidth < 768 ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
      className="absolute bottom-0 left-0 right-0 md:bottom-auto md:left-4 md:right-auto md:top-4 z-20 w-full md:w-80 lg:w-96 bg-surface/95 backdrop-blur-xl border border-border rounded-t-3xl md:rounded-2xl shadow-2xl p-6 md:p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent">
          <Car size={20} />
        </div>
        <h2 className="text-xl font-bold text-text">Réserver un trajet</h2>
      </div>

      {status === 'IDLE' && (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-3.5 text-accent"><MapPin size={18} /></div>
            <div className="pl-10 pr-12">
              <AddressAutocomplete 
                token={token} 
                placeholder="Point de départ" 
                value={pickupText} 
                onChange={setPickupText}
                onSelect={(p) => { setPickup(p); calculateRoute(p, dropoff); }}
              />
            </div>
            <button
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-border transition-colors disabled:opacity-50"
            >
              <LocateFixed size={18} className="text-accent" />
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute left-4 top-3.5 text-green"><Navigation size={18} /></div>
            <div className="pl-10">
              <AddressAutocomplete 
                token={token} 
                placeholder="Destination" 
                value={dropoffText} 
                onChange={setDropoffText}
                onSelect={(p) => { setDropoff(p); calculateRoute(pickup, p); }}
              />
            </div>
          </div>

          <AnimatePresence>
            {route && fare && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-border mt-6 space-y-3"
              >
                <div className="flex justify-between items-center bg-bg/50 p-4 rounded-xl border border-border">
                  <div className="flex flex-col">
                    <span className="text-muted text-sm flex items-center gap-1"><Clock size={14}/> {fare.durationMin} min</span>
                    <span className="font-semibold">{fare.distanceKm} km</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-muted text-sm flex items-center gap-1"><CreditCard size={14}/> Est.</span>
                    <span className="font-bold text-lg text-accent">{fare.price.toLocaleString('fr-FR')} Ar</span>
                  </div>
                </div>
                <button 
                  className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-accent/25 disabled:opacity-50"
                  onClick={handleRequestRide}
                  disabled={loading}
                >
                  {loading ? 'Calcul...' : 'Confirmer la commande'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {status === 'SEARCHING' && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium animate-pulse">Recherche d'un chauffeur...</p>
        </div>
      )}

      {status === 'ACCEPTED' && (
        <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
          <div className="w-16 h-16 bg-green/20 rounded-full flex items-center justify-center text-green mb-2">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold">Chauffeur en route !</h3>
          <p className="text-muted">Votre chauffeur a accepté la course et se dirige vers vous.</p>
        </div>
      )}

      {status === 'IN_PROGRESS' && (
        <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
           <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center text-accent mb-2">
            <Car size={32} />
          </div>
          <h3 className="text-xl font-bold">Course en cours</h3>
          <p className="text-muted">Profitez de votre trajet vers votre destination.</p>
        </div>
      )}

      {status === 'COMPLETED' && (
        <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
          <div className="w-16 h-16 bg-green/20 rounded-full flex items-center justify-center text-green mb-2">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-green">Trajet terminé</h3>
          <p className="text-muted">Vous êtes arrivé à destination.</p>
          <button 
            className="mt-4 w-full bg-border hover:bg-border/80 text-text font-bold py-3 rounded-xl transition-colors"
            onClick={() => window.location.reload()}
          >
            Nouvelle course
          </button>
        </div>
      )}
    </motion.div>
  );
}
