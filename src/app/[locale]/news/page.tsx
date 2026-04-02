import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Calendar } from 'lucide-react';

const newsItems = [
  {
    date: '2023-11-15',
    category: 'Company Update',
    title: 'ZYL Showcases Zero-Silica Quartz at Verona Marmomac',
    excerpt: 'Our completely silica-free engineered stone variations received widespread acclaim from global architects emphasizing sustainable and safe interior cladding materials.',
    img: 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80',
    slug: 'marmomac-zero-silica-showcase'
  },
  {
    date: '2023-09-08',
    category: 'Product Launch',
    title: 'Introducing the New Luxury Terrazzo Collection',
    excerpt: 'Capturing the essence of classic Venetian artisanship infused with modern high-performance binders, our new Terrazzo line redefines heavy-traffic commercial floors.',
    img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80',
    slug: 'luxury-terrazzo-launch'
  },
  {
    date: '2023-06-22',
    category: 'Milestone',
    title: 'Guangdong Factory Reaches 10 Million Sq.m Annual Output',
    excerpt: 'Marking a monumental achievement in operational scaling, our automated production lines have surpassed record efficiency metrics this fiscal year.',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80',
    slug: 'annual-output-milestone'
  },
  {
    date: '2023-03-30',
    category: 'Design Award',
    title: 'Architectural Design Excellence Award 2023',
    excerpt: 'ZYL Flexible Stone recognized for its hyper-realistic textures and bendable substrate allowing curved wall application without joint limitations.',
    img: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80',
    slug: 'design-award-2023'
  }
];

export default function NewsPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      <section className="bg-primary pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto animate-fade-up">
          <span className="text-gold font-bold tracking-widest uppercase text-sm mb-4 block">Press Room</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6">
            Company News & Updates
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto font-light">
            Stay informed with the latest organizational milestones, product innovations, and global exhibition announcements from ZYL Stone.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           
           {/* Featured News (Left col) */}
           <div className="lg:col-span-7">
             <Link href={`/news/${newsItems[0].slug}`} className="group block relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative aspect-4/3 w-full">
                  <Image src={newsItems[0].img} alt={newsItems[0].title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized/>
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center space-x-4 mb-3">
                     <span className="px-3 py-1 bg-gold text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                       {newsItems[0].category}
                     </span>
                     <span className="flex items-center text-gray-300 text-sm font-medium">
                       <Calendar className="w-4 h-4 mr-2" /> {newsItems[0].date}
                     </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
                     {newsItems[0].title}
                  </h2>
                  <p className="text-gray-300 line-clamp-2">
                     {newsItems[0].excerpt}
                  </p>
                </div>
             </Link>
           </div>
           
           {/* Recent News List (Right col) */}
           <div className="lg:col-span-5 flex flex-col space-y-6">
             <h3 className="text-2xl font-heading font-bold text-primary mb-2">Recent Updates</h3>
             <div className="h-px w-full bg-muted mb-4" />
             
             {newsItems.slice(1).map((news, idx) => (
                <Link key={idx} href={`/news/${news.slug}`} className="group flex space-x-4 pb-6 border-b border-muted/50 last:border-0 last:pb-0">
                   <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-lg overflow-hidden">
                      <Image src={news.img} alt={news.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized/>
                   </div>
                   <div className="flex flex-col justify-center">
                      <span className="text-xs text-muted-foreground font-medium mb-1 flex items-center">
                        {news.date} <span className="mx-2">&middot;</span> <span className="text-gold">{news.category}</span>
                      </span>
                      <h4 className="text-lg font-heading font-bold text-primary mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                        {news.title}
                      </h4>
                      <div className="mt-auto flex items-center text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        Read <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                   </div>
                </Link>
             ))}
           </div>
        </div>
      </section>
    </div>
  );
}
