import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import type { NavigationKey } from "@/data/navigation";

interface CategoryShowcase {
  category: string;
  titleKey: NavigationKey;
  descriptionKey: NavigationKey;
  imageSrc: string;
  bgType: 'gray' | 'white';
}

const mainCategories: CategoryShowcase[] = [
  {
    category: "quartz",
    titleKey: "quartzStone", descriptionKey: "quartzDesc",
    imageSrc: "/assets/products/8498fbd0b0355c5a308df93e65b41cbc.jpg",
    bgType: 'gray'
  },
  {
    category: "silica-free",
    titleKey: "silicaFree", descriptionKey: "silicaDesc",
    imageSrc: "/assets/products/4dfad52bc4f8b2c2bceabe1eb954a8de.jpg",
    bgType: 'white'
  },
  {
    category: "terrazzo",
    titleKey: "terrazzo", descriptionKey: "terrazzoDesc",
    imageSrc: "/assets/products/c534a997a58eef6a2aa52b5d5d56c8a5.jpg",
    bgType: 'gray'
  },
  {
    category: "flexible-stone",
    titleKey: "flexibleStone", descriptionKey: "flexibleDesc",
    imageSrc: "/assets/products/9ac3cb95ac618347328625a26f0f9df5.jpg",
    bgType: 'white'
  },
  {
    category: "marble",
    titleKey: "marble", descriptionKey: "marbleDesc",
    imageSrc: "/assets/products/4114a4ac18610909eb9728c75328bcff.jpg",
    bgType: 'gray'
  },
  {
    category: "gem-stone",
    titleKey: "gemStone", descriptionKey: "gemDesc",
    imageSrc: "/assets/products/7037b74ccb409b9cca57110044283d96.jpg",
    bgType: 'white'
  },
  {
    category: "cement-stone",
    titleKey: "cementStone", descriptionKey: "cementDesc",
    imageSrc: "/assets/products/b3939f4e7c1209a0d06c922bc717b30a.jpg",
    bgType: 'gray'
  },
  {
    category: "artificial-marble",
    titleKey: "artificialMarble", descriptionKey: "artificialDesc",
    imageSrc: "/assets/products/9ac3cb95ac618347328625a26f0f9df5.jpg", // placeholder
    bgType: 'white'
  },
  {
    category: "porcelain-slab",
    titleKey: "porcelainSlab", descriptionKey: "porcelainDesc",
    imageSrc: "/assets/products/8498fbd0b0355c5a308df93e65b41cbc.jpg", // placeholder
    bgType: 'gray'
  }
];

export default function CollectionsPage() {
  const tNav = useTranslations("Navigation");
  const translateNav = (key: NavigationKey): string => tNav(key);

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hero Banner */}
      <section className="relative w-full h-[300px] md:h-[350px] bg-neutral-100 flex items-center justify-center">
        {/* We use a static background block to emulate the original banner banner */}
        <div className="absolute inset-0 bg-[#e5e5e5] opacity-50" />
        <div className="relative z-10 text-center flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-light text-[#1a1a1a] mb-2 tracking-wide">{tNav("home")} | {tNav("collection")}</h1>
          <p className="text-sm text-gray-600 tracking-wider">{tNav("quartzDesc").substring(0,40)}...</p>
        </div>
      </section>

      {/* 2. Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-4 border-b border-gray-100 text-[13px] text-gray-500 mb-8">
        <span className="text-gray-400">◆</span> You are here: <Link href="/" className="hover:text-black">{tNav("home")}</Link> &gt; <span className="text-black">{tNav("collection")}</span>
      </div>

      {/* 3. Intro Text */}
      <div className="max-w-[1400px] mx-auto px-6 mb-16">
        <h2 className="text-2xl font-bold mb-2">{tNav("quartzStone")}:</h2>
        <p className="text-gray-500 text-[15px] leading-relaxed">
          {tNav("quartzDesc")}...
        </p>
        <div className="mt-4 text-center">
             <button className="text-sm text-gray-600 hover:text-black hover:underline flex items-center justify-center gap-1 mx-auto"> {tNav("collection")} <span className="text-xs">▼</span>
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
                    {translateNav(cat.titleKey)}
                  </h2>
                  <p className="text-gray-600 text-[15px] leading-relaxed mb-10 w-[95%]">
                    {translateNav(cat.descriptionKey)}
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
                    alt={translateNav(cat.titleKey)}
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
