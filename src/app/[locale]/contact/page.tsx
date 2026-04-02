"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

type ContactLocation = {
  name: string;
  add?: string;
  tel?: string;
  fax?: string;
  pc?: string;
};

const CONTACT_LOCATIONS: ContactLocation[] = [
  {
    name: "Foshan ZYL Showroom",
    add: "F02, Central Zone, CCIH, No.68, Jihua West Road, Chancheng District, Foshan, Guangdong, China",
    tel: "+86 757-8256 8296",
    fax: "+86 757-8256 8296",
    pc: "528000",
  },
  { name: "Guangdong ZYL Industry" },
  { name: "Yunfu ZYL Stone" },
  { name: "Shanghai ZYL Stone" },
  { name: "Jiangsu ZYL Stone" },
  { name: "Guangzhou ZYL Stone" },
  { name: "C-Stone" },
];

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com", content: "f" },
  { label: "Instagram", href: "https://instagram.com", content: "ig" },
  { label: "YouTube", href: "https://youtube.com", content: "▶" },
];

const FORM_CONTROL_CLASS =
  "w-full border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-[#0f2858] focus:outline-none bg-white rounded-none";

export default function ContactPage() {
  const [activeAccordion, setActiveAccordion] = useState("Foshan ZYL Showroom");

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      {/* 1. Hero Banner */}
      <section className="relative w-full h-[350px] bg-neutral-200">
        <Image
          src="/assets/products/4114a4ac18610909eb9728c75328bcff.jpg"
          alt="Contact Us"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white pt-10">
          <h1 className="text-3xl md:text-5xl font-light tracking-wide mb-4">
            Contact Us
          </h1>
          <p className="text-sm md:text-base tracking-wide border-b border-transparent">
            Project quotation, product consultation, cooperation and exchange
          </p>
        </div>
      </section>

      {/* 2. Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-4 border-b border-gray-100 text-[13px] text-gray-500 mb-16">
        <span className="text-gray-400">◆</span> You are here: <Link href="/" className="hover:text-black">Home</Link> &gt; <span className="text-black">Contact Us</span>
      </div>

      {/* 3. Map & Locations Section */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Left Map (Placeholder for Map SVG) */}
          <div className="relative aspect-square md:aspect-auto md:h-[600px] w-full bg-neutral-50 flex items-center justify-center flex-col text-gray-400">
             <div className="text-center p-8 border border-dashed border-gray-200 w-full h-full flex flex-col items-center justify-center">
                <span className="mb-2">China Dotted Map SVG</span>
                <span className="text-xs">With multiple location pins</span>
             </div>
          </div>

          {/* Right Accordion */}
          <div className="flex flex-col gap-2">
            {CONTACT_LOCATIONS.map((loc) => {
              const isActive = activeAccordion === loc.name;
              return (
                <div key={loc.name} className="border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setActiveAccordion(loc.name)}
                    className={`w-full flex items-center p-0 transition-colors ${
                      isActive ? "bg-gray-50/50" : "bg-neutral-50 hover:bg-neutral-100"
                    }`}
                  >
                    <div className={`w-12 h-12 flex items-center justify-center ${isActive ? "bg-[#0f2858] text-white" : "bg-[#112349] text-white"}`}>
                      {isActive ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                    <span className="ml-4 text-[15px] font-medium text-gray-700 flex-1 text-left">
                      {loc.name}
                    </span>
                  </button>
                  
                  {isActive && loc.add && (
                    <div className="p-6 bg-gray-50/50 border-t border-gray-200 text-sm text-gray-600 leading-relaxed">
                      <div className="mb-2"><span className="text-gray-400">Add：</span> {loc.add}</div>
                      <div className="mb-2"><span className="text-gray-400">Tel：</span> <a href={`tel:${loc.tel}`} className="text-[#0ea5e9] hover:underline">{loc.tel}</a></div>
                      <div className="mb-2"><span className="text-gray-400">Fax：</span> {loc.fax}</div>
                      <div className="mb-8"><span className="text-gray-400">PC：</span> {loc.pc}</div>
                      
                      <div className="flex gap-2">
                        {SOCIAL_LINKS.map((link) => (
                          <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <span className="text-xs font-bold shrink-0">{link.content}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. Form Section */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <h2 className="text-3xl font-light text-[#1a1a1a] mb-12">Leave us a message</h2>
        
        <form className="w-full space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[15px] font-medium block">
                <span className="text-red-500 mr-1">*</span>Your Name:
              </label>
              <input type="text" placeholder="Enter Your Name *" className={FORM_CONTROL_CLASS} />
            </div>
            <div className="space-y-2">
              <label className="text-[15px] font-medium block">
                <span className="text-red-500 mr-1">*</span>Your Name:
              </label>
              <select className={`${FORM_CONTROL_CLASS} appearance-none text-gray-500`}>
                <option>You are a *</option>
                <option>Builder</option>
                <option>Designer</option>
                <option>Homeowner</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[15px] font-medium block">
                <span className="text-red-500 mr-1">*</span>E-mail:
              </label>
              <input type="email" placeholder="Enter Your E-mail *" className={FORM_CONTROL_CLASS} />
            </div>
            <div className="space-y-2">
              <label className="text-[15px] font-medium block">
                <span className="text-red-500 mr-1">*</span>Company:
              </label>
              <input type="text" placeholder="Enter Your Company *" className={FORM_CONTROL_CLASS} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[15px] font-medium block">
                <span className="text-red-500 mr-1">*</span>Website/Whatsapp/Phone/Wechat:
              </label>
              <input type="text" placeholder="Enter Your Whatsapp/Phone/Wechat" className={FORM_CONTROL_CLASS} />
            </div>
            <div className="space-y-2">
              <label className="text-[15px] font-medium block">
                <span className="text-red-500 mr-1">*</span>Country/Region:
              </label>
              <input type="text" placeholder="Enter Your Country/Region" className={FORM_CONTROL_CLASS} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[15px] font-medium block">
              <span className="text-red-500 mr-1">*</span>Your message:
            </label>
            <textarea 
              rows={6}
              placeholder="Enter Your Message" 
              className={`${FORM_CONTROL_CLASS} resize-none`} 
            />
          </div>

          <button type="button" className="w-full bg-[#0a1e3f] text-white py-4 text-sm font-medium tracking-wide hover:bg-black transition-colors uppercase">
            Send Inquiry
          </button>
        </form>
      </section>

      {/* 5. Get Free Sample Banner */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="w-full bg-neutral-100 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0 md:mr-8 text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-light text-[#112349] mb-4">Contact us</h2>
                <h2 className="text-4xl md:text-5xl font-light text-[#5a718b]">Get free sample!</h2>
            </div>
            <div className="flex-1 w-full max-w-3xl relative h-[250px] md:h-[300px]">
                {/* Free Sample image collage mock */}
                 <div className="absolute right-0 top-0 bottom-0 w-full bg-[#e5e7eb] flex items-center justify-center text-gray-400 text-sm">
                    Sample Book Mockup Graphic
                 </div>
            </div>
        </div>
      </section>

    </main>
  );
}
