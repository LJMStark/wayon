#!/usr/bin/env node
// One-shot: publish AI training lesson-1 company news for en/es/ar only (no zh).
// Default dry-run. Pass --apply to write media + news to production DB.
//
// Usage:
//   node --env-file=.env.local scripts/publishAiTrainingNewsOnce.mjs
//   node --env-file=.env.local scripts/publishAiTrainingNewsOnce.mjs --apply

import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPayload } from "payload";

import { buildLexicalDoc } from "./seoArticles/lexical.mjs";

const APPLY = process.argv.includes("--apply");
const SLUG = "ai-training-series-lesson-1-sintered-stone-export";
const CATEGORY = "company";
const IMAGE_DIR = "/tmp/ai-training-news";

const IMAGES = [
  {
    file: "01-group.jpg",
    alt: "ZYL AI practical training series lesson one group photo with Foshan e-commerce association banner",
  },
  {
    file: "02-audience-wide.jpg",
    alt: "Sintered stone manufacturers attending AI practical training workshop in Foshan",
  },
  {
    file: "03-audience-side.jpg",
    alt: "Workshop participants reviewing AI export playbooks during the first training session",
  },
  {
    file: "04-speaker.jpg",
    alt: "Speaker presenting AI-powered high-quality growth strategies for stone exporters",
  },
  {
    file: "05-classroom.jpg",
    alt: "Classroom session on global AI competition insights for manufacturing exporters",
  },
];

// --- SEO soft-article copy (en source; es/ar native business translations) ---

