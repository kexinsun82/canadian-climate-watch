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
    <div className="min-h-screen w-full flex flex-col items-center px-4 py-8 bg-[var(--color-card)]">
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        <span className="text-2xl font-medium font-title">My Reports</span>
        <button
          className="px-6 py-2 rounded-full bg-[var(--color-accent)] text-[var(--color-white)] text-base font-medium transition hover:opacity-90 font-body"
          onClick={() => router.push('/report')}
        >
          Create Report
        </button>
      </div>
      
      <div className="w-full max-w-3xl flex gap-4 mb-8">
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
          <div className="flex flex-col gap-4">
            {filtered.map(item => (
              <div key={item._id || item.id} className="bg-[var(--color-primary-light)] rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-[var(--color-card)] text-black text-xs font-medium font-body">{getLevelText(item.level)}</span>
                    <span className="px-3 py-1 rounded-full bg-[var(--color-card)] text-black text-xs font-medium font-body">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 font-body">{new Date(item.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => deleteReport(item._id)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-800 font-body">{item.userName}</div>
                <div className="text-base text-black font-body">{item.notes}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 