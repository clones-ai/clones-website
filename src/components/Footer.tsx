import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 items-center text-sm text-[#64748B]">
          <span className="font-light">© CLONES 2025</span>
          <span className="italic text-center font-light">By the people, For the people</span>
          <span className="text-right font-light">All Rights Reserved</span>
        </div>
      </div>
    </footer>
  );
}