const EN = {
  title: "ZYL Opens AI Practical Training for Sintered Stone Export Teams",
  excerpt:
    "ZYL Sintered Stone launched the first session of its AI practical training series in Foshan, helping manufacturers turn AI from content tools into export workflows for inquiry handling, multi-language quoting, and custom slab operations.",
  blocks: [
    {
      type: "p",
      text: "Mid-year is when sintered stone exporters usually re-check the numbers that matter: inquiry response speed, quote accuracy, follow-up coverage, and how long custom drawings take to leave the factory. For many plants, the bottleneck is no longer only production capacity. It is the growing gap between rising overseas demand and teams still handling multi-channel messages, multi-size quotes, and multi-language replies by hand.",
    },
    {
      type: "p",
      text: "That is why **ZYL Sintered Stone** opened the first lesson of its **AI practical training series** in Foshan. The session is built for real factory and export operators, not for demo-only tool tours. The goal is simple: help sintered stone companies install AI where commercial work actually happens—so teams can respond faster, quote with more consistency, and protect conversion after the first inquiry.",
    },
    { type: "image", mediaIndex: 0 },
    {
      type: "h2",
      text: "Why sintered stone exporters need more than basic AI writing tools",
    },
    {
      type: "p",
      text: "Many companies have already tried AI for product descriptions or short social posts. Fewer have connected AI to the full export loop. In sintered stone trade, that loop usually includes Alibaba.com inquiries, WhatsApp and email threads, size and thickness options, edge and processing notes, destination-port shipping assumptions, multi-currency quotes, PI documents, and layered follow-up for new versus repeat buyers.",
    },
    {
      type: "p",
      text: "When these steps stay manual, export teams lose time on repetitive calculation and language work. Response quality also varies by person and shift. The first training lesson starts with a business review—not with prompt templates—so each company can map its own weak points before building agents.",
    },
    { type: "image", mediaIndex: 1 },
    {
      type: "h2",
      text: "Lesson one framework: review first, then set 30–60 day targets",
    },
    {
      type: "h3",
      text: "Export performance review",
    },
    {
      type: "p",
      text: "Participants reviewed inquiry conversion by channel, time spent on quoting, multi-language communication load, after-sales handling, and customer-file discipline. Common sintered stone pain points surfaced quickly: complex size/thickness/processing quotes, slow freight and FX checks, uneven follow-up for warm leads, and long claim paths after transport damage.",
    },
    {
      type: "h3",
      text: "Internal operations review",
    },
    {
      type: "p",
      text: "Teams also mapped low-value repeat work in R&D support, drawing generation, packing lists, document preparation, and inventory communication. The question was practical: which tasks can an agent own, and which decisions must stay with people?",
    },
    {
      type: "h3",
      text: "Measurable rollout goals",
    },
    {
      type: "ul",
      items: [
        "30 days: launch a sintered stone export customer-service agent and cut first-response delay",
        "60 days: deploy a code and customization agent for drawings, packing docs, and repeatable engineering outputs",
        "Quarter: improve inquiry conversion, reduce repetitive labor cost, and tighten after-sales response quality",
      ],
    },
    { type: "image", mediaIndex: 2 },
    {
      type: "h2",
      text: "Two practitioner viewpoints: proven export AI plus sintered stone operations",
    },
    {
      type: "p",
      text: "Many AI courses fail because instructors understand models but not factory commerce. This program pairs two complementary viewpoints.",
    },
    {
      type: "h3",
      text: "Benchmark path: Mr. Chen of Yaolong Group",
    },
    {
      type: "p",
      text: "Mr. Chen has been recognized among local manufacturers as an early operator who took AI beyond copywriting. His export-side practice covers inquiry intake, intelligent quoting, multi-language communication, customer archiving, and automated follow-up. The training uses that closed-loop experience as a benchmark for what \"AI that moves revenue\" looks like in physical-goods trade.",
    },
    {
      type: "h3",
      text: "Industry path: ZYL founder perspective",
    },
    {
      type: "p",
      text: "ZYL's founder brings years of sintered stone manufacturing and export reality: many SKUs, custom processing, dense quoting rules, and fragmented after-sales details. That context is used to reshape generic agent ideas into workflows that fit slab factories—tool routing, planning steps, and layered memory for products, customers, and drawings.",
    },
    { type: "image", mediaIndex: 3 },
    {
      type: "h2",
      text: "Two agents built for sintered stone commercial work",
    },
    {
      type: "h3",
      text: "1) Export customer-service agent",
    },
    {
      type: "p",
      text: "The first agent targets multi-channel inquiry conversion. A practical flow looks like this: customer message arrives from Alibaba, WhatsApp, or email → the agent identifies sintered stone intent (size, thickness, finish, processing, destination port) → it retrieves product and customer history → it calls tools for cost, FX, freight assumptions, and PI support → it drafts a professional multi-language reply → it archives the lead and schedules staged follow-up.",
    },
    {
      type: "p",
      text: "For exporters, the payoff is not \"smarter chat.\" It is shorter response cycles, more consistent commercial language, fewer missed warm leads, and cleaner customer records for the next sale.",
    },
    {
      type: "h3",
      text: "2) Code and customization agent",
    },
    {
      type: "p",
      text: "The second agent supports drawings, packing documents, and repeatable engineering outputs. It breaks down custom requests, reuses historical parameters, runs checks, and prepares processing drawings or shipment documents faster than a fully manual handoff. That matters in sintered stone because high mix and cross-border customization create document bottlenecks long before the press line does.",
    },
    { type: "image", mediaIndex: 4 },
    {
      type: "h2",
      text: "What ZYL wants manufacturers to take home",
    },
    {
      type: "p",
      text: "The first lesson closes on a clear standard: AI is useful only when it enters the profit path. Writing posts is not enough. Sintered stone companies need agents that sit inside inquiry, quote, customization, and service workflows.",
    },
    {
      type: "p",
      text: "To make later tooling useful, each company is asked to prepare a compact operating package:",
    },
    {
      type: "ul",
      items: [
        "One-sentence company introduction",
        "Core product and service list",
        "Target buyer profile",
        "Typical customer requests",
        "Key differentiators and selling points",
        "Frequent buyer questions",
        "Document and asset directory for agent tools",
      ],
    },
    {
      type: "p",
      text: "ZYL will continue the series as a practical path for sintered stone manufacturers that want measurable export improvement—not another abstract AI seminar. International buyers and partners looking for a digitally capable Foshan sintered stone supplier can follow ZYL's news updates and product catalog for more factory and trade-side progress.",
    },
  ],
};

