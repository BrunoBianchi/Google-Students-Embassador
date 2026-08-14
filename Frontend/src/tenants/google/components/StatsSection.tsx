import React from 'react';
import { useCountUp } from '../../../hooks/useAnimations';

const stats = [
  { value: 500, suffix: '+', label: 'Embaixadores', color: '#4285F4' },
  { value: 150, suffix: '+', label: 'Campus', color: '#EA4335' },
  { value: 300, suffix: '+', label: 'Eventos', color: '#F9AB00' },
  { value: 50, suffix: 'K+', label: 'Estudantes Impactados', color: '#34A853' },
];

const StatItem: React.FC<{ value: number; suffix: string; label: string; color: string }> = ({ value, suffix, label, color }) => {
  const { count, ref } = useCountUp(value, 2000);
  
  return (
    <div ref={ref} className="flex flex-col items-center text-center px-6">
      <span className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color }}>
        {count}{suffix}
      </span>
      <span className="text-[13px] font-medium text-gray-500 mt-2 uppercase tracking-wider">{label}</span>
    </div>
  );
};

const StatsSection: React.FC = () => {
  return (
    <section className="relative py-20 -mt-1 bg-white border-y border-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, idx) => (
            <StatItem key={idx} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
