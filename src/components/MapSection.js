"use client";
import { useState } from 'react';

const mapTabs = [
  { key: 'eccc', label: 'ECCC' },
  { key: 'nasa', label: 'NASA' },
  { key: 'discussion', label: 'Discussion' },
];

export default function MapSection() {
  const [selected, setSelected] = useState('eccc');
  return (
    <section className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between bg-[#FDE8BE] rounded-full px-6 py-3">
        <span className="text-lg font-medium" style={{ fontFamily: 'Rethink Sans, sans-serif' }}>Interactive Map</span>
        <button className="bg-[#FDE8BE] rounded-full px-4 py-1 font-medium border border-[#F7B52C] hover:bg-[#F7B52C] transition" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Filters
        </button>
      </div>
      <div className="flex gap-4 justify-center mt-2">
        {mapTabs.map(tab => (
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
      <div className="w-full h-64 bg-gray-200 rounded-2xl flex items-center justify-center mt-4" style={{ minHeight: 300 }}>
        <span className="text-gray-500">{selected.toUpperCase()} Leaflet Map</span>
      </div>
    </section>
  );
} 