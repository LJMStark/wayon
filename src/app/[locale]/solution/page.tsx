"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SolutionPage() {
  const [activeTab, setActiveTab] = useState("Application field");
  const [activeSubTab, setActiveSubTab] = useState("Quartz Stone");

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#case') {
        setActiveTab('Project');
      }
    };
    
    // Check initially
    handleHashChange();

    // Listen for subsequent changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const allImages = [
    { src: "/assets/products/8498fbd0b0355c5a308df93e65b41cbc.jpg", aspect: "aspect-[4/3]" },
    { src: "/assets/products/9ac3cb95ac618347328625a26f0f9df5.jpg", aspect: "aspect-[3/4]" },
    { src: "/assets/products/4dfad52bc4f8b2c2bceabe1eb954a8de.jpg", aspect: "aspect-[16/9]" },
    { src: "/assets/products/c534a997a58eef6a2aa52b5d5d56c8a5.jpg", aspect: "aspect-square" },
    { src: "/assets/products/4114a4ac18610909eb9728c75328bcff.jpg", aspect: "aspect-[3/4]" },
    { src: "/assets/products/b3939f4e7c1209a0d06c922bc717b30a.jpg", aspect: "aspect-[16/9]" },
    { src: "/assets/products/7037b74ccb409b9cca57110044283d96.jpg", aspect: "aspect-[4/5]" },
    { src: "/assets/products/8498fbd0b0355c5a308df93e65b41cbc.jpg", aspect: "aspect-[16/9]" },
    { src: "/assets/products/9ac3cb95ac618347328625a26f0f9df5.jpg", aspect: "aspect-[4/3]" },
    { src: "/assets/products/4dfad52bc4f8b2c2bceabe1eb954a8de.jpg", aspect: "aspect-square" },
    { src: "/assets/products/c534a997a58eef6a2aa52b5d5d56c8a5.jpg", aspect: "aspect-[3/4]" },
    { src: "/assets/products/b3939f4e7c1209a0d06c922bc717b30a.jpg", aspect: "aspect-[4/5]" }
  ];

  const getImagesForTab = () => {
    switch (activeTab) {
      case "Finished Products": 
        return allImages.slice(3).concat(allImages.slice(0, 3));
      case "Project": 
        return [...allImages].reverse();
      case "360° View": 
        return allImages.slice(0, 6);
      default: // Application field
        if (activeSubTab === "Terrazzo Stone") return allImages.slice(2, 10);
        if (activeSubTab === "Cement Stone") return allImages.slice(4, 12);
        return allImages; // Quartz Stone
    }
  };

  const masonryImages = getImagesForTab();

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      {/* 1. Hero Banner */}
      <section className="relative w-full h-[350px] bg-neutral-200">
        <Image
          src="/assets/products/b3939f4e7c1209a0d06c922bc717b30a.jpg"
          alt="Solutions"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white pt-10">
          <h1 className="text-3xl md:text-5xl font-bold tracking-wider uppercase mb-4 shadow-sm">
            Master of Stone
          </h1>
          <p className="text-sm md:text-base tracking-[0.05em] uppercase border-b border-transparent">
            Indoor marble pure countertop background wall custom floor tile
          </p>
        </div>
      </section>

      {/* 2. Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-4 border-b border-gray-100 text-[13px] text-gray-500 mb-8">
        <span className="text-gray-400">◆</span> You are here: <Link href="/" className="hover:text-black">Home</Link> &gt; <Link href="/solution" className="hover:text-black">All Cases</Link> &gt; <span className="text-black">{activeTab}</span>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 pb-24">
        {/* 3. Tier 1 Navigation */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6">
          {["Finished Products", "Application field", "Project", "360° View"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 text-sm tracking-wide transition-colors border ${
                activeTab === tab
                  ? "bg-[#0f2858] text-white border-[#0f2858]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 4. Tier 2 Navigation */}
        {activeTab === "Application field" && (
          <div className="flex justify-center gap-8 mb-16 text-[13px] text-[#0f2858]">
            {["Quartz Stone", "Terrazzo Stone", "Cement Stone"].map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubTab(sub)}
                className={`transition-opacity uppercase hover:opacity-100 ${
                  activeSubTab === sub ? "opacity-100 font-medium" : "opacity-60"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* 5. Title & Masonry Grid */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-8">{activeTab}</h2>
          
          <div className="columns-1 md:columns-2 lg:columns-3 gap-2">
            {masonryImages.map((img, idx) => (
              <div 
                key={idx} 
                className="mb-2 break-inside-avoid relative overflow-hidden group cursor-pointer bg-neutral-100"
              >
                <div className={`relative w-full ${img.aspect}`}>
                  <Image
                    src={img.src}
                    alt={`Engineering Case ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                  />
                  {/* Subtle hover overlay watermark mimicking original style */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                     {/* Using the Wayon strict white logo SVG or text on hover - simulating here */}
                     <span className="text-white text-3xl font-light tracking-[0.2em] transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                       WAYON
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12 mb-12">
             <div className="text-center">
                 <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-transparent border-t-[#0f2858] border-r-[#0f2858] animate-spin mx-auto mb-2 opacity-50"></div>
                 <span className="text-xs text-gray-400">Loading...</span>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
