import Image from "next/image";
import Link from "next/link";

interface CategoryShowcase {
  category: string;
  title: string;
  description: string;
  imageSrc: string;
  bgType: 'gray' | 'white';
}

const mainCategories: CategoryShowcase[] = [
  {
    category: "quartz",
    title: "Quart Stone & Zero Silica Stone",
    description: "Quartz Stone (90% quartz sand) & Zero Silica Stone (no silica), advanced-made. Wear/stain-resistant; Ideal for kitchen countertops/bathroom vanity tops, wall surfaces—durable, versatile for global projects.",
    imageSrc: "/assets/products/8498fbd0b0355c5a308df93e65b41cbc.jpg",
    bgType: 'gray'
  },
  {
    category: "silica-free",
    title: "Silica-Free Stone",
    description: "Traditional engineered quartz has long been favored for its hardness and durability, yet its high crystalline silica content poses serious health risks during fabrication and installation, including silicosis. In contrast, silica-free quartz, also known as zero silica quartz or non-silica quartz, eliminates crystalline silica entirely, ensuring silica dust-free fabrication and safe handling for both professionals and homeowners.",
    imageSrc: "/assets/products/4dfad52bc4f8b2c2bceabe1eb954a8de.jpg",
    bgType: 'white'
  },
  {
    category: "terrazzo",
    title: "Terrazzo",
    description: "Natural aggregates + eco-adhesive, high-pressure-formed. Large slabs ease install; hard, wear-resistant, non-flammable (green building). Indoor and outdoor floors and walls.",
    imageSrc: "/assets/products/c534a997a58eef6a2aa52b5d5d56c8a5.jpg",
    bgType: 'gray'
  },
  {
    category: "flexible-stone",
    title: "Flexible Stone",
    description: "Stone texture + flexibility. Lightweight, easy to install on walls/floors/irregular surfaces. Toxic-free, eco-safe; rich textures elevate modern/luxury spaces.",
    imageSrc: "/assets/products/9ac3cb95ac618347328625a26f0f9df5.jpg",
    bgType: 'white'
  },
  {
    category: "marble",
    title: "Marble",
    description: "Wayon Marble features unique natural textures and elegant luxury—ideal for hotel lobbies, fitting interior walls/floors of high-end malls, luxury mansions, etc.",
    imageSrc: "/assets/products/4114a4ac18610909eb9728c75328bcff.jpg",
    bgType: 'gray'
  },
  {
    category: "gem-stone",
    title: "Gem stone",
    description: "Precision-spliced gem slices, glazed for luster. Custom-shapable; luxurious shine & translucency. Fits accent walls, high-end furniture tops.",
    imageSrc: "/assets/products/7037b74ccb409b9cca57110044283d96.jpg",
    bgType: 'white'
  },
  {
    category: "cement-stone",
    title: "Cement Stone",
    description: "High-strength cement, high-pressure-made. Rich colors, surface holes; stable, non-flammable, insulating. Ideal for indoor/outdoor walls.",
    imageSrc: "/assets/products/b3939f4e7c1209a0d06c922bc717b30a.jpg",
    bgType: 'gray'
  },
  {
    category: "artificial-marble",
    title: "Artifical Marble",
    description: "Artifical Marble: natural mineral powder + eco-friendly binders, high-temp & high-pressure formed. Wear/scratch-resistant, non-toxic. Ideal for kitchen/bath vanities, walls, facades. Green building compliant, sleek versatile aesthetics.",
    imageSrc: "/assets/products/9ac3cb95ac618347328625a26f0f9df5.jpg", // placeholder
    bgType: 'white'
  },
  {
    category: "porcelain-slab",
    title: "Porcelain Slab",
    description: "Uses mineral powder and eco-friendly binders, formed by high-temperature & high-pressure processes. Wear-resistant, heat-resistant and eco-safe, it fits indoor/outdoor walls, mall panels, hotel, kitchen/bath/furniture tops.",
    imageSrc: "/assets/products/8498fbd0b0355c5a308df93e65b41cbc.jpg", // placeholder
    bgType: 'gray'
  }
];

export default function CollectionsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hero Banner */}
      <section className="relative w-full h-[300px] md:h-[350px] bg-neutral-100 flex items-center justify-center">
        {/* We use a static background block to emulate the original banner banner */}
        <div className="absolute inset-0 bg-[#e5e5e5] opacity-50" />
        <div className="relative z-10 text-center flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-light text-[#1a1a1a] mb-2 tracking-wide">
            Quality | Design
          </h1>
          <p className="text-sm text-gray-600 tracking-wider">
            Wayon stone, quality all the way.
          </p>
        </div>
      </section>

      {/* 2. Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-4 border-b border-gray-100 text-[13px] text-gray-500 mb-8">
        <span className="text-gray-400">◆</span> You are here: <Link href="/" className="hover:text-black">Home</Link> &gt; <span className="text-black">Collection</span>
      </div>

      {/* 3. Intro Text */}
      <div className="max-w-[1400px] mx-auto px-6 mb-16">
        <h2 className="text-2xl font-bold mb-2">Quartz Stone:</h2>
        <p className="text-gray-500 text-[15px] leading-relaxed">
          Wayon Quartz Stone contains over 90% high-quality quartz sand powder, along with premium resins, specialized pigments, and eco-friendly binders. It is formed through advanced vacuum pressure technology...
        </p>
        <div className="mt-4 text-center">
             <button className="text-sm text-gray-600 hover:text-black hover:underline flex items-center justify-center gap-1 mx-auto">
                Learn More <span className="text-xs">▼</span>
             </button>
        </div>
      </div>

      {/* 4. Zigzag Collection */}
      <div className="w-full flex flex-col">
        {mainCategories.map((cat, index) => {
          const isImageRight = index % 2 === 0;

          return (
            <div 
              key={cat.category}
              id={cat.category}
              className={`scroll-mt-24 w-full flex flex-col md:flex-row min-h-[500px] ${
                cat.bgType === 'gray' ? 'bg-[#f8f9fa]' : 'bg-white'
              }`}
            >
              {/* Text Side */}
              <div 
                className={`w-full md:w-1/2 flex items-center justify-center p-12 lg:p-24 ${
                  isImageRight ? 'order-2 md:order-1' : 'order-2 md:order-2'
                }`}
              >
                <div className="max-w-md w-full">
                  <h2 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a] mb-6">
                    {cat.title}
                  </h2>
                  <p className="text-gray-600 text-[15px] leading-relaxed mb-10 w-[95%]">
                    {cat.description}
                  </p>
                  {/* Note: The button in the screenshot has full rounded corners */}
                  <Link 
                    href={`/products?category=${cat.category}`}
                    className="inline-block bg-[#0f2858] text-white rounded-full px-8 py-3 text-sm tracking-widest hover:bg-black transition-colors shadow-sm"
                  >
                    Read More
                  </Link>
                </div>
              </div>

              {/* Image Side */}
              <div 
                className={`w-full md:w-1/2 relative min-h-[300px] md:min-h-full ${
                  isImageRight ? 'order-1 md:order-2' : 'order-1 md:order-1'
                }`}
              >
                <div className="absolute inset-0 max-w-[85%] max-h-[85%] m-auto scale-[0.9] hover:scale-95 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
                  <Image
                    src={cat.imageSrc}
                    alt={cat.title}
                    fill
                    className="object-cover shadow-sm bg-neutral-200"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
