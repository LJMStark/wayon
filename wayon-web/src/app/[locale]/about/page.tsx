"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MoveRight } from "lucide-react";

export default function AboutPage() {
  const [activePhilosophyTab, setActivePhilosophyTab] = useState("Philosophy");
  const [activeExhibitionTab, setActiveExhibitionTab] = useState("Canton Fair");

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      {/* 1. Hero Banner */}
      <section className="relative w-full h-[400px] bg-neutral-200">
        <Image
          src="/assets/products/8498fbd0b0355c5a308df93e65b41cbc.jpg"
          alt="About Wayon"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-white uppercase">
            ABOUT WAYON
          </h1>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4 border-b border-gray-100 text-sm string text-gray-500">
        <span className="text-gray-400">◆</span> You are here: <Link href="/" className="hover:text-black">Home</Link> &gt; <span className="text-black">About Us</span>
      </div>

      {/* 2. Text Block */}
      <section id="who-are-we" className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-light mb-4">Wayon Stone - Quality All the Way</h2>
        <h3 className="text-sm font-semibold mb-10 tracking-wider">Wayon Stone - Professional Stone Engineering Supplier</h3>
        
        <div className="space-y-6 text-gray-600 text-[15px] leading-relaxed max-w-4xl mx-auto text-left md:text-center">
          <p>
            Wayon Stone, Established in China in 1982, is a global manufacturer of advanced materials with four major production and processing bases. The company has an annual output exceeding 3 million square meters of high-quality quartz, terrazzo, marble, artificial marble, gemstone, sintered stone, cement stone, soft stone, and other natural and innovative stone materials.
          </p>
          <p>
            Wayon specializes in producing and processing various types of stone products, including kitchen countertops, bathroom vanity tops, furniture table tops, wall and floor tiles, and custom-engineered stone products.
          </p>
          <p>
            Our services span both domestic and international markets, having provided one-stop solutions for material research and development, design optimization, and installation guidance to commercial real estate, high-end hotels, home furnishing brands, and engineering clients in over 80 countries and regions worldwide.
          </p>
          <p>
            For over 40 years, Wayon Stone has always adhered to the business philosophy of &quot;Integrity and Quality,&quot; continuously providing high-quality stone products and services to clients around the world. The company has expanded and grown, now owning its own quarries and R&amp;D centers. Wayon has also established numerous branches, including Guangdong Wayon Industrial, Foshan Wayon showroom, Shanghai Wayon, Yunfu Wayon, Guangzhou Wayon, Hong Kong Wayon, and C-Stone&apos;s professional engineering support center, forming a complete industrial layout and strong market service capabilities.
          </p>
        </div>
      </section>

      {/* 3. Stat Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-gray-100">
          <div className="flex flex-col items-center">
            <div className="text-5xl font-light text-[#0f2858] mb-2">41<span className="text-2xl"> Years</span></div>
            <div className="text-sm text-gray-500">Established</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-light text-[#0f2858] mb-2">130,000<span className="text-2xl"> m²</span></div>
            <div className="text-sm text-gray-500">Factory Size</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-light text-[#0f2858] mb-2">3,000,000<span className="text-2xl"> m²</span></div>
            <div className="text-sm text-gray-500">Annual Production</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-light text-[#0f2858] mb-2">100,000<span className="text-2xl"> m²</span></div>
            <div className="text-sm text-gray-500">Regular Stock</div>
          </div>
        </div>
      </section>

      {/* 4. Why Wayon Block */}
      <section id="factory" className="max-w-7xl mx-auto px-6 mb-24 hidden md:block">
        <div className="grid grid-cols-2 h-[400px]">
          <div className="relative bg-neutral-100 w-full h-full">
            <Image 
              src="/assets/products/4dfad52bc4f8b2c2bceabe1eb954a8de.jpg" 
              alt="Why Wayon" 
              fill 
              className="object-cover"
            />
          </div>
          <div className="bg-[#6b6c6e] text-white p-16 flex flex-col justify-center">
            <h2 className="text-3xl font-light mb-6">Why Wayon</h2>
            <p className="text-gray-200 text-[15px] leading-relaxed mb-10 w-[80%]">
              With over 40 years of expertise, Wayon Stone operates multiple factories and branches, delivering quality, innovative one-stop stone solutions and lasting value.
            </p>
            <Link href="/about#factory" className="flex items-center gap-2 text-sm tracking-wider hover:opacity-80 transition-opacity">
              Factory introduction <MoveRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Philosophy Tabs Block */}
      <section className="w-full bg-[#122245] text-white pt-24 pb-0 mb-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light tracking-wide mb-8">Philosophy</h2>
            <p className="max-w-2xl mx-auto text-gray-300 text-sm leading-relaxed">
              Since 1982, Wayon has adhered to the principle of Integrity and Quality, where integrity is the foundation of growth and quality is the soul of the brand. Our commitment &quot;Wayon Stone - Quality All the Way&quot; is reflected in every detail—from raw material selection and production to testing and service.
            </p>
          </div>
          
          <div className="flex justify-center border-b border-white/20">
            {["Philosophy", "Mission", "Vision", "Values"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActivePhilosophyTab(tab)}
                className={`px-12 py-5 text-sm uppercase tracking-wider transition-colors ${
                  activePhilosophyTab === tab 
                    ? "bg-[#0b1630] border-t-2 border-white" 
                    : "hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Certificates & Team */}
      <section id="certificate" className="max-w-7xl mx-auto px-6 mb-24">
        {/* Certificates */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-3xl font-light tracking-widest uppercase mb-6">CERTIFICATES</h2>
            <p className="text-gray-600 text-[15px] leading-relaxed mb-8">
              Wayon Stone has established a comprehensive global quality management system, and its products and services fully comply with international standards. It has been selected as a sample unit for the national foreign trade export leading index.
            </p>
            <Link href="/about#certificate" className="flex items-center gap-2 text-sm uppercase tracking-widest hover:text-gray-500 transition-colors border-b border-black pb-1">
              View Certificate <MoveRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative h-[300px] bg-neutral-100 flex items-center justify-center">
             <span className="text-gray-400 text-sm">common-section-1</span>
          </div>
        </div>

        {/* Team */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative h-[300px] bg-neutral-100 flex items-center justify-center order-2 md:order-1">
             <span className="text-gray-400 text-sm">common-section-2</span>
          </div>
          <div className="order-1 md:order-2">
        <h2 className="text-3xl font-light tracking-widest uppercase mb-6">TEAM</h2>
            <p className="text-gray-600 text-[15px] leading-relaxed">
              Wayon Stone boasts a highly skilled and experienced team dedicated to innovation in stone manufacturing. With decades of expertise, we deliver cutting-edge material solutions and provide professional, reliable service for global projects.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Exhibition */}
      <section className="max-w-7xl mx-auto px-6 text-center mb-32">
        <h2 className="text-3xl font-light tracking-[0.1em] uppercase mb-6">EXHIBITION</h2>
        <p className="text-gray-600 text-[15px] leading-relaxed max-w-4xl mx-auto mb-16">
          Wayon Stone, Established in China in 1982, is a global manufacturer of advanced materials with four major production and processing bases. The company has an annual output exceeding 3 million square meters of high-quality quartz, terrazzo, marble, artificial marble, gemstone, sintered stone, cement stone, soft stone, and other natural and innovative stone materials.
        </p>

        <div className="flex justify-center border-b border-gray-200 mb-12">
          {["Canton Fair", "Xiamen Exhibition", "Other exhibitions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveExhibitionTab(tab)}
              className={`px-10 py-4 text-sm tracking-wide transition-colors ${
                activeExhibitionTab === tab 
                  ? "text-[#1a1a1a] border-b-2 border-black font-medium" 
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col">
              <div className="aspect-4/3 bg-neutral-100 mb-4 flex items-center justify-center text-gray-300">
                a{i}
              </div>
              <p className="text-sm text-gray-500">2023 Spring Canton Fair</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Development History */}
      <section className="w-full bg-[#fcfcfc] py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-light tracking-widest text-gray-300 uppercase inline-block mr-4">DEVELOPMENT</h2>
            <h2 className="text-4xl font-bold tracking-widest text-[#0f2858] uppercase inline-block">HISTORY</h2>
          </div>

          <div className="relative border-l md:border-l md:border-gray-200 md:w-full">
            {/* The central line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 transform -translate-x-1/2" />

            {/* Timelines items - we do just a few to match design aesthetic 1:1 visually */}
            {[
              { year: "2024", text: "Wayon Stone was officially recommended by the Canton Fair and promoted its brand on the central stage of the Canton Fair Complex. It has participated in the fair for 18 consecutive years and 36 sessions without ever missing a session." },
              { year: "2022", text: "In 2022, Wayon Stone was awarded the title of 'Top Ten Preferred Material Suppliers in Shenzhen's Decoration Industry' for its outstanding product quality and engineering service capabilities, fully demonstrating the brand's leading position." },
              { year: "2020", text: "Awarded the 'China Design and Material Selection Gold Medal Service Provider' and the 'S+D Product and Design Award', Wayon Stone has earned recognition from a wide range of customers." }
            ].map((item, index) => (
              <div key={item.year} className={`relative mb-24 md:flex items-center justify-between w-full ${index % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"}`}>
                
                {/* Center marker */}
                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-[3px] border-white bg-gray-300 shadow-sm z-10" />

                {/* Content side */}
                <div className={`ml-8 md:ml-0 md:w-[45%] flex flex-col ${index % 2 === 0 ? "md:items-start md:text-left" : "md:items-end md:text-right"}`}>
                  <h3 className="text-3xl font-bold text-[#0f2858] mb-4">{item.year}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                    {item.text}
                  </p>
                </div>

                {/* Image side */}
                <div className={`ml-8 mt-6 md:mt-0 md:ml-0 md:w-[45%] aspect-video bg-neutral-100 flex items-center justify-center text-gray-300`}>
                  {item.year}Y
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <button className="bg-[#0f2858] text-white px-10 py-3 text-sm tracking-wider hover:bg-black transition-colors">
              More →
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}
