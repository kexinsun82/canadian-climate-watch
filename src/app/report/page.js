"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { LEVEL_LABELS } from '../../lib/utils';

const LocationPicker = dynamic(() => import('../../components/LocationPicker'), { ssr: false });

export default function ReportPage() {
  const [location, setLocation] = useState(null);
  const [label, setLabel] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [level, setLevel] = useState(1);
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
        setLevel(1);
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
        <div className='w-full max-w-3xl bg-[var(--color-primary-light)] rounded-2xl p-6 flex flex-col gap-4 mb-8 min-w-[320px] sm:min-w-[400px] md:min-w-[760px] lg:min-w-[760px]' style={{ minHeight: 340, minWidth: 400, maxWidth: 760 }}>
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
            <div className="flex flex-wrap gap-3 min-w-[360px]">
              {['Wildfire', 'Heavy Rain', 'Cherry Blossoms', 'Flood', 'Snow', 'Drought', 'Storm', 'Heatwave', 'Other'].map(opt => (
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
              className="w-full px-4 py-2 rounded-2xl bg-[var(--color-card)] text-black font-medium text-sm outline-none font-body min-w-[360px]"
              style={{ minWidth: 360 }}
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
            <span className="text-sm font-medium font-body min-w-[60px] text-center">
              {LEVEL_LABELS[level]}
            </span>
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
