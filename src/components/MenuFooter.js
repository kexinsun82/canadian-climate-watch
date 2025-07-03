import { FaInstagram, FaTiktok, FaDiscord } from 'react-icons/fa';

export default function MenuFooter() {
  return (
    <footer className="w-full bg-[#5A629C] text-[#FFFFFE] py-8 px-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        {/* Left */}
        <div className="flex flex-col gap-2 text-base">
          <span>kexin.sun@help.com</span>
          <span>666-777-888</span>
          <span>Ontario, Canada</span>
          <span>© Copyright, Kexin Sun, 2025</span>
        </div>
        {/* Right */}
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" aria-label="Instagram" className="hover:text-yellow-200 transition-colors"><FaInstagram size={28} /></a>
          <a href="#" aria-label="TikTok" className="hover:text-yellow-200 transition-colors"><FaTiktok size={28} /></a>
          <a href="#" aria-label="Discord" className="hover:text-yellow-200 transition-colors"><FaDiscord size={28} /></a>
        </div>
      </div>
    </footer>
  );
} 