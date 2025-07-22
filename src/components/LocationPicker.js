"use client";
import { useState, useRef, useEffect } from 'react';

const LABEL_OPTIONS = [
  'Wildfire', 'Heavy Rain', 'Cherry Blossoms', 'Flood', 'Snow', 'Drought', 'Storm', 'Heatwave', 'Other'
];

function LocationMarker({ useMapEvents, L, Marker, position, setPosition, onChange, markerRef }) {
  const mapEvents = (useMapEvents || (() => () => {}))({
    click(e) {
      setPosition(e.latlng);
      onChange(e.latlng);
    }
  });

  if (!useMapEvents || !L || !Marker) return null;
  return position ? (
    <Marker position={position} ref={markerRef} icon={L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    })} />
  ) : null;
}

export default function LocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(value);
  const markerRef = useRef(null);

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [MapContainer, setMapContainer] = useState(null);
  const [TileLayer, setTileLayer] = useState(null);
  const [Marker, setMarker] = useState(null);
  const [useMapEvents, setUseMapEvents] = useState(null);
  const [L, setL] = useState(null);

  useEffect(() => {
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
      import('leaflet/dist/leaflet.css')
    ]).then(([rl, leaflet]) => {
      setMapContainer(() => rl.MapContainer);
      setTileLayer(() => rl.TileLayer);
      setMarker(() => rl.Marker);
      setUseMapEvents(() => rl.useMapEvents);
      setL(leaflet.default);
      setLeafletLoaded(true);
    });
  }, []);

  const handleLocate = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const latlng = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setPosition(latlng);
        onChange(latlng);
      });
    }
  };

  if (!leafletLoaded || !MapContainer || !TileLayer) return <div>Loading map...</div>;

  return (
    <div className="w-full flex flex-col gap-2 items-center">
      <MapContainer
        center={position || [49.25, -85.32]}
        zoom={position ? 10 : 4}
        style={{ height: 260, width: '100%', borderRadius: 16 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <LocationMarker useMapEvents={useMapEvents} L={L} Marker={Marker} position={position} setPosition={setPosition} onChange={onChange} markerRef={markerRef} />
      </MapContainer>
      <button
        className="mt-2 px-4 py-2 bg-[var(--color-primary)] text-black rounded-full font-medium w-max"
        style={{ fontFamily: 'Poppins, sans-serif' }}
        onClick={handleLocate}
        type="button"
      >
        Use Current Location
      </button>
    </div>
  );
} 