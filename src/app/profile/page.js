"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getLevelText, getLevelColor } from '../../lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('realtime');
  const [addressCache, setAddressCache] = useState({});

  const filterTabs = [
    { key: 'realtime', label: 'Real-time' },
    { key: 'nice', label: 'Nice' },
    { key: 'extreme', label: 'Extreme' },
  ];

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserReports();
    }
  }, [isLoaded, user]);

  const fetchUserReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports');
      if (response.ok) {
        const allReports = await response.json();
        const userReports = allReports.filter(report => report.userId === user.id);
        setReports(userReports);
      }
    } catch (error) {
      console.error('Failed to fetch user reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setReports(reports.filter(report => report._id !== reportId));
      } else {
        console.error('Failed to delete report');
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  let filtered = reports;
  if (selected === 'nice') {
    filtered = reports.filter(p => {
      const level = typeof p.level === 'number' ? p.level : parseInt(p.level);
      return level === 0 || level === 1;
    });
  } else if (selected === 'extreme') {
    filtered = reports.filter(p => {
      const level = typeof p.level === 'number' ? p.level : parseInt(p.level);
      return level === 3 || level === 4;
    });
  } else if (selected === 'realtime') {
    filtered = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async function fetchAddress(lat, lng) {
    const key = `${lat},${lng}`;
    if (addressCache[key]) return addressCache[key];
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const address = data.address || {};
      const street = address.road || address.pedestrian || address.cycleway || '';
      const city = address.city || address.town || address.village || address.hamlet || '';
      const province = address.state || address.region || '';
      const result = { street, city, province };
      setAddressCache(prev => ({ ...prev, [key]: result }));
      return result;
    } catch {
      return { street: '', city: '', province: '' };
    }
  }

  useEffect(() => {
    window.deleteReport = deleteReport;
    return () => { delete window.deleteReport; };
  }, [deleteReport]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to sign in to view your reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-8 py-4 bg-[var(--color-card)]">
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        <span className="text-2xl font-medium font-title">My Reports</span>
        <button
          className="px-6 py-2 rounded-full bg-[var(--color-accent)] text-[var(--color-white)] text-base font-medium transition hover:opacity-90 font-body"
          onClick={() => router.push('/report')}
        >
          Report Now
        </button>
      </div>
      
      <div className="w-full max-w-3xl flex gap-4 mb-4 justify-center">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            className={`px-6 py-2 rounded-full border font-medium transition text-base font-body ${selected === tab.key ? 'bg-[var(--color-primary)] text-black' : 'bg-transparent text-black hover:bg-[var(--color-primary-light)]'}`}
            onClick={() => setSelected(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-3xl">
        {loading ? (
          <div className="text-center text-gray-500 font-body">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 font-body">No reports found.</div>
        ) : (
          <div className="flex flex-col gap-4 mt-2">
            {filtered.map(item => (
              <ProfileReportCard key={item._id || item.id} item={item} fetchAddress={fetchAddress} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileReportCard({ item, fetchAddress }) {
  const [address, setAddress] = useState(null);
  const { user } = useUser();
  const canDelete = user && item.userId === user.id;
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      const event = new CustomEvent('deleteReport', { detail: item._id });
      window.dispatchEvent(event);
    }
  };
  useEffect(() => {
    let mounted = true;
    if (item.location && Array.isArray(item.location.coordinates) && item.location.coordinates.length === 2) {
      const lat = item.location.coordinates[1];
      const lng = item.location.coordinates[0];
      fetchAddress(lat, lng).then(addr => { if (mounted) setAddress(addr); });
    }
    return () => { mounted = false; };
  }, [item.location]);
  useEffect(() => {
    const listener = (e) => {
      if (e.detail === item._id && typeof window.deleteReport === 'function') {
        window.deleteReport(item._id);
      }
    };
    window.addEventListener('deleteReport', listener);
    return () => window.removeEventListener('deleteReport', listener);
  }, [item._id]);
  return (
    <div className="bg-[var(--color-primary-light)] rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full bg-[var(--color-card)] text-black text-xs font-medium font-body">{getLevelText(item.level)}</span>
          <span className="px-3 py-1 rounded-full bg-[var(--color-card)] text-black text-xs font-medium font-body">{item.label}</span>
        </div>
        <span className="text-xs text-gray-600 font-body">{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-800 font-body">{item.userName}</div>
        {canDelete && (
          <button
            className="ml-4 px-3 py-1 bg-[var(--color-accent)] text-white rounded-full text-xs font-medium hover:bg-[var(--color-primary)] transition"
            onClick={handleDelete}
          >
            Delete
          </button>
        )}
      </div>
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