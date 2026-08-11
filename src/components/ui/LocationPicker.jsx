import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 17, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'id' } }
    );
    const data = await res.json();
    return data.display_name || '';
  } catch {
    return '';
  }
}

export default function LocationPicker({
  latitude,
  longitude,
  location,
  onLocationChange,
  readOnly = false,
}) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const mapRef = useRef(null);

  const position = latitude && longitude ? [latitude, longitude] : null;

  const defaultCenter = [-6.2088, 106.8456];

  useEffect(() => {
    if (!readOnly && !position && navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setGeocoding(true);
          const addr = await reverseGeocode(lat, lng);
          setGeocoding(false);
          onLocationChange({
            latitude: lat,
            longitude: lng,
            location: addr || location || '',
          });
          setGpsLoading(false);
        },
        (err) => {
          console.warn('GPS error:', err.message);
          setGpsError('Tidak dapat mengakses lokasi. Klik peta untuk memilih lokasi manual.');
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  const handleMapClick = async (latlng) => {
    if (readOnly) return;
    const { lat, lng } = latlng;
    setGeocoding(true);
    const addr = await reverseGeocode(lat, lng);
    setGeocoding(false);
    onLocationChange({
      latitude: lat,
      longitude: lng,
      location: addr || '',
    });
  };

  const handleGetMyLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Browser Anda tidak mendukung geolocation.');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGeocoding(true);
        const addr = await reverseGeocode(lat, lng);
        setGeocoding(false);
        onLocationChange({
          latitude: lat,
          longitude: lng,
          location: addr || location || '',
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsError('Gagal mendapatkan lokasi: ' + err.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="location-picker">
      <div className="location-picker__header">
        <label className="location-picker__label">
          <MapPin size={16} />
          Lokasi Kejadian
        </label>
        {!readOnly && (
          <button
            type="button"
            className="location-picker__gps-btn"
            onClick={handleGetMyLocation}
            disabled={gpsLoading}
          >
            {gpsLoading ? (
              <><Loader2 size={14} className="spin-icon" /> Mendeteksi...</>
            ) : (
              <><Navigation size={14} /> Lokasi Saya</>
            )}
          </button>
        )}
      </div>

      {gpsError && (
        <div className="location-picker__error">{gpsError}</div>
      )}

      <div className="location-picker__map-container">
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 17 : 12}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', borderRadius: '12px' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!readOnly && <MapClickHandler onMapClick={handleMapClick} />}
          {position && (
            <>
              <Marker position={position} icon={redIcon} />
              <FlyToLocation position={position} />
            </>
          )}
        </MapContainer>

        {!readOnly && !position && (
          <div className="location-picker__overlay">
            <MapPin size={24} />
            <span>Klik pada peta untuk menandai lokasi</span>
          </div>
        )}
      </div>

      {position && (
        <div className="location-picker__coords">
          <span className="location-picker__coord-badge">
            📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
          {geocoding && (
            <span className="location-picker__geocoding">
              <Loader2 size={12} className="spin-icon" /> Mencari alamat...
            </span>
          )}
        </div>
      )}

      {!readOnly && (
        <div className="location-picker__address-input">
          <label className="location-picker__address-label">
            Nama / Deskripsi Lokasi
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Contoh: Depan Masjid Al-Ikhlas RT 03 / Jl. Melati No. 14"
            value={location || ''}
            onChange={(e) =>
              onLocationChange({
                latitude,
                longitude,
                location: e.target.value,
              })
            }
          />
        </div>
      )}

      {readOnly && location && (
        <div className="location-picker__address-display">
          <MapPin size={14} />
          <span>{location}</span>
        </div>
      )}
    </div>
  );
}
