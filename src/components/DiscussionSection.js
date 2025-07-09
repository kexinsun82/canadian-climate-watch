"use client";
import { useState, useEffect } from 'react';

export default function DiscussionSection({ filter = 'realtime', hideHeader = false }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/discussions')
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
    filtered = posts.filter(p => p.level === 0 || p.level === 1 || p.level === 'Nice' || p.level === 'Medium');
  } else if (filter === 'extreme') {
    filtered = posts.filter(p => p.level === 2 || p.level === 3 || p.level === 'High' || p.level === 'Extreme');
  } else if (filter === 'realtime') {
    filtered = [...posts].sort((a, b) => new Date(b.time) - new Date(a.time));
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
          <div className="text-center text-gray-500 font-body">No discussions found.</div>
        ) : (
          filtered.map(item => (
            <div key={item._id || item.id} className="bg-[var(--color-primary-light)] rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-[var(--color-card)] text-black text-xs font-medium font-body">{item.level}</span>
                  <span className="px-3 py-1 rounded-full bg-[var(--color-card)] text-black text-xs font-medium font-body">{item.type}</span>
                </div>
                <span className="text-xs text-gray-600 font-body">{item.time}</span>
              </div>
              <div className="text-sm text-gray-800 font-body">{item.address}</div>
              <div className="text-base text-black font-body">{item.description}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
} 