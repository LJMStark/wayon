import { notFound } from "next/navigation";

import { buildPageMetadata } from "@/lib/metadata";
import { hasLocale, type AppLocale } from "@/i18n/types";
import { routing } from "@/i18n/routing";

type TermsCopy = {
  title: string;
  updated: string;
  intro: string;
  sections: ReadonlyArray<{ heading: string; body: string }>;
  contactHeading: string;
  contactBody: string;
};

const COPY: Record<AppLocale, TermsCopy> = {
  zh: {
    title: "服务条款",
    updated: "最后更新：2026 年 4 月 19 日",
    intro:
      "本条款适用于您访问和使用 zylsinteredstone.com（由广东众岩联岩板科技有限公司运营）及由此展开的商务沟通。继续访问本网站，即表示您同意遵守以下条款。",
    sections: [
      {
        heading: "网站内容与知识产权",
        body: "本网站的文字、图片、视频、产品图册、LOGO 与版式设计均由我方或合作方享有相应知识产权。未经书面许可，不得复制、转载、镜像或用于任何商业用途。产品规格、颜色、纹理与参数以实物及正式合同为准。",
      },
      {
        heading: "询价与报价",
        body: "通过本网站发送的询价仅构成沟通意向，不构成要约或合同。最终规格、价格、交期与付款条款以双方签署的 PI/销售合同为准。图样、打样与样品在合同签订前保留我方处置权。",
      },
      {
        heading: "使用规范",
        body: "您不得利用本网站从事非法活动、发送垃圾信息、上传恶意代码、进行未授权爬取或尝试绕过安全机制。我方保留在发现违规时限制访问的权利。",
      },
      {
        heading: "免责声明",
        body: "本网站信息按\u201C现状\u201D提供。我们会尽合理努力保证内容准确，但不保证完全无误或随时可用。对于因使用本网站或相关信息造成的间接损失，我方不承担责任。",
      },
      {
        heading: "链接与第三方",
        body: "本网站可能包含第三方链接或嵌入（如 Instagram、YouTube、Pinterest、Google Maps）。这些资源由各自所有者运营，我方不对其内容或隐私实践负责。",
      },
      {
        heading: "适用法律",
        body: "本条款受中华人民共和国法律管辖；任何争议应首先通过友好协商解决，协商不成的，提交公司所在地有管辖权的法院处理。",
      },
      {
        heading: "条款更新",
        body: "我们可能根据业务与合规要求不定期更新本条款。更新内容自发布之日起生效，您继续使用本网站即视为接受更新后的条款。",
      },
    ],
    contactHeading: "联系方式",
    contactBody:
      "关于本条款的任何问题，请通过 zyl.stone.slab@gmail.com 或 WhatsApp +86 132 2924 6894 与我们联系。",
  },
  en: {
    title: "Terms of Service",
    updated: "Last updated: April 19, 2026",
    intro:
      "These Terms govern your access to and use of zylsinteredstone.com, operated by Guangdong ZYL Sintered Stone Technology Co., Ltd., and any commercial communication that follows. By continuing to browse this site you agree to these Terms.",
    sections: [
      {
        heading: "Website Content and Intellectual Property",
        body: "Text, images, videos, product brochures, logos and layouts on this site are owned by us or our partners. No part may be copied, republished, mirrored or used commercially without prior written consent. Product specifications, colors, textures and parameters shown online are indicative; the physical product and the signed contract prevail.",
      },
      {
        heading: "Inquiries and Quotations",
        body: "Inquiries submitted through this site are communications of interest and do not constitute an offer or contract. Final specifications, pricing, lead times and payment terms are set out in the signed PI or sales contract. Drawings, mock-ups and samples remain under our disposal until a contract is signed.",
      },
      {
        heading: "Acceptable Use",
        body: "You may not use this site for unlawful activity, spam, uploading malicious code, unauthorized scraping or attempts to circumvent security controls. We reserve the right to restrict access when misuse is detected.",
      },
      {
        heading: "Disclaimer",
        body: "The information on this site is provided \u201Cas is\u201D. We make reasonable efforts to keep content accurate but do not warrant that it is error-free or uninterrupted. We disclaim liability for indirect or consequential loss arising from the use of the site or its information.",
      },
      {
        heading: "Links and Third Parties",
        body: "This site may include links or embeds to third-party services (e.g. Instagram, YouTube, Pinterest, Google Maps). Such resources are operated by their respective owners and we are not responsible for their content or privacy practices.",
      },
      {
        heading: "Governing Law",
        body: "These Terms are governed by the laws of the People\u2019s Republic of China. Disputes should first be settled by good-faith negotiation; failing that, they shall be submitted to the competent court at the location of our registered office.",
      },
      {
        heading: "Updates",
        body: "We may update these Terms from time to time to reflect business or compliance changes. Updates take effect upon publication; your continued use of the site constitutes acceptance of the updated Terms.",
      },
    ],
    contactHeading: "Contact",
    contactBody:
      "For any question about these Terms, reach us at zyl.stone.slab@gmail.com or WhatsApp +86 132 2924 6894.",
  },
  es: {
    title: "Términos de Servicio",
    updated: "Última actualización: 19 de abril de 2026",
    intro:
      "Estos Términos rigen su acceso y uso de zylsinteredstone.com, operado por Guangdong ZYL Sintered Stone Technology Co., Ltd., y cualquier comunicación comercial posterior. Al seguir navegando por el sitio usted acepta estos Términos.",
    sections: [
      {
        heading: "Contenido y Propiedad Intelectual",
        body: "Los textos, imágenes, videos, catálogos, logotipos y diseños de este sitio pertenecen a la empresa o a sus socios. No está permitido copiar, republicar, reflejar ni usar comercialmente su contenido sin consentimiento previo por escrito. Las especificaciones, colores, texturas y parámetros mostrados son orientativos; prevalece el producto físico y el contrato firmado.",
      },
      {
        heading: "Consultas y Cotizaciones",
        body: "Las consultas enviadas desde este sitio son comunicaciones de interés y no constituyen una oferta ni contrato. Las especificaciones finales, precios, plazos y condiciones de pago se fijan en la PI o contrato de venta firmado. Los planos, maquetas y muestras permanecen a nuestra disposición hasta la firma del contrato.",
      },
      {
        heading: "Uso Aceptable",
        body: "No puede usar el sitio para actividades ilícitas, spam, envío de código malicioso, extracción no autorizada ni intentos de eludir los controles de seguridad. Nos reservamos el derecho de restringir el acceso en caso de uso indebido.",
      },
      {
        heading: "Exención de Responsabilidad",
        body: "La información se ofrece \u201Ctal cual\u201D. Hacemos esfuerzos razonables por mantenerla precisa, pero no garantizamos que esté libre de errores ni disponible de forma ininterrumpida. Declinamos responsabilidad por daños indirectos derivados del uso del sitio.",
      },
      {
        heading: "Enlaces y Terceros",
        body: "El sitio puede incluir enlaces o incrustaciones a servicios de terceros (por ejemplo Instagram, YouTube, Pinterest, Google Maps). Estos recursos los operan sus propios titulares y no somos responsables de su contenido ni de sus prácticas de privacidad.",
      },
      {
        heading: "Ley Aplicable",
        body: "Estos Términos se rigen por las leyes de la República Popular China. Las disputas se resolverán primero por negociación de buena fe; en su defecto, se someterán al tribunal competente del domicilio social de la empresa.",
      },
      {
        heading: "Actualizaciones",
        body: "Podemos actualizar estos Términos de vez en cuando por razones de negocio o cumplimiento. Las actualizaciones entran en vigor desde su publicación; el uso continuado del sitio implica la aceptación de los Términos actualizados.",
      },
    ],
    contactHeading: "Contacto",
    contactBody:
      "Para cualquier duda sobre estos Términos, contáctenos en zyl.stone.slab@gmail.com o WhatsApp +86 132 2924 6894.",
  },
  ar: {
    title: "شروط الخدمة",
    updated: "آخر تحديث: 19 أبريل 2026",
    intro:
      "تُنظم هذه الشروط وصولك إلى موقع zylsinteredstone.com (الذي تشغّله شركة Guangdong ZYL Sintered Stone Technology Co., Ltd.) واستخدامك له، وكذلك أي تواصل تجاري لاحق. باستمرارك في تصفح الموقع فإنك توافق على هذه الشروط.",
    sections: [
      {
        heading: "المحتوى والملكية الفكرية",
        body: "النصوص والصور ومقاطع الفيديو والكتالوجات والشعارات والتصاميم في هذا الموقع مملوكة لنا أو لشركائنا. لا يجوز نسخها أو إعادة نشرها أو إنشاء نسخ مطابقة منها أو استخدامها تجاريًا دون إذن كتابي مسبق. تُعرض المواصفات والألوان والمقاسات لأغراض إرشادية، ويسود المنتج الفعلي والعقد الموقّع.",
      },
      {
        heading: "الاستفسارات وعروض الأسعار",
        body: "تُعد الاستفسارات المُرسلة عبر الموقع مراسلات اهتمام ولا تمثل عرضًا أو عقدًا. تُحدد المواصفات النهائية والأسعار ومواعيد التسليم وشروط الدفع في فاتورة PI أو عقد البيع الموقّع. تبقى الرسومات والعيّنات والنماذج تحت تصرفنا حتى توقيع العقد.",
      },
      {
        heading: "الاستخدام المقبول",
        body: "لا يجوز استخدام الموقع لأي نشاط غير قانوني أو رسائل مزعجة أو رفع أكواد ضارة أو استخراج بيانات دون إذن أو محاولات تجاوز ضوابط الأمان. نحتفظ بحق تقييد الوصول عند اكتشاف أي سوء استخدام.",
      },
      {
        heading: "إخلاء المسؤولية",
        body: "تُقدم معلومات الموقع \u201Cكما هي\u201D. نبذل جهدًا معقولًا للحفاظ على دقتها لكننا لا نضمن خلوّها من الأخطاء أو توفرها دون انقطاع. لا نتحمل المسؤولية عن الأضرار غير المباشرة الناتجة عن استخدام الموقع.",
      },
      {
        heading: "الروابط والأطراف الثالثة",
        body: "قد يحتوي الموقع على روابط أو تضمينات لخدمات طرف ثالث (مثل Instagram وYouTube وPinterest وGoogle Maps). تُدار هذه الخدمات من قِبل أصحابها ولا نتحمل المسؤولية عن محتواها أو ممارسات خصوصيتها.",
      },
      {
        heading: "القانون الحاكم",
        body: "تخضع هذه الشروط لقوانين جمهورية الصين الشعبية. تُحل النزاعات أولًا بالتفاوض الودّي؛ وعند تعذر ذلك، تُحال إلى المحكمة المختصة في موقع المقر المسجّل للشركة.",
      },
      {
        heading: "التحديثات",
        body: "قد نحدّث هذه الشروط بين الحين والآخر لمواكبة المستجدات التجارية أو متطلبات الامتثال. تسري التحديثات من تاريخ النشر، ويُعدّ استمرار استخدامك للموقع موافقةً على الشروط المحدّثة.",
      },
    ],
    contactHeading: "تواصل معنا",
    contactBody:
      "لأي استفسار حول هذه الشروط، راسلنا على zyl.stone.slab@gmail.com أو واتساب +86 132 2924 6894.",
  },
};

