import React from 'react';

export const ListCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5 flex flex-col justify-between animate-pulse">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-24 bg-[#1e1e1e] rounded-lg" />
          <div className="h-5 w-12 bg-[#1e1e1e] rounded-lg" />
        </div>
        <div className="h-5 w-3/4 bg-[#1e1e1e] rounded mb-2" />
        <div className="h-4 w-full bg-[#181818] rounded mb-1" />
        <div className="h-4 w-2/3 bg-[#181818] rounded" />
      </div>
      <div className="mt-5 pt-4 border-t border-[#1b1b1b] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-[#202020] border-2 border-[#111111]" />
            <div className="w-7 h-7 rounded-full bg-[#202020] border-2 border-[#111111]" />
            <div className="w-7 h-7 rounded-full bg-[#202020] border-2 border-[#111111]" />
          </div>
          <div className="h-3 w-12 bg-[#1e1e1e] rounded" />
        </div>
        <div className="h-3 w-16 bg-[#181818] rounded" />
      </div>
    </div>
  );
};

export const ToolRowSkeleton: React.FC = () => {
  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5 flex items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-9 h-9 rounded-xl bg-[#1e1e1e]" />
        <div className="w-12 h-12 rounded-xl bg-[#1e1e1e]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-[#1e1e1e] rounded" />
          <div className="h-3 w-3/4 bg-[#181818] rounded" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-16 h-8 rounded-xl bg-[#1e1e1e]" />
        <div className="w-16 h-8 rounded-xl bg-[#1e1e1e]" />
      </div>
    </div>
  );
};
