import { ArrowDown } from 'lucide-react';
import Link from 'next/link';

const CATALOGS = [
  { title: 'Quartz Stone Catalog', desc: 'Full product range of quartz stone surfaces including Natural, Pure, Crystal, Multi-Color, and Platinum series.', size: '12.5 MB', year: '2025' },
  { title: 'Terrazzo Collection', desc: 'Colourful, White, Grey & Black, and Nano Tech series with specifications and application guides.', size: '8.3 MB', year: '2025' },
  { title: 'Flexible Stone Guide', desc: 'Stone Mimic, Vein Flow, and Artisan Craft series. Installation methods and technical specifications.', size: '6.1 MB', year: '2025' },
  { title: 'Marble Collection', desc: 'Beige, Gray & Brown, Black & White, Travertine, and Luxury series with project references.', size: '15.2 MB', year: '2025' },
  { title: 'Gem Stone Catalog', desc: 'Agate, Semi Precious Stone, and Crystal series showcasing luxury translucent stone surfaces.', size: '9.7 MB', year: '2025' },
  { title: 'Cement Stone Guide', desc: 'Pure, Sandstone, and Line series. Industrial-grade engineered stone for modern architecture.', size: '5.4 MB', year: '2024' },
  { title: 'Artificial Marble Catalog', desc: 'White, Grey, Yellow, and Black series. Cost-effective marble alternatives with premium aesthetics.', size: '7.8 MB', year: '2024' },
  { title: 'Porcelain Slab Collection', desc: 'Classic Texture, Sintered Calacatta, Sintered Luxury in 12mm and 20mm thicknesses.', size: '11.0 MB', year: '2025' },
  { title: 'Silica-Free Stone Brochure', desc: 'Zero crystalline silica quartz alternative. Safety certifications and comparison data.', size: '3.2 MB', year: '2025' },
];

export default function DownloadPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-[#1a1a1a] py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white uppercase tracking-wide mb-4">
            Download
          </h1>
          <p className="text-gray-400 text-sm max-w-xl font-light">
            Access our complete product catalogs, technical specifications, and installation guides.
            All documents are available in PDF format.
          </p>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATALOGS.map((catalog, idx) => (
            <div
              key={idx}
              className="border border-gray-200 p-8 flex flex-col hover:border-[#1a1a1a] hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1">
                  PDF
                </span>
                <span className="text-[11px] text-gray-400">{catalog.year}</span>
              </div>

              <h3 className="text-lg font-bold text-[#1a1a1a] mb-3 font-heading">
                {catalog.title}
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed mb-6 font-light grow">
                {catalog.desc}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-[11px] text-gray-400">{catalog.size}</span>
                <button className="inline-flex items-center text-sm font-medium text-[#1a1a1a] group-hover:text-gray-600 transition-colors">
                  Download <ArrowDown className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-heading font-bold text-[#1a1a1a] mb-4 uppercase">
            Need Custom Documentation?
          </h2>
          <p className="text-sm text-gray-500 mb-8 font-light max-w-md mx-auto">
            Contact our team for tailored product specifications, project-specific catalogs, or technical support documents.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-3 bg-[#1a1a1a] text-white text-sm font-medium hover:bg-gray-800 transition-colors uppercase tracking-wide"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
