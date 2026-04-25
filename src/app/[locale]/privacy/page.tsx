import { notFound } from "next/navigation";

import { buildPageMetadata } from "@/lib/metadata";
import { hasLocale, type AppLocale } from "@/i18n/types";
import { routing } from "@/i18n/routing";

type PrivacyCopy = {
  title: string;
  updated: string;
  intro: string;
  sections: ReadonlyArray<{ heading: string; body: string }>;
  contactHeading: string;
  contactBody: string;
};

const COPY: Record<AppLocale, PrivacyCopy> = {
  zh: {
    title: "隐私政策",
    updated: "最后更新：2026 年 4 月 19 日",
    intro:
      "广东众岩联岩板科技有限公司（以下简称\u201C我们\u201D）通过 zylsinteredstone.com 运营本网站。本政策说明我们在您访问或通过本网站联系我们时如何收集、使用与保护您的信息。",
    sections: [
      {
        heading: "我们收集的信息",
        body: "当您填写询价表单、订阅或通过邮件/WhatsApp 与我们联系时，我们会收集您主动提供的信息：姓名、邮箱、电话或 WhatsApp、公司名称、所在国家／地区、意向品类与项目需求描述。服务器日志会自动记录 IP、浏览器信息、访问路径等技术数据，用于安全与性能分析。",
      },
      {
        heading: "信息如何使用",
        body: "我们仅将您的信息用于：响应询价、寄送样品与报价、处理后续商务沟通、根据法律要求进行记录保存，以及改进本网站的内容与性能。我们不会将您的个人信息出售给第三方。",
      },
      {
        heading: "Cookie 与数据分析",
        body: "本网站默认不设置任何用于广告或跨站追踪的 Cookie。我们使用符合 Google Consent Mode v2 的匿名分析脚本，在未获同意前不会写入分析 Cookie，也不会上传可识别个人身份的数据。",
      },
      {
        heading: "第三方服务",
        body: "询价邮件通过 Resend 送达公司邮箱；网站内容存储于自托管 Payload CMS（数据库由 Zeabur 托管，媒体文件存储于 Cloudflare R2）；基础设施由 Vercel 提供。上述服务商仅在为本站提供服务所必需的范围内处理数据。",
      },
      {
        heading: "您的权利",
        body: "您可以随时向我们申请访问、更正或删除您留存在本站的个人信息；也可以撤回此前的订阅或联系意愿。我们将在合理时间内回复并配合。",
      },
      {
        heading: "数据保留与跨境传输",
        body: "询价记录通常保留 24 个月，用于售后与商务追踪。由于我们服务的是全球客户，您的信息可能在中国大陆以外的服务器上传输和存储。",
      },
    ],
    contactHeading: "联系方式",
    contactBody:
      "关于本隐私政策的任何问题，请通过 zyl.stone.slab@gmail.com 或 WhatsApp +86 132 2924 6894 与我们联系。",
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: April 19, 2026",
    intro:
      "Guangdong ZYL Sintered Stone Technology Co., Ltd. (\u201Cwe\u201D, \u201Cus\u201D) operates zylsinteredstone.com. This policy explains how we collect, use and protect your information when you visit or contact us through this website.",
    sections: [
      {
        heading: "Information We Collect",
        body: "When you submit an inquiry, subscribe or reach out via email or WhatsApp, we collect the information you provide: name, email, phone or WhatsApp, company, country or region, product interest and project description. Server logs automatically record technical data such as IP address, browser and navigation path for security and performance analysis.",
      },
      {
        heading: "How We Use Information",
        body: "We use your information only to respond to inquiries, ship samples and quotations, handle subsequent business communication, fulfil record-keeping obligations, and improve the content and performance of this website. We do not sell your personal information to third parties.",
      },
      {
        heading: "Cookies and Analytics",
        body: "This site sets no advertising or cross-site tracking cookies by default. We use analytics that comply with Google Consent Mode v2: no analytics cookies are written and no personally identifiable data is sent until consent is granted.",
      },
      {
        heading: "Third-Party Services",
        body: "Inquiry emails are delivered via Resend; website content is stored in a self-hosted Payload CMS (database on Zeabur, media files on Cloudflare R2); infrastructure is hosted on Vercel. These providers process data strictly as needed to operate the site.",
      },
      {
        heading: "Your Rights",
        body: "You may request access to, correction or deletion of the personal information you have shared with us, and withdraw any previous consent for subscription or contact. We will respond within a reasonable time.",
      },
      {
        heading: "Retention and Cross-Border Transfer",
        body: "Inquiry records are typically retained for 24 months for after-sales and commercial follow-up. As we serve global clients, your information may be transmitted or stored on servers outside mainland China.",
      },
    ],
    contactHeading: "Contact",
    contactBody:
      "For any question about this Privacy Policy, reach us at zyl.stone.slab@gmail.com or WhatsApp +86 132 2924 6894.",
  },
  es: {
    title: "Política de Privacidad",
    updated: "Última actualización: 19 de abril de 2026",
    intro:
      "Guangdong ZYL Sintered Stone Technology Co., Ltd. (\u201Cnosotros\u201D) opera zylsinteredstone.com. Esta política explica cómo recopilamos, usamos y protegemos su información cuando visita o nos contacta a través de este sitio web.",
    sections: [
      {
        heading: "Información que Recopilamos",
        body: "Cuando envía una consulta, se suscribe o nos contacta por correo o WhatsApp, recopilamos la información que usted facilita: nombre, correo, teléfono o WhatsApp, empresa, país o región, interés de producto y descripción del proyecto. Los registros del servidor guardan automáticamente datos técnicos como IP, navegador y ruta de navegación para fines de seguridad y rendimiento.",
      },
      {
        heading: "Cómo Usamos la Información",
        body: "Usamos su información únicamente para responder consultas, enviar muestras y cotizaciones, gestionar la comunicación comercial posterior, cumplir obligaciones legales de archivo y mejorar el contenido y rendimiento del sitio. No vendemos su información personal a terceros.",
      },
      {
        heading: "Cookies y Analítica",
        body: "Este sitio no instala cookies publicitarias ni de seguimiento entre sitios por defecto. Usamos analítica compatible con Google Consent Mode v2: no se escriben cookies analíticas ni se envía información personal identificable sin su consentimiento previo.",
      },
      {
        heading: "Servicios de Terceros",
        body: "Los correos de consulta se entregan vía Resend; el contenido se almacena en un Payload CMS autoalojado (base de datos en Zeabur, archivos multimedia en Cloudflare R2); la infraestructura se aloja en Vercel. Estos proveedores procesan datos estrictamente en la medida necesaria para operar el sitio.",
      },
      {
        heading: "Sus Derechos",
        body: "Puede solicitar acceder, rectificar o eliminar la información personal compartida con nosotros, y retirar cualquier consentimiento previo de suscripción o contacto. Responderemos en un plazo razonable.",
      },
      {
        heading: "Conservación y Transferencia Internacional",
        body: "Los registros de consulta se conservan normalmente 24 meses para seguimiento comercial y postventa. Dado que atendemos a clientes globales, su información puede transmitirse o almacenarse en servidores fuera de China continental.",
      },
    ],
    contactHeading: "Contacto",
    contactBody:
      "Para cualquier consulta sobre esta Política de Privacidad, contáctenos en zyl.stone.slab@gmail.com o WhatsApp +86 132 2924 6894.",
  },
  ar: {
    title: "سياسة الخصوصية",
    updated: "آخر تحديث: 19 أبريل 2026",
    intro:
      "تدير شركة Guangdong ZYL Sintered Stone Technology Co., Ltd. (\u201Cنحن\u201D) موقع zylsinteredstone.com. توضح هذه السياسة كيفية جمع معلوماتك واستخدامها وحمايتها عند زيارتك للموقع أو تواصلك معنا من خلاله.",
    sections: [
      {
        heading: "المعلومات التي نجمعها",
        body: "عند إرسال استفسار أو الاشتراك أو التواصل عبر البريد الإلكتروني أو واتساب، نجمع المعلومات التي تقدمها: الاسم، البريد الإلكتروني، رقم الهاتف أو واتساب، اسم الشركة، الدولة أو المنطقة، المنتج المطلوب ووصف المشروع. تسجل سجلات الخادم تلقائيًا بيانات فنية مثل عنوان IP والمتصفح ومسار التصفح لأغراض الأمان والأداء.",
      },
      {
        heading: "كيف نستخدم المعلومات",
        body: "نستخدم معلوماتك فقط للرد على الاستفسارات، وإرسال العينات وعروض الأسعار، وإدارة الاتصالات التجارية اللاحقة، والوفاء بالتزامات حفظ السجلات، وتحسين محتوى وأداء الموقع. نحن لا نبيع معلوماتك الشخصية لأي طرف ثالث.",
      },
      {
        heading: "ملفات تعريف الارتباط والتحليلات",
        body: "لا يستخدم هذا الموقع ملفات تعريف ارتباط إعلانية أو تتبع عبر المواقع افتراضيًا. نستخدم تحليلات متوافقة مع Google Consent Mode v2: لا تُكتب ملفات تعريف ارتباط تحليلية ولا تُرسل بيانات تحديد الهوية الشخصية دون موافقتك.",
      },
      {
        heading: "خدمات الأطراف الثالثة",
        body: "تُرسل رسائل الاستفسار عبر Resend؛ ويُخزَّن المحتوى في نظام Payload CMS ذاتي الاستضافة (قاعدة البيانات على Zeabur، وملفات الوسائط على Cloudflare R2)؛ والبنية التحتية مُستضافة على Vercel. يعالج هؤلاء المزودون البيانات فقط بالقدر اللازم لتشغيل الموقع.",
      },
      {
        heading: "حقوقك",
        body: "يمكنك في أي وقت طلب الوصول إلى بياناتك الشخصية المحفوظة لدينا أو تصحيحها أو حذفها، وسحب أي موافقة سابقة للاشتراك أو التواصل. سنرد في غضون وقت معقول.",
      },
      {
        heading: "الاحتفاظ بالبيانات والنقل الدولي",
        body: "تُحفظ سجلات الاستفسار عادةً لمدة 24 شهرًا لأغراض المتابعة التجارية وخدمات ما بعد البيع. ونظرًا لخدمة عملاء عالميين، قد تُنقل معلوماتك أو تُخزن على خوادم خارج البر الرئيسي للصين.",
      },
    ],
    contactHeading: "تواصل معنا",
    contactBody:
      "لأي سؤال عن سياسة الخصوصية، راسلنا على zyl.stone.slab@gmail.com أو واتساب +86 132 2924 6894.",
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
    path: "/privacy",
  });
}

export default async function PrivacyPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const copy = COPY[locale];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-[#1a1a1a] py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 font-heading text-4xl font-bold uppercase tracking-wide text-white md:text-5xl">
            {copy.title}
          </h1>
          <p className="text-sm font-light text-gray-400">{copy.updated}</p>
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
