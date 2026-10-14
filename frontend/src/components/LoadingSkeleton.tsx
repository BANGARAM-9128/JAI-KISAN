import React from 'react';

export const WeatherCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-card animate-pulse space-y-4">
    <div className="flex justify-between items-center">
      <div className="h-6 bg-stone-200 rounded w-1/3"></div>
      <div className="h-6 bg-stone-200 rounded-full w-20"></div>
    </div>
    <div className="flex items-center gap-6 my-4">
      <div className="w-16 h-16 bg-stone-200 rounded-full"></div>
      <div className="space-y-2">
        <div className="h-10 bg-stone-200 rounded w-24"></div>
        <div className="h-4 bg-stone-200 rounded w-32"></div>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-stone-100">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 bg-stone-100 rounded-lg"></div>
      ))}
    </div>
  </div>
);

export const AdvisoryCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-card animate-pulse space-y-3">
    <div className="flex justify-between">
      <div className="h-5 bg-stone-200 rounded w-1/4"></div>
      <div className="h-5 bg-stone-200 rounded-full w-20"></div>
    </div>
    <div className="h-6 bg-stone-200 rounded w-3/4"></div>
    <div className="h-4 bg-stone-100 rounded w-full"></div>
    <div className="h-4 bg-stone-100 rounded w-2/3"></div>
    <div className="flex gap-2 pt-2">
      <div className="h-8 bg-stone-200 rounded w-28"></div>
    </div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-card animate-pulse space-y-4">
    <div className="h-6 bg-stone-200 rounded w-1/4"></div>
    <div className="h-56 bg-stone-100 rounded-xl"></div>
  </div>
);
