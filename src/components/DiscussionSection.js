"use client";
import { useState, useEffect } from 'react';
import { getLevelText, getLevelColor } from '../lib/utils';

export default function DiscussionSection({ filter = 'realtime', hideHeader = false }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section className="w-full flex flex-col gap-4">
      {!hideHeader && (
        <div className="flex items-center justify-between bg-[var(--color-primary)] rounded-full px-6 py-3">
          <span className="text-lg font-medium text-black font-title">Discussion</span>
          <a href="/discussion" className="bg-[var(--color-white)] text-black rounded-full px-4 py-1 font-medium border border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition font-body">
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
            <div key={item._id || item.id} className="bg-[var(--color-primary-light)] rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-[var(--color-card)] text-black text-xs font-medium font-body">{getLevelText(item.level)}</span>
                  <span className="px-3 py-1 rounded-full bg-[var(--color-card)] text-black text-xs font-medium font-body">{item.label}</span>
                </div>
                <span className="text-xs text-gray-600 font-body">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="text-sm text-gray-800 font-body">{item.userName}</div>
              <div className="text-sm text-gray-800 font-body">{item.address}</div>
              <div className="text-base text-black font-body">{item.notes}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
} 