"use client";
import MenuNavigation from '../components/MenuNavigation';
import MenuFooter from '../components/MenuFooter';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const MapSection = dynamic(() => import('../components/MapSection'), { ssr: false });
const DiscussionSection = dynamic(() => import('../components/DiscussionSection'), { ssr: false });

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FEF8EA' }}>
      <main className="flex-1 flex flex-col gap-12 items-center px-4 py-8 max-w-4xl mx-auto w-full">
        <section className="w-full flex flex-col items-center gap-6">
          <h1 className="text-3xl font-medium" style={{ fontFamily: 'Rethink Sans, sans-serif' }}>Welcome to ClimaTrack Canada</h1>
          <p className="text-lg text-center px-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          ClimaTrack Canada is a real-time climate reporting platform that combines official data from <b>ECCC</b> and <b>NASA</b> with <b>Community-driven observations</b>. Track wildfires, floods, and seasonal changes near you. "Report Now" to share what you see. 
          </p>
          <button
            className="px-8 py-3 rounded-full bg-[var(--color-accent)] text-white text-lg font-medium hover:bg-[var(--color-primary)] transition"
            style={{ fontFamily: 'Poppins, sans-serif' }}
            onClick={() => router.push('/report')}
          >
            Report Now
          </button>
        </section>
        <MapSection />
        <DiscussionSection />
      </main>
    </div>
  );
}
