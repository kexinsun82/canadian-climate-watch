"use client";
import MenuNavigation from '@/components/MenuNavigation';
import MenuFooter from '@/components/MenuFooter';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const MapSection = dynamic(() => import('@/components/MapSection'), { ssr: false });
const DiscussionSection = dynamic(() => import('@/components/DiscussionSection'), { ssr: false });

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FEF8EA' }}>
      {/* <MenuNavigation /> */}
      <main className="flex-1 flex flex-col gap-12 items-center px-4 py-8 max-w-4xl mx-auto w-full">
        {/* Intro */}
        <section className="w-full flex flex-col items-center gap-6">
          <h1 className="text-3xl font-medium" style={{ fontFamily: 'Rethink Sans, sans-serif' }}>ClimaTrack Canada</h1>
          <p className="text-lg text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Climate Watch Canada is a weather observation-based application designed to empower Canadian residents, community organizers and environmental researchers to monitor and respond to climate change. 
          </p>
          <button
            className="mt-4 px-8 py-3 rounded-full bg-[#D40808] text-[#FFFFFE] text-lg font-medium transition hover:opacity-90"
            style={{ fontFamily: 'Poppins, sans-serif' }}
            onClick={() => router.push('/report')}
          >
            Report Now
          </button>
        </section>
        {/* Interactive Map */}
        <MapSection />
        {/* Discussion */}
        <DiscussionSection />
      </main>
      {/* <MenuFooter /> */}
    </div>
  );
}