const ES = {
  title: "ZYL lanza formación práctica de IA para equipos de exportación de piedra sinterizada",
  excerpt:
    "ZYL Sintered Stone inauguró en Foshan la primera sesión de su serie de formación práctica en IA, para ayudar a fabricantes a convertir la inteligencia artificial en flujos reales de exportación: atención de consultas, cotización multilingüe y operaciones de losas a medida.",
  blocks: [
    {
      type: "p",
      text: "A mitad de año, los exportadores de piedra sinterizada suelen revisar los indicadores que realmente importan: velocidad de respuesta a consultas, precisión de cotizaciones, cobertura de seguimiento y el tiempo que tardan los planos personalizados en salir de fábrica. Para muchas plantas, el cuello de botella ya no es solo la capacidad productiva. Es la brecha entre la demanda exterior y equipos que aún gestionan a mano mensajes multicanal, cotizaciones multi-especificación y respuestas en varios idiomas.",
    },
    {
      type: "p",
      text: "Por eso **ZYL Sintered Stone** abrió la primera lección de su **serie de formación práctica en IA** en Foshan. La sesión está pensada para operadores reales de fábrica y exportación, no para demostraciones superficiales de herramientas. El objetivo es claro: instalar la IA donde ocurre el trabajo comercial, para responder más rápido, cotizar con más consistencia y proteger la conversión después de la primera consulta.",
    },
    { type: "image", mediaIndex: 0 },
    {
      type: "h2",
      text: "Por qué los exportadores de piedra sinterizada necesitan más que redactores de IA",
    },
    {
      type: "p",
      text: "Muchas empresas ya han probado la IA para fichas de producto o publicaciones cortas. Menos han conectado la IA con el circuito completo de exportación. En el comercio de piedra sinterizada, ese circuito suele incluir consultas de Alibaba.com, hilos de WhatsApp y correo, opciones de tamaño y espesor, notas de mecanizado, supuestos de flete a puerto de destino, cotizaciones multi-divisa, documentos PI y un seguimiento distinto para clientes nuevos y recurrentes.",
    },
    {
      type: "p",
      text: "Cuando estos pasos siguen siendo manuales, los equipos pierden tiempo en cálculos y traducción repetitivos. La calidad de la respuesta también varía según la persona y el turno. La primera lección empieza con una revisión de negocio —no con plantillas de prompts— para que cada empresa localice sus puntos débiles antes de construir agentes.",
    },
    { type: "image", mediaIndex: 1 },
    {
      type: "h2",
      text: "Marco de la lección 1: primero revisar, luego fijar metas de 30–60 días",
    },
    {
      type: "h3",
      text: "Revisión del rendimiento exportador",
    },
    {
      type: "p",
      text: "Los participantes revisaron la conversión de consultas por canal, el tiempo dedicado a cotizar, la carga de comunicación multilingüe, la gestión postventa y la disciplina de archivos de cliente. Aparecieron con rapidez dolores habituales del sector: cotizaciones complejas por tamaño/espesor/procesado, comprobaciones lentas de flete y tipo de cambio, seguimiento irregular de leads calientes y largos procesos de reclamación tras daños en transporte.",
    },
    {
      type: "h3",
      text: "Revisión de operaciones internas",
    },
    {
      type: "p",
      text: "Los equipos también mapearon trabajo repetitivo de bajo valor en soporte de I+D, generación de planos, listas de embalaje, preparación documental y comunicación de inventario. La pregunta era práctica: ¿qué tareas puede asumir un agente y qué decisiones deben quedarse en personas?",
    },
    {
      type: "h3",
      text: "Objetivos de despliegue medibles",
    },
    {
      type: "ul",
      items: [
        "30 días: lanzar un agente de atención al cliente de exportación de piedra sinterizada y reducir el retraso de la primera respuesta",
        "60 días: desplegar un agente de código y personalización para planos, documentos de embalaje y salidas de ingeniería repetibles",
        "Trimestre: mejorar la conversión de consultas, reducir coste laboral repetitivo y endurecer la calidad de respuesta postventa",
      ],
    },
    { type: "image", mediaIndex: 2 },
    {
      type: "h2",
      text: "Dos perspectivas de campo: IA exportadora probada y operaciones de piedra sinterizada",
    },
    {
      type: "p",
      text: "Muchos cursos de IA fallan porque el formador entiende modelos, pero no el comercio de fábrica. Este programa combina dos visiones complementarias.",
    },
    {
      type: "h3",
      text: "Ruta de referencia: el Sr. Chen del Grupo Yaolong",
    },
    {
      type: "p",
      text: "El Sr. Chen es reconocido entre fabricantes locales como un operador temprano que llevó la IA más allá de la redacción. Su práctica exportadora cubre captación de consultas, cotización inteligente, comunicación multilingüe, archivo de clientes y seguimiento automatizado. La formación usa ese bucle cerrado como referencia de lo que significa una IA que mueve ingresos en el comercio de bienes físicos.",
    },
    {
      type: "h3",
      text: "Ruta de industria: perspectiva del fundador de ZYL",
    },
    {
      type: "p",
      text: "El fundador de ZYL aporta años de realidad de fabricación y exportación de piedra sinterizada: muchos SKU, procesados a medida, reglas de cotización densas y detalles postventa fragmentados. Ese contexto sirve para convertir ideas genéricas de agentes en flujos útiles para fábricas de losas: enrutado de herramientas, pasos de planificación y memoria por capas para productos, clientes y planos.",
    },
    { type: "image", mediaIndex: 3 },
    {
      type: "h2",
      text: "Dos agentes pensados para el trabajo comercial de piedra sinterizada",
    },
    {
      type: "h3",
      text: "1) Agente de atención al cliente de exportación",
    },
    {
      type: "p",
      text: "El primer agente apunta a la conversión de consultas multicanal. Un flujo práctico es: llega el mensaje desde Alibaba, WhatsApp o correo → el agente identifica la intención de compra de piedra sinterizada (tamaño, espesor, acabado, procesado, puerto de destino) → recupera historial de producto y cliente → llama a herramientas de coste, divisa, flete y soporte de PI → redacta una respuesta profesional multilingüe → archiva el lead y programa el seguimiento por etapas.",
    },
    {
      type: "p",
      text: "Para el exportador, el beneficio no es un chat más inteligente. Son ciclos de respuesta más cortos, un lenguaje comercial más consistente, menos leads calientes perdidos y registros de cliente más limpios para la siguiente venta.",
    },
    {
      type: "h3",
      text: "2) Agente de código y personalización",
    },
    {
      type: "p",
      text: "El segundo agente apoya planos, documentos de embalaje y salidas de ingeniería repetibles. Descompone pedidos a medida, reutiliza parámetros históricos, ejecuta comprobaciones y prepara planos de procesado o documentos de envío más rápido que un traspaso totalmente manual. Eso importa en piedra sinterizada porque la alta variedad y la personalización cross-border crean cuellos de botella documentales mucho antes de la línea de prensa.",
    },
    { type: "image", mediaIndex: 4 },
    {
      type: "h2",
      text: "Lo que ZYL quiere que los fabricantes se lleven a casa",
    },
    {
      type: "p",
      text: "La primera lección cierra con un estándar claro: la IA solo es útil cuando entra en la ruta del beneficio. Escribir publicaciones no basta. Las empresas de piedra sinterizada necesitan agentes dentro de los flujos de consulta, cotización, personalización y servicio.",
    },
    {
      type: "p",
      text: "Para que el tooling posterior sea útil, se pide a cada empresa un paquete operativo compacto:",
    },
    {
      type: "ul",
      items: [
        "Presentación de la empresa en una frase",
        "Lista de productos y servicios principales",
        "Perfil del comprador objetivo",
        "Solicitudes típicas de clientes",
        "Diferenciadores y argumentos de venta clave",
        "Preguntas frecuentes de compradores",
        "Directorio de documentos y activos para herramientas del agente",
      ],
    },
    {
      type: "p",
      text: "ZYL continuará la serie como una vía práctica para fabricantes de piedra sinterizada que buscan mejora exportadora medible, no otro seminario abstracto de IA. Compradores e partners internacionales que busquen un proveedor digitalmente capaz en Foshan pueden seguir las noticias y el catálogo de ZYL para más avances de fábrica y comercio.",
    },
  ],
};

