"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DiscussionSection from '@/components/DiscussionSection';

const filterTabs = [
  { key: 'realtime', label: 'Real-time' },
  { key: 'nice', label: 'Nice' },
  { key: 'extreme', label: 'Extreme' },
];

export default function DiscussionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState('realtime');

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 py-8" style={{ background: '#FEF8EA' }}>
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        <span className="text-2xl font-medium" style={{ fontFamily: 'Rethink Sans, sans-serif' }}>Discussion</span>
        <button
          className="px-6 py-2 rounded-full bg-[#D40808] text-[#FFFFFE] text-base font-medium transition hover:opacity-90"
          style={{ fontFamily: 'Poppins, sans-serif' }}
          onClick={() => router.push('/report')}
        >
          Report Now
        </button>
      </div>
      <div className="w-full max-w-3xl flex gap-4 mb-8">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            className={`px-6 py-2 rounded-full border font-medium transition text-base ${selected === tab.key ? 'bg-[#F7B52C] text-black' : 'bg-transparent text-black hover:bg-[#FDE8BE]'}`}
            style={{ fontFamily: 'Poppins, sans-serif' }}
            onClick={() => setSelected(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="w-full max-w-3xl">
        <DiscussionSection filter={selected} />
      </div>
    </div>
  );
} 