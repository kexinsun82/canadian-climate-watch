"use client";
import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const LABEL_OPTIONS = [
  'Wildfire', 'Heavy Rain', 'Cherry Blossoms', 'Flood', 'Snow', 'Drought', 'Storm', 'Heatwave', 'Other'
];
const LEVEL_LABELS = ['Nice', 'Low', 'Medium', 'High', 'Extreme'];

function LocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(value);
  const markerRef = useRef(null);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onChange(e.latlng);
      }
    });
    return position ? (
      <Marker position={position} ref={markerRef} icon={L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })} />
    ) : null;
  }

  const handleLocate = () => {
    if (navigator.geolocation) {
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
        <LocationMarker />
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

export default function ReportPage() {
  const [location, setLocation] = useState(null);
  const [label, setLabel] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [level, setLevel] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location?.lat,
          lng: location?.lng,
          label: showCustomInput ? customLabel : label,
          level,
          notes,
          time: new Date().toISOString(),
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setLocation(null);
        setLabel('');
        setCustomLabel('');
        setShowCustomInput(false);
        setLevel(0);
        setNotes('');
      } else {
        setError(data.message || 'Failed to submit');
      }
    } catch (err) {
      setError('Failed to submit');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 py-8" style={{ background: '#FEF8EA' }}>
      <div className="w-full max-w-3xl flex items-center gap-4 mb-8">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-primary)]" style={{ minWidth: 32, minHeight: 32 }}>
          <span className="text-lg font-medium text-black font-title">1</span>
        </div>
        <span className="text-lg font-medium font-title text-[#222]">Report by choose a location</span>
      </div>
      <div className="w-full max-w-3xl mb-8">
        <LocationPicker value={location} onChange={setLocation} />
      </div>

      <div className="w-full max-w-3xl flex items-center gap-4 mb-8">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-primary)]" style={{ minWidth: 32, minHeight: 32 }}>
          <span className="text-lg font-medium text-black font-title">2</span>
        </div>
        <span className="text-lg font-medium font-title text-[#222]">Information</span>
      </div>
      <form onSubmit={handleSubmit}>
        <div className='w-full max-w-3xl bg-[var(--color-primary-light)] rounded-2xl p-6 flex flex-col gap-4 mb-8'>
          <div className="flex items-center justify-between">
            <span className="text-base font-medium font-title">Label</span>
            <button
              type="button"
              className="px-3 py-1 rounded-full bg-[var(--color-primary)] text-black font-medium text-sm font-body"
              onClick={() => setShowCustomInput(v => !v)}
            >
              {showCustomInput ? 'Cancel' : 'Custom Label'}
            </button>
          </div>
          {!showCustomInput ? (
            <div className="flex flex-wrap gap-3">
              {LABEL_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`px-5 py-2 rounded-full font-medium text-sm transition ${label === opt ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-card)]'} text-black font-body`}
                  style={{ borderRadius: 100 }}
                  onClick={() => setLabel(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <input
              className="w-full px-4 py-2 rounded-2xl bg-[var(--color-card)] text-black font-medium text-sm outline-none font-body"
              placeholder="Enter custom label"
              value={customLabel}
              onChange={e => setCustomLabel(e.target.value)}
            />
          )}
          <span className="text-base font-medium font-title">Level</span>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={4}
              value={level}
              onChange={e => setLevel(Number(e.target.value))}
              className="flex-1 accent-[var(--color-primary)]"
            />
          </div>
          <div className="flex justify-between px-2">
            <span className="text-xs font-body">Nice</span>
            <span className="text-xs font-body">Low</span>
            <span className="text-xs font-body">Medium</span>
            <span className="text-xs font-body">High</span>
            <span className="text-xs font-body">Extreme</span>
          </div>
          <span className="text-base font-medium font-title">Notes</span>
          <textarea
            className="w-full min-h-[80px] rounded-xl bg-[var(--color-card)] px-4 py-2 text-black text-sm outline-none font-body"
            placeholder="Describe the situation..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
        <div className="relative flex justify-center mt-2">
          <div className="absolute left-0 w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-primary)]" 
              style={{ minWidth: 32, minHeight: 32 }}>
            <span className="text-lg font-medium text-black font-title">3</span>
          </div>
          <button
            type="submit"
            className="px-8 py-2 bg-[var(--color-accent)] text-[var(--color-white)] rounded-full font-medium text-lg transition hover:opacity-90 font-body"
            disabled={submitting || !location || !(label || customLabel)}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
        {success && <div className="text-green-600 text-center mt-2">Report submitted successfully!</div>}
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
      </form>
    </div>
  );
}