const AR = {
  title: "ZYL تطلق تدريبًا عمليًا بالذكاء الاصطناعي لفرق تصدير الحجر المتكلس",
  excerpt:
    "أطلقت ZYL Sintered Stone في فوشان الجلسة الأولى من سلسلة تدريبها العملي بالذكاء الاصطناعي، لمساعدة المصنّعين على تحويل الذكاء الاصطناعي من أدوات محتوى إلى مسارات تصدير حقيقية: معالجة الاستفسارات، والتسعير متعدد اللغات، وعمليات الألواح المخصصة.",
  blocks: [
    {
      type: "p",
      text: "في منتصف العام، يعيد مصدّرو الحجر المتكلس عادةً فحص الأرقام التي تهم فعلًا: سرعة الرد على الاستفسارات، ودقة عروض الأسعار، وتغطية المتابعة، والوقت الذي تستغرقه الرسومات المخصصة لمغادرة المصنع. بالنسبة لكثير من المصانع، لم يعد عنق الزجاجة الإنتاج فقط، بل الفجوة بين الطلب الخارجي والفرق التي ما زالت تعالج الرسائل متعددة القنوات والتسعير متعدد المواصفات والردود متعددة اللغات يدويًا.",
    },
    {
      type: "p",
      text: "لهذا افتتحت **ZYL Sintered Stone** الدرس الأول من **سلسلة التدريب العملي بالذكاء الاصطناعي** في فوشان. الجلسة موجهة لمشغّلي المصانع والتصدير الحقيقيين، لا لجولات أدوات تجريبية. الهدف بسيط: وضع الذكاء الاصطناعي حيث يحدث العمل التجاري فعلًا، حتى تستجيب الفرق أسرع، وتسعّر بمزيد من الاتساق، وتحمي التحويل بعد أول استفسار.",
    },
    { type: "image", mediaIndex: 0 },
    {
      type: "h2",
      text: "لماذا يحتاج مصدّرو الحجر المتكلس إلى أكثر من أدوات الكتابة بالذكاء الاصطناعي",
    },
    {
      type: "p",
      text: "جرّبت شركات كثيرة الذكاء الاصطناعي لوصف المنتجات أو المنشورات القصيرة. أما ربطه بدورة التصدير الكاملة فما زال أقل شيوعًا. في تجارة الحجر المتكلس تشمل هذه الدورة عادةً استفسارات Alibaba.com، ومحادثات WhatsApp والبريد، وخيارات المقاس والسماكة، وملاحظات التجهيز، وافتراضات الشحن إلى ميناء الوصول، والتسعير متعدد العملات، ووثائق PI، ومتابعة متدرجة للعملاء الجدد والمتكررين.",
    },
    {
      type: "p",
      text: "عندما تبقى هذه الخطوات يدوية، تفقد فرق التصدير وقتًا في الحسابات واللغة المتكررة، وتتفاوت جودة الرد حسب الشخص والوردية. يبدأ الدرس الأول بمراجعة أعمال—لا بقوالب أوامر—حتى تحدّد كل شركة نقاط ضعفها قبل بناء الوكلاء.",
    },
    { type: "image", mediaIndex: 1 },
    {
      type: "h2",
      text: "إطار الدرس الأول: المراجعة أولًا ثم أهداف 30–60 يومًا",
    },
    {
      type: "h3",
      text: "مراجعة أداء التصدير",
    },
    {
      type: "p",
      text: "راجع المشاركون تحويل الاستفسارات حسب القناة، والوقت المستغرق في التسعير، وعبء التواصل متعدد اللغات، وإدارة ما بعد البيع، وانضباط ملفات العملاء. ظهرت سريعًا نقاط ألم شائعة في الحجر المتكلس: تسعير معقّد حسب المقاس/السماكة/التجهيز، وفحوصات بطيئة للشحن وأسعار الصرف، ومتابعة غير متساوية للفرص الدافئة، ومسارات مطالبات طويلة بعد أضرار النقل.",
    },
    {
      type: "h3",
      text: "مراجعة العمليات الداخلية",
    },
    {
      type: "p",
      text: "رسمت الفرق أيضًا الأعمال المتكررة منخفضة القيمة في دعم البحث والتطوير، وتوليد الرسومات، وقوائم التعبئة، وإعداد الوثائق، وتواصل المخزون. السؤال كان عمليًا: أي المهام يمكن أن يملكها الوكيل، وأي القرارات يجب أن تبقى للبشر؟",
    },
    {
      type: "h3",
      text: "أهداف طرح قابلة للقياس",
    },
    {
      type: "ul",
      items: [
        "30 يومًا: إطلاق وكيل خدمة عملاء لتصدير الحجر المتكلس وتقليل تأخير أول رد",
        "60 يومًا: نشر وكيل للبرمجة والتخصيص للرسومات ووثائق التعبئة والمخرجات الهندسية المتكررة",
        "ربع سنوي: تحسين تحويل الاستفسارات، وخفض تكلفة العمل المتكرر، ورفع جودة استجابة ما بعد البيع",
      ],
    },
    { type: "image", mediaIndex: 2 },
    {
      type: "h2",
      text: "منظوران ميدانيان: ذكاء اصطناعي تصديري مجرّب وعمليات الحجر المتكلس",
    },
    {
      type: "p",
      text: "تفشل دورات ذكاء اصطناعي كثيرة لأن المدرّب يفهم النماذج ولا يفهم تجارة المصنع. يجمع هذا البرنامج بين منظورين متكاملين.",
    },
    {
      type: "h3",
      text: "مسار معياري: السيد تشن من مجموعة Yaolong",
    },
    {
      type: "p",
      text: "يُعرف السيد تشن بين المصنّعين المحليين كمشغّل مبكر نقل الذكاء الاصطناعي إلى ما بعد كتابة المحتوى. تغطي ممارسته التصديرية استقبال الاستفسارات، والتسعير الذكي، والتواصل متعدد اللغات، وأرشفة العملاء، والمتابعة المؤتمتة. يستخدم التدريب هذه الحلقة المغلقة معيارًا لما يبدو عليه الذكاء الاصطناعي الذي يحرّك الإيراد في تجارة السلع المادية.",
    },
    {
      type: "h3",
      text: "مسار الصناعة: منظور مؤسس ZYL",
    },
    {
      type: "p",
      text: "يقدّم مؤسس ZYL سنوات من واقع تصنيع وتصدير الحجر المتكلس: وحدات حفظ مخزون كثيرة، وتجهيز مخصص، وقواعد تسعير كثيفة، وتفاصيل ما بعد بيع مجزأة. يُستخدم هذا السياق لإعادة تشكيل أفكار الوكلاء العامة إلى مسارات تناسب مصانع الألواح: توجيه الأدوات، وخطوات التخطيط، وذاكرة طبقية للمنتجات والعملاء والرسومات.",
    },
    { type: "image", mediaIndex: 3 },
    {
      type: "h2",
      text: "وكيلان مبنيان للعمل التجاري في الحجر المتكلس",
    },
    {
      type: "h3",
      text: "1) وكيل خدمة عملاء التصدير",
    },
    {
      type: "p",
      text: "يستهدف الوكيل الأول تحويل الاستفسارات متعددة القنوات. يبدو المسار العملي هكذا: تصل رسالة العميل من Alibaba أو WhatsApp أو البريد → يحدّد الوكيل نية شراء الحجر المتكلس (المقاس، السماكة، التشطيب، التجهيز، ميناء الوصول) → يسترجع تاريخ المنتج والعميل → يستدعي أدوات التكلفة والعملة والشحن ودعم PI → يصوغ ردًا مهنيًا متعدد اللغات → يؤرشف العميل المحتمل ويجدول متابعة متدرجة.",
    },
    {
      type: "p",
      text: "بالنسبة للمصدّر، العائد ليس محادثة أذكى فقط، بل دورات رد أقصر، ولغة تجارية أكثر اتساقًا، وفرص دافئة أقل ضياعًا، وسجلات عملاء أنظف للصفقة التالية.",
    },
    {
      type: "h3",
      text: "2) وكيل البرمجة والتخصيص",
    },
    {
      type: "p",
      text: "يدعم الوكيل الثاني الرسومات ووثائق التعبئة والمخرجات الهندسية المتكررة. يفكك الطلبات المخصصة، ويعيد استخدام المعاملات التاريخية، وينفّذ فحوصات، ويُعد رسومات التجهيز أو وثائق الشحن أسرع من التسليم اليدوي الكامل. هذا مهم في الحجر المتكلس لأن التنوع العالي والتخصيص عبر الحدود يخلقان اختناقات وثائقية قبل خط الضغط بوقت طويل.",
    },
    { type: "image", mediaIndex: 4 },
    {
      type: "h2",
      text: "ما تريد ZYL أن يأخذه المصنّعون معهم",
    },
    {
      type: "p",
      text: "يختتم الدرس الأول بمعيار واضح: الذكاء الاصطناعي مفيد فقط حين يدخل مسار الربح. كتابة المنشورات لا تكفي. تحتاج شركات الحجر المتكلس إلى وكلاء داخل مسارات الاستفسار والتسعير والتخصيص والخدمة.",
    },
    {
      type: "p",
      text: "ولجعل الأدوات اللاحقة مفيدة، يُطلب من كل شركة تجهيز حزمة تشغيل مدمجة:",
    },
    {
      type: "ul",
      items: [
        "تعريف الشركة بجملة واحدة",
        "قائمة المنتجات والخدمات الأساسية",
        "ملف المشتري المستهدف",
        "طلبات العملاء النموذجية",
        "نقاط التميّز والبيع الرئيسية",
        "أسئلة المشترين المتكررة",
        "دليل المستندات والأصول لأدوات الوكيل",
      ],
    },
    {
      type: "p",
      text: "ستواصل ZYL السلسلة كمسار عملي لمصنّعي الحجر المتكلس الذين يريدون تحسنًا تصديريًا قابلًا للقياس—لا ندوة ذكاء اصطناعي مجردة أخرى. ويمكن للمشترين والشركاء الدوليين الباحثين عن مورّد حجر متكلس قادر رقميًا في فوشان متابعة أخبار ZYL وكتالوج المنتجات لمزيد من تقدم المصنع والتجارة.",
    },
  ],
};

