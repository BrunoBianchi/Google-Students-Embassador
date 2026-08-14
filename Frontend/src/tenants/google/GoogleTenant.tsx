import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PlatformPurposeSection from './components/PlatformPurposeSection';
import FeaturesSection from './components/FeaturesSection';
import InteractiveShowcase from './components/InteractiveShowcase';
import HowItWorksSection from './components/HowItWorksSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

const GoogleTenant: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFE] text-[#1e293b] font-sans selection:bg-blue-200">
      <Navbar />
      <main className="pb-12 space-y-4">
        <HeroSection />
        <PlatformPurposeSection />
        <FeaturesSection />
        <InteractiveShowcase />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default GoogleTenant;