type PageProps = { params: Promise<{ locale: string }> };

export function generateStaticParams(): Array<{ locale: string }> {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<import("next").Metadata> {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const copy = COPY[locale];

  return buildPageMetadata({
    locale,
    title: copy.title,
    description: copy.intro,
    path: "/terms",
  });
}

export default async function TermsPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const copy = COPY[locale];

  return (
    <div className="min-h-screen wayon-stone-bg">
      <section className="bg-[#1a1a1a] py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 font-heading text-4xl font-bold uppercase tracking-wide text-white md:text-5xl">
            {copy.title}
          </h1>
          <p className="text-sm font-normal text-[#666666]">{copy.updated}</p>
        </div>
      </section>

      <article className="mx-auto max-w-[900px] px-4 py-16 sm:px-6 lg:px-8">
        <p className="mb-10 text-base leading-8 text-gray-700">{copy.intro}</p>

        <div className="space-y-10">
          {copy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-3 font-heading text-xl font-semibold text-[#1a1a1a]">
                {section.heading}
              </h2>
              <p className="text-base leading-8 text-gray-700">{section.body}</p>
            </section>
          ))}

          <section>
            <h2 className="mb-3 font-heading text-xl font-semibold text-[#1a1a1a]">
              {copy.contactHeading}
            </h2>
            <p className="text-base leading-8 text-gray-700">{copy.contactBody}</p>
          </section>
        </div>
      </article>
    </div>
  );
}
