"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { getLevelText, getLevelColor } from '../lib/utils';

function useReverseGeocode() {
  const cacheRef = useRef({});
  const timerRef = useRef({});

  const getAddress = useCallback((lat, lng, cb) => {
    const key = `${lat},${lng}`;
    if (cacheRef.current[key]) {
      cb(cacheRef.current[key]);
      return;
    }
    if (timerRef.current[key]) clearTimeout(timerRef.current[key]);
    timerRef.current[key] = setTimeout(async () => {
      try {
        const res = await fetch(`/api/nominatim?lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const address = data.address || {};
        const street = address.road || address.pedestrian || address.cycleway || '';
        const city = address.city || address.town || address.village || address.hamlet || '';
        const province = address.state || address.region || '';
        const result = { street, city, province };
        cacheRef.current[key] = result;
        cb(result);
      } catch {
        cb({ street: '', city: '', province: '' });
      }
    }, 500);
  }, []);
  return getAddress;
}

export default function DiscussionSection({ filter = 'realtime', hideHeader = false, limit }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const getAddress = useReverseGeocode();

  useEffect(() => {
    setLoading(true);
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setPosts([]);
        setLoading(false);
      });
  }, []);

  let filtered = posts;
  if (filter === 'nice') {
    filtered = posts.filter(p => {
      const level = typeof p.level === 'number' ? p.level : parseInt(p.level);
      return level === 0 || level === 1;
    });
  } else if (filter === 'extreme') {
    filtered = posts.filter(p => {
      const level = typeof p.level === 'number' ? p.level : parseInt(p.level);
      return level === 3 || level === 4;
    });
  } else if (filter === 'realtime') {
    filtered = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (typeof limit === 'number' && limit > 0) {
    filtered = filtered.slice(0, limit);
  }

  return (
    <section className="w-full flex flex-col gap-4 px-4">
      {!hideHeader && (
        <div className="flex items-center justify-between bg-[var(--color-primary)] rounded-full px-6 py-3">
          <span className="text-lg font-medium text-black font-title">Discussion</span>
          <a href="/discussion" className="bg-[var(--color-card)] text-black rounded-full px-4 py-1 font-medium border hover:bg-[var(--color-primary-light)] transition font-body">
          View More
        </a>
      </div>
      )}
      <div className="flex flex-col gap-4 mt-2">
        {loading ? (
          <div className="text-center text-gray-500 font-body">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 font-body">No reports found.</div>
        ) : (
          filtered.map(item => (
            <DiscussionCard key={item._id || item.id} item={item} getAddress={getAddress} />
          ))
        )}
      </div>
    </section>
  );
}

function DiscussionCard({ item, getAddress }) {
  const [address, setAddress] = useState(null);
  useEffect(() => {
    let mounted = true;
    if (item.location && Array.isArray(item.location.coordinates) && item.location.coordinates.length === 2) {
      const lat = item.location.coordinates[1];
      const lng = item.location.coordinates[0];
      getAddress(lat, lng, addr => { if (mounted) setAddress(addr); });
    }
    return () => { mounted = false; };
  }, [item.location, getAddress]);
  return (
    <div className="bg-[var(--color-primary-light)] rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full bg-[var(--color-card)] text-black text-xs font-medium font-body">{getLevelText(item.level)}</span>
          <span className="px-3 py-1 rounded-full bg-[var(--color-card)] text-black text-xs font-medium font-body">{item.label}</span>
        </div>
        <span className="text-xs text-gray-600 font-body">{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="text-sm text-gray-800 font-body">{item.userName}</div>
      {address && (
        <div className="text-xs text-gray-600 font-body">
          {address.street && <span>{address.street}, </span>}
          {address.city && <span>{address.city}, </span>}
          {address.province && <span>{address.province}</span>}
        </div>
      )}
      <div className="text-base text-black font-body">{item.notes}</div>
    </div>
  );
} 