"use client";
import { useState } from 'react';

const testData = [
  {
    id: 1,
    level: 'Nice',
    type: 'Cherry',
    time: '12:12',
    address: '123 Main St, Toronto, M5A 1A1',
    description: 'Today is a nice day in Toronto.',
  },
  {
    id: 2,
    level: 'High',
    type: 'Flood',
    time: '09:30',
    address: '456 River Rd, Ottawa, K1A 0B1',
    description: 'The water level is rising, and some areas have been flooded.',
  },
  {
    id: 3,
    level: 'Medium',
    type: 'Wildfire',
    time: '15:45',
    address: '789 Forest Ave, Vancouver, V6T 1Z4',
    description: 'There is smoke in the forest, and there may be a small fire.',
  },
];

export default function DiscussionSection() {
  return (
    <section className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between bg-[#F7B52C] rounded-full px-6 py-3">
        <span className="text-lg font-medium text-black" style={{ fontFamily: 'Rethink Sans, sans-serif' }}>Discussion</span>
        <a href="/discussion" className="bg-white text-black rounded-full px-4 py-1 font-medium border border-[#F7B52C] hover:bg-[#FDE8BE] transition" style={{ fontFamily: 'Poppins, sans-serif' }}>
          View More
        </a>
      </div>
      <div className="flex flex-col gap-4 mt-2">
        {testData.map(item => (
          <div key={item.id} className="bg-[#FDE8BE] rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FEF8EA] text-black text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.level}</span>
                <span className="px-3 py-1 rounded-full bg-[#FEF8EA] text-black text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.type}</span>
              </div>
              <span className="text-xs text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.time}</span>
            </div>
            <div className="text-sm text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.address}</div>
            <div className="text-base text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.description}</div>
          </div>
        ))}
      </div>
    </section>
  );
} 