function materializeBlocks(blocks, mediaIds) {
  return blocks.map((b) => {
    if (b.type === "image") {
      const id = mediaIds[b.mediaIndex];
      if (!id) throw new Error(`Missing media for index ${b.mediaIndex}`);
      return { type: "image", mediaId: id };
    }
    return b;
  });
}

function assertNoChinese(label, value) {
  const text =
    typeof value === "string"
      ? value
      : JSON.stringify(value);
  if (/[\u3400-\u9fff]/.test(text)) {
    throw new Error(`${label} contains Chinese characters — blocked for non-zh locales`);
  }
}

async function findExistingBySlug(payload, slug) {
  const r = await payload.find({
    collection: "news",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    locale: "en",
    draft: true,
    overrideAccess: true,
  });
  return r.docs[0] || null;
}

async function uploadImage(payload, absPath, alt, index) {
  const buf = await readFile(absPath);
  const filename = `news-${SLUG}-${String(index + 1).padStart(2, "0")}.jpg`;
  const created = await payload.create({
    collection: "media",
    data: {
      alt,
      category: "other",
    },
    file: {
      data: buf,
      mimetype: "image/jpeg",
      name: filename,
      size: buf.length,
    },
  });
  return { id: created.id, filename, url: created.url };
}

async function main() {
  console.log(`Mode: ${APPLY ? "APPLY (writes production DB)" : "DRY-RUN"}\n`);
  console.log(`slug: ${SLUG}`);
  console.log(`category: ${CATEGORY}`);
  console.log(`locales: en / es / ar  (zh intentionally empty)`);
  console.log(`images: ${IMAGES.length}`);
  console.log(`en title: ${EN.title}`);
  console.log(`es title: ${ES.title}`);
  console.log(`ar title: ${AR.title}`);

  assertNoChinese("EN", EN);
  assertNoChinese("ES", ES);
  assertNoChinese("AR", AR);

  for (const img of IMAGES) {
    const p = path.join(IMAGE_DIR, img.file);
    const buf = await readFile(p);
    console.log(`  image ${img.file}: ${(buf.length / 1024 / 1024).toFixed(2)} MB — ${img.alt.slice(0, 60)}...`);
  }

  if (!APPLY) {
    console.log("\nWould:");
    console.log("  1. Upload 5 images to media (R2, category=other)");
    console.log("  2. Create News with cover = group photo");
    console.log("  3. Write en + es + ar bodies with interleaved images");
    console.log("  4. Leave zh empty so /zh/news list hides this article");
    console.log("  5. Publish (_status=published)");
    console.log("\nRun with --apply to execute.");
    return;
  }

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });

  const existing = await findExistingBySlug(payload, SLUG);
  if (existing) {
    console.error(`\nERROR: News slug "${SLUG}" already exists (id=${existing.id}). Aborting.`);
    process.exit(1);
  }

  console.log("\n→ Uploading images...");
  const mediaIds = [];
  for (let i = 0; i < IMAGES.length; i++) {
    const img = IMAGES[i];
    const abs = path.join(IMAGE_DIR, img.file);
    const uploaded = await uploadImage(payload, abs, img.alt, i);
    mediaIds.push(uploaded.id);
    console.log(`  [${i + 1}/${IMAGES.length}] ${uploaded.filename} → ${uploaded.id}`);
  }

  const coverId = mediaIds[0];
  const enBlocks = materializeBlocks(EN.blocks, mediaIds);
  const esBlocks = materializeBlocks(ES.blocks, mediaIds);
  const arBlocks = materializeBlocks(AR.blocks, mediaIds);

  const bodyEn = buildLexicalDoc(enBlocks, { rtl: false });
  const bodyEs = buildLexicalDoc(esBlocks, { rtl: false });
  const bodyAr = buildLexicalDoc(arBlocks, { rtl: true });

  console.log("\n→ Creating published News (locale=en)...");
  const created = await payload.create({
    collection: "news",
    locale: "en",
    draft: false,
    data: {
      slug: SLUG,
      publishedAt: new Date().toISOString(),
      category: CATEGORY,
      coverImage: coverId,
      title: EN.title,
      excerpt: EN.excerpt,
      body: bodyEn,
      _status: "published",
    },
  });
  console.log(`  CREATED id=${created.id} slug=${created.slug} _status=${created._status}`);

  for (const [loc, copy, body] of [
    ["es", ES, bodyEs],
    ["ar", AR, bodyAr],
  ]) {
    await payload.update({
      collection: "news",
      id: created.id,
      locale: loc,
      draft: false,
      data: {
        title: copy.title,
        excerpt: copy.excerpt,
        body,
        _status: "published",
      },
    });
    console.log(`  + locale ${loc}`);
  }

  // Ensure global published status (status field is not locale-specific).
  await payload.update({
    collection: "news",
    id: created.id,
    locale: "en",
    draft: false,
    data: { _status: "published" },
  });

  const verify = await payload.findByID({
    collection: "news",
    id: created.id,
    locale: "en",
    depth: 0,
    draft: true,
    overrideAccess: true,
  });

  console.log("\n=== DONE ===");
  console.log(`id:     ${created.id}`);
  console.log(`slug:   ${SLUG}`);
  console.log(`status: ${verify._status}`);
  console.log(`cover:  ${coverId}`);
  console.log(`\nFrontend (after ISR revalidate):`);
  console.log(`  https://zylsinteredstone.com/en/news/${SLUG}`);
  console.log(`  https://zylsinteredstone.com/es/news/${SLUG}`);
  console.log(`  https://zylsinteredstone.com/ar/news/${SLUG}`);
  console.log(`  zh: intentionally empty — should not appear in /zh/news list`);
  console.log(`\nAdmin:`);
  console.log(`  https://zylsinteredstone.com/admin/collections/news/${created.id}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("\nFATAL:", err.message);
  if (err.stack) console.error(err.stack.split("\n").slice(0, 12).join("\n"));
  process.exit(1);
});
