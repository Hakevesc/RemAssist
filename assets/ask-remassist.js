/* Rem Assist — "Ask RemAssist" concierge.
   A keyword-matching assistant that answers the questions this site already
   answers, and hands anything it can't answer to the team by email or a booked
   consultation.

   No backend, no framework, no build step: drop the <script> on a page and it
   builds its own launcher, panel and styles. Everything a visitor reads is
   authored below in KB, so the answers stay in one editable place.

   Public API: window.remAsk.open() / .close() / .ask('pricing') */
(function () {
  'use strict';

  /* ---- Config ---------------------------------------------------------- */
  var PHONE    = '(832) 230-2194';
  var TEL      = '+18322302194';
  /* Every message the assistant hands off lands here. */
  var EMAIL    = 'support@remassistance.com';
  var CALENDLY = 'https://calendly.com/j-zemene-remassistance/new-meeting';
  var AVATAR   = 'assets/rem-loader-logo.svg';

  /* The accounts linked in the site footer. Keep the two in step — if a channel
     is added there, add it here and to the `social` entry's text. */
  var LINKEDIN  = 'https://www.linkedin.com/company/rem-assistance/';
  var INSTAGRAM = 'https://www.instagram.com/remassist';
  var YOUTUBE   = 'https://www.youtube.com/@RemAssistant';

  /* Optional POST endpoint for the "Leave a message" form. While this is empty
     the form composes the message and opens it addressed to EMAIL, so the form
     is never a dead end on a static site. */
  var LEAD_ENDPOINT = '';

  /* Every link the assistant can hand out, in one table. */
  var P = {
    home:       'Home.dc.html',
    cs:         'Customer Service Agents.dc.html',
    gtm:        'GTM Teams.dc.html',
    sdr:        'SDR as a Service.dc.html',
    extra:      'Extra Services.dc.html',
    pricing:    'Pricing.dc.html',
    privacy:    'Privacy Policy.dc.html',
    terms:      'https://remassistance.com/terms-of-service/',
    faq:        'Home.dc.html#faq',
    /* The on-page testimonials section was removed, so review links go to the
       Trustpilot profile rather than a dead anchor. */
    certs:      'Home.dc.html#certifications',
    quiz:       'Home.dc.html#fit-finder',
    trustpilot: 'https://www.trustpilot.com/review/remassistance.com',
    book:       CALENDLY
  };

  /* ---- Knowledge base ---------------------------------------------------
     Each entry: id, kw (trigger words and phrases), title, text (paragraphs; a
     line starting with a bullet renders as a list item), links, chips.

     Matching is word-boundary based after normalisation, with plural and
     single-typo tolerance — so list the root word, not every inflection.
     Multi-word phrases score higher than single words, which is how
     "lead generation" wins over the broader "sales" entries.

     Order only breaks ties: specific topics sit above the catch-alls. */
  var KB = [

  /* ---------- conversational ---------- */
  { id: 'greeting',
    kw: ['hi', 'hello', 'hey', 'hiya', 'yo', 'howdy', 'greetings', 'good morning', 'good afternoon', 'good evening', 'good day', 'hi there', 'anyone there', 'how are you', 'hope you are well'],
    /* hero: rendered as a full-width welcome card — the one place the widget
       leads with a headline, so visitors understand they can type freely
       rather than hunt for the right button. */
    hero: true,
    title: 'Ask anything, in your own words',
    text: ['Teams, pricing, onboarding, security — answered instantly. Or tap a topic below.'],
    chips: [['Your services', 'services'], ['Pricing', 'pricing'], ['How it works', 'how_it_works'], ['Free trial', 'trial']] },

  { id: 'menu',
    kw: ['menu', 'options', 'topics', 'what can you do', 'what can you answer', 'what can i ask', 'help me', 'commands'],
    title: 'Here is what I can cover',
    text: ['• Our four service lines — customer service, GTM pods, SDRs, extra services',
           '• Pricing, tiers, trials and contract terms',
           '• Onboarding, training, reporting, and the tools we work in',
           '• Where our agents are based and how we handle your data',
           '• How to reach us, and where to follow us',
           'Anything I miss, I will pass straight to the team.'],
    chips: [['Your services', 'services'], ['Pricing', 'pricing'], ['Security', 'security'], ['Book a consultation', 'book']] },

  { id: 'thanks',
    kw: ['thanks', 'thank you', 'thankyou', 'appreciate it', 'cheers', 'thx', 'much appreciated', 'awesome', 'perfect', 'brilliant'],
    text: ['Happy to help. If you want the specifics for your own setup, the consultation is free and there is a pilot period before you commit to anything.'],
    links: [['Book a consultation', P.book], ['See pricing', P.pricing]],
    chips: [['Free trial', 'trial'], ['How it works', 'how_it_works']] },

  { id: 'bye',
    /* Sign-offs must out-score topic words they happen to contain: "good
       night" was landing on the coverage answer because `hours` owns the
       single word "night". Multi-word phrases score above single tokens, so
       listing the whole farewell here settles it. */
    kw: ['bye', 'goodbye', 'good night', 'goodnight', 'nite', 'see you', 'see ya', 'talk to you later', 'talk later', 'catch you later', 'take care', 'have a good day', 'have a great day', 'have a good night', 'have a good one', 'that is all', 'thats all', 'nothing else', 'i am done', 'im done', 'no thanks'],
    text: ['Thanks for stopping by. We are reachable 24/7 on ' + PHONE + ' or ' + EMAIL + ' whenever you are ready.'],
    links: [['Book a consultation', P.book]],
    chips: [['Contact details', 'contact']] },

  { id: 'human',
    kw: ['human', 'real person', 'speak to someone', 'talk to someone', 'talk to a person', 'representative', 'sales rep', 'live agent', 'operator', 'are you a bot', 'you are a bot', 'are you human', 'are you real', 'what are you', 'are you a person', 'robot', 'someone to call me'],
    title: 'Straight through to a person',
    text: ['I am an automated assistant, so let me hand you over — the team covers sales and support 24/7.',
           '• Phone — ' + PHONE,
           '• Email — ' + EMAIL,
           '• Or book a free consultation at a time that suits you'],
    links: [['Book a consultation', P.book], ['Call ' + PHONE, 'tel:' + TEL], ['Email us', 'mailto:' + EMAIL]],
    chips: [['Leave a message', '__form'], ['Contact details', 'contact']] },

  /* ---------- service lines ---------- */
  { id: 'services',
    /* No generic "help"/"help with" here: "can you help with customer support"
       would score higher on this entry than on the support one and answer the
       wrong question. Bare "help" is left to `menu` and the unknown handler. */
    kw: ['service', 'services', 'what do you do', 'what do you offer', 'offering', 'offerings', 'solutions', 'products', 'outsourcing', 'outsource', 'bpo', 'what you do'],
    title: 'Four ways teams use Rem Assist',
    text: ['• Customer Service Agents — voice, live chat and email coverage inside your own helpdesk',
           '• GTM Teams — a 2–6 seat go-to-market pod: lead, SDRs, marketing VA, RevOps',
           '• SDR as a Service — list building, multi-channel sequences and booked meetings',
           '• Extra Services — IT helpdesk, AI, marketing, research, custom software and more',
           'Every seat is a dedicated remote hire trained on your stack — never a shared pool.'],
    links: [['Customer Service Agents', P.cs], ['GTM Teams', P.gtm], ['SDR as a Service', P.sdr], ['Extra Services', P.extra]],
    chips: [['Customer service', 'customer_service'], ['GTM teams', 'gtm'], ['SDR service', 'sdr'], ['Pricing', 'pricing']] },

  { id: 'customer_service',
    kw: ['customer service', 'customer support', 'customer care', 'support agent', 'support team', 'service agent', 'cs agent', 'helpdesk agent', 'call center', 'call centre', 'contact center', 'contact centre', 'csat', 'customer experience', 'front line', 'after sales'],
    title: 'Virtual Customer Service Agents',
    text: ['Dedicated agents answering your customers by voice, chat and email — working inside your helpdesk, trained on your product, and QA-scored on every interaction.',
           '• Under 60 seconds average first response on live chat',
           '• 24/7 coverage, any timezone',
           '• 95%+ CSAT target per agent, 100% of interactions QA-reviewed',
           'Agents flex across channels during quiet hours, so you never pay for idle seats.'],
    links: [['Learn more', P.cs], ['See pricing', P.pricing], ['Book a consultation', P.book]],
    chips: [['Voice support', 'voice'], ['Live chat', 'live_chat'], ['Email & ticketing', 'email_support'], ['Pricing', 'pricing']] },

  { id: 'voice',
    kw: ['voice support', 'phone support', 'inbound call', 'answering service', 'call answering', 'telephone', 'overflow', 'after hours', 'take calls', 'answer calls', 'voice channel', 'ivr'],
    title: 'Voice support',
    text: ['Inbound lines answered in your name, with call notes logged straight into your CRM. Overflow and after-hours options are included, so peaks and evenings never go unanswered.'],
    links: [['View the service', P.cs], ['Book a consultation', P.book]],
    chips: [['Live chat', 'live_chat'], ['24/7 coverage', 'hours'], ['Pricing', 'pricing']] },

  { id: 'live_chat',
    kw: ['live chat', 'web chat', 'chat support', 'chat agent', 'chatbot', 'chat bot', 'messaging support', 'social dm', 'instant chat'],
    title: 'Live chat and chatbot handoff',
    text: ['Agents pick up where your chatbot leaves off — human escalation paths tuned so customers never loop. Average first response on chat is under 60 seconds.'],
    links: [['View the service', P.cs], ['See pricing', P.pricing]],
    chips: [['Voice support', 'voice'], ['Email & ticketing', 'email_support'], ['Book a consultation', 'book']] },

  { id: 'email_support',
    kw: ['email support', 'ticketing', 'ticket', 'tickets', 'queue', 'triage', 'zendesk', 'intercom', 'freshdesk', 'inbox management', 'sla', 'escalation'],
    title: 'Email and ticketing',
    text: ['Full queue ownership in Zendesk, Intercom, GoHighLevel — or whatever you run. Triage, resolution, tagging and escalation SOPs sit with the agent, not with your managers.'],
    links: [['View the service', P.cs], ['Book a consultation', P.book]],
    chips: [['Tools you use', 'tools'], ['Quality and QA', 'quality'], ['Pricing', 'pricing']] },

  { id: 'gtm',
    kw: ['gtm', 'go to market', 'go-to-market', 'gtm team', 'gtm pod', 'pod', 'marketing team', 'revops', 'rev ops', 'revenue operations', 'crm admin', 'marketing ops', 'growth team'],
    title: 'GTM Teams — a pod hired as one unit',
    text: ['Skip six hiring cycles. We assemble outbound, marketing ops and CRM administration into a single team that runs your motion end to end — one contract, one report, one weekly standup.',
           '• Seat 1 — GTM Lead: owns the plan and your weekly report',
           '• Seats 2–3 — SDRs: list building, sequencing, calls, booking',
           '• Seat 4 — Marketing VA: content, social, SEO support, campaigns',
           '• Seat 5 — RevOps / CRM Admin: pipelines, automations, attribution in GHL or HubSpot',
           'Pods run 2–6 seats depending on your motion.'],
    links: [['Learn more', P.gtm], ['See pricing', P.pricing], ['Book a consultation', P.book]],
    chips: [['SDR service', 'sdr'], ['Tools you use', 'tools'], ['Reporting', 'reporting'], ['Pricing', 'pricing']] },

  { id: 'sdr',
    kw: ['sdr', 'sdrs', 'sdr as a service', 'sales development', 'outbound', 'appointment setting', 'appointment setter', 'cold call', 'cold calling', 'cold email', 'prospecting', 'book meetings', 'booked meetings', 'sequences', 'cadence', 'bdr', 'pipeline'],
    title: 'SDR as a Service',
    text: ['Niche-trained SDRs who build lists, run multi-channel sequences and book qualified meetings — a full outbound engine without the hiring cycle.',
           '• List building — ICP-matched accounts from LinkedIn Sales Navigator, verified with RevenueBase',
           '• Sequencing — email, phone and LinkedIn cadences in GoHighLevel or HubSpot',
           '• Qualification and booking — replies worked to a meeting on your AE’s calendar',
           '• Handoff and hygiene — clean CRM records, call notes, no-show rescue sequences',
           'First sequences go live about two weeks from kickoff, and we report meetings held, not meetings sent.'],
    links: [['Learn more', P.sdr], ['See pricing', P.pricing], ['Book a consultation', P.book]],
    chips: [['Lead data', 'leadgen'], ['GTM teams', 'gtm'], ['Tools you use', 'tools'], ['Pricing', 'pricing']] },

  { id: 'extra_services',
    kw: ['extra service', 'extra services', 'other service', 'other services', 'additional service', 'more services', 'what else', 'a la carte', 'add on', 'addon'],
    title: 'Extra Services — the rest of the bench',
    text: ['The same tech-adept VAs cover the operational work that keeps a company running. Mix any of these into an existing team:',
           '• IT Help Desk & Managed Services',
           '• Virtual Sales Teams, Lead Generation & Data',
           '• Marketing Support, Content & Brand Management',
           '• AI Implementation and AI Automations',
           '• Research & Analysis, and Custom Software',
           'One VA can cover several of these on a single seat — that is rather the point.'],
    links: [['View all extra services', P.extra], ['See pricing', P.pricing]],
    chips: [['IT helpdesk', 'it_helpdesk'], ['AI automations', 'ai_automation'], ['Marketing', 'marketing'], ['Custom software', 'custom_software']] },

  { id: 'back_office',
    /* "data cleaning" and "list cleaning" are real VA work — they must land
       here, not in the out-of-scope cleaning answer. */
    kw: ['back office', 'admin support', 'administrative', 'data entry', 'data cleaning', 'data cleansing', 'list cleaning', 'bookkeeping', 'bookkeeper', 'accounting', 'order processing', 'account admin', 'ap ar', 'operations associate', 'paperwork', 'quickbooks'],
    title: 'Virtual Back Office Team',
    text: ['Product experts, software experts, account admins, email and chat admins, bookkeepers, data-entry and order-processing clerks — the seats that keep operations running behind the front line.',
           'Coverage can run 24/7, inside any helpdesk or ERP you already use, with QA on every ticket.'],
    links: [['See the full bench', P.extra], ['See pricing', P.pricing], ['Book a consultation', P.book]],
    chips: [['Virtual assistants', 'virtual_assistant'], ['Tools you use', 'tools'], ['Pricing', 'pricing']] },

  { id: 'virtual_assistant',
    kw: ['virtual assistant', 'virtual assistance', 'va', 'vas', 'assistant', 'executive assistant', 'personal assistant', 'remote assistant', 'remote staff', 'remote hire', 'offshore staff', 'dedicated assistant'],
    title: 'Virtual assistants, trained for the tools you run',
    text: ['Every Rem Assist VA clears a core program before placement and picks up whatever software you use — CRM, helpdesk, billing, scheduling, or the tool you built in-house.',
           'One seat can cover several jobs at once: inbox and calendar, order processing, CRM hygiene, reporting, research, or first-line customer contact.',
           'Pro seats start at $8/hour. Expert seats — more years on the job, a harder assessment path, the least supervision — start at $11/hour.'],
    links: [['Browse what a VA can cover', P.extra], ['See pricing', P.pricing], ['Book a consultation', P.book]],
    chips: [['Pro vs Expert', 'tiers'], ['Back office work', 'back_office'], ['How it works', 'how_it_works'], ['Free trial', 'trial']] },

  /* ---------- extra services, itemised ---------- */
  { id: 'it_helpdesk',
    kw: ['it help desk', 'it helpdesk', 'helpdesk', 'help desk', 'it support', 'managed service', 'sysadmin', 'system admin', 'network support', 'tech support', 'infrastructure', 'devops', 'it team'],
    title: 'IT Help Desk & Managed Services',
    text: ['Comprehensive help desk and managed services designed to keep your digital backbone resilient — first-line triage through to ongoing infrastructure management, under ISO 27001-aligned handling.'],
    links: [['Read more', P.extra], ['Book a consultation', P.book]],
    chips: [['Security', 'security'], ['Pricing', 'pricing']] },

  { id: 'virtual_sales',
    kw: ['virtual sales', 'sales team', 'sales rep', 'salesperson', 'closer', 'account executive', 'full cycle sales', 'inside sales', 'close deals'],
    title: 'Virtual Sales Teams',
    text: ['Full-cycle remote sales reps — beyond SDR work, through close — built to match your culture. Pair them with SDRs if you want the top of the funnel fed as well.'],
    links: [['Read more', P.extra], ['SDR as a Service', P.sdr], ['Book a consultation', P.book]],
    chips: [['SDR service', 'sdr'], ['Pricing', 'pricing'], ['Free trial', 'trial']] },

  { id: 'marketing',
    kw: ['marketing', 'seo', 'social media', 'content marketing', 'eddm', 'print marketing', 'campaign', 'email marketing', 'advertising', 'ppc', 'newsletter', 'funnel'],
    title: 'Marketing Support',
    text: ['Strategic marketing services including SEO, social media, EDDM, print marketing and more — plus campaign assembly, lifecycle email and funnel builds inside GoHighLevel or HubSpot.',
           'On a GTM pod this is the Marketing VA seat; standalone it runs as its own seat or per project.'],
    links: [['Read more', P.extra], ['GTM Teams', P.gtm], ['See pricing', P.pricing]],
    chips: [['GTM teams', 'gtm'], ['Content and brand', 'content_brand'], ['Pricing', 'pricing']] },

  { id: 'ai_implementation',
    kw: ['ai implementation', 'ai integration', 'ai consulting', 'ai strategy', 'ai adoption', 'implement ai', 'artificial intelligence', 'ai roadmap', 'llm', 'chatgpt'],
    title: 'AI Implementation',
    text: ['Implementation agents guide you from business formation to AI-integrated operations, with ongoing recommendations as the AI landscape changes — so the stack you adopt this quarter still makes sense next year.'],
    links: [['Read more', P.extra], ['Book a consultation', P.book]],
    chips: [['AI automations', 'ai_automation'], ['Custom software', 'custom_software'], ['Pricing', 'pricing']] },

  { id: 'ai_automation',
    kw: ['ai automation', 'automation', 'automate', 'workflow automation', 'zapier', 'make com', 'n8n', 'rpa', 'auto dialer', 'ai agent', 'ai receptionist'],
    title: 'AI Automations',
    text: ['AI plus human assistance for seamless automation of administrative duties — cold calling, billing, CRM, data entry and much more. We build in Zapier, Make.com and n8n, and keep a human on the exceptions so nothing fails silently.'],
    links: [['Read more', P.extra], ['Book a consultation', P.book]],
    chips: [['AI implementation', 'ai_implementation'], ['Tools you use', 'tools'], ['Pricing', 'pricing']] },

  { id: 'leadgen',
    kw: ['lead generation', 'lead gen', 'leadgen', 'leads', 'list building', 'data scraping', 'scraping', 'prospect data', 'contact data', 'revenuebase', 'apollo', 'listkit', 'enrichment', 'icp'],
    title: 'Lead Generation & Data',
    text: ['AI data scraping plus lead gen and management tooling keeps your pipeline sourced and clean. Accounts come from LinkedIn Sales Navigator and Apollo, then get verified with RevenueBase — 100% verified contact data before a single touch goes out.'],
    links: [['Read more', P.extra], ['SDR as a Service', P.sdr], ['Book a consultation', P.book]],
    chips: [['SDR service', 'sdr'], ['Tools you use', 'tools'], ['Pricing', 'pricing']] },

  { id: 'research',
    kw: ['research', 'analysis', 'market research', 'competitor analysis', 'data analysis', 'analyst', 'insights', 'survey'],
    title: 'Research & Analysis',
    text: ['Extensive research and analysis from our agents to enhance your product or service — market and competitor sweeps, pricing studies, and the recurring data pulls nobody on your team has time for.'],
    links: [['Read more', P.extra], ['Book a consultation', P.book]],
    chips: [['Lead data', 'leadgen'], ['Pricing', 'pricing']] },

  { id: 'content_brand',
    kw: ['content creation', 'copywriting', 'copywriter', 'brand management', 'branding', 'blog', 'social content', 'reputation management', 'video editing', 'graphic design', 'design support'],
    title: 'Content & Brand Management',
    text: ['Create and manage your online content across platforms, and build an identity that differentiates your company — including reputation and review management on the channels your buyers actually check.'],
    links: [['Read more', P.extra], ['Marketing support', P.extra], ['Book a consultation', P.book]],
    chips: [['Marketing', 'marketing'], ['Pricing', 'pricing']] },

  { id: 'custom_software',
    kw: ['custom software', 'software development', 'app development', 'developer', 'developers', 'build an app', 'website', 'web development', 'api', 'integration', 'crm build', 'booking app', 'document signing', 'proprietary software'],
    title: 'Custom Software',
    text: ['We create and customize software that fits your specialty and industry — CRM, booking apps, AI analytics, sales funnels, email marketing, call tracking, document signing, courses and products, reputation management, and more.',
           'We integrate with the systems you already run, and none of it is mandatory: if you prefer your own stack, we work in yours.'],
    links: [['Read more', P.extra], ['Book a consultation', P.book]],
    chips: [['Tools you use', 'tools'], ['AI implementation', 'ai_implementation'], ['Pricing', 'pricing']] },

  /* ---------- commercials ---------- */
  { id: 'pricing',
    kw: ['price', 'prices', 'pricing', 'cost', 'costs', 'rate', 'rates', 'how much', 'quote', 'budget', 'fee', 'fees', 'hourly', 'per hour', 'expensive', 'cheap', 'affordable', 'package', 'plan', 'plans'],
    title: 'Pricing, in short',
    text: ['Agents start at $8 an hour. Everything past that is customized — we rate-match reputable BPOs, price per company, and align payment structures with your revenue cycles.',
           '• Customer Service Agents — from $8 per agent per hour',
           '• SDR as a Service — from $8 per SDR per hour',
           '• GTM Team — custom, per pod of 2–6 seats',
           '• Extra Services — custom, per seat or per project',
           'Expert-tier seats start at $11/hour. Final terms stay negotiable through the consultation.'],
    links: [['Compare all plans', P.pricing], ['Book a consultation', P.book]],
    chips: [['Pro vs Expert', 'tiers'], ['Free trial', 'trial'], ['Contract terms', 'contract'], ['Billing', 'billing']] },

  { id: 'tiers',
    kw: ['pro vs expert', 'tier', 'tiers', 'seniority', 'expert agent', 'pro agent', 'experience level', 'junior', 'senior', 'level of experience', 'skill level', 'quality of agents'],
    title: 'Two tiers, one bench',
    text: ['• Pro — from $8/hr. Fully trained and fit for work from day one. Clears our core program and picks up any software you run.',
           '• Expert — from $11/hr. More years on the job and a far more rigorous assessment path. Arrives fluent in your motion and needs the least direction.',
           'You can mix tiers inside one pod. An Expert lead over Pro seats is the most common shape, and the cheapest way to buy senior judgment.',
           'Either tier operates under ISO 9001 quality management and ISO 27001 information security.'],
    links: [['See pricing', P.pricing], ['Book a consultation', P.book]],
    chips: [['Pricing', 'pricing'], ['Training', 'training'], ['Quality and QA', 'quality']] },

  { id: 'trial',
    kw: ['free trial', 'trial', 'pilot', 'pilot program', 'try before', 'test it', 'risk free', 'proof of concept', 'poc', 'sample', 'demo period', 'trial period'],
    title: 'Pilot program, not a blind commitment',
    text: ['We do not run traditional free trials — the training and security setup for your processes is too involved. Instead there is a 30–60-day Pilot Program: a dedicated team at smaller scale, so you can measure our SLAs and quality firsthand before a full rollout.',
           'The consultation itself is always free, and seasonal discounted pricing can be applied to the pilot or your initial contract phase.'],
    links: [['See pricing', P.pricing], ['Book a consultation', P.book]],
    chips: [['How it works', 'how_it_works'], ['Contract terms', 'contract'], ['Pricing', 'pricing']] },

  { id: 'contract',
    kw: ['contract', 'commitment', 'cancel', 'cancellation', 'notice period', 'change plan', 'switch plan', 'scale up', 'scale down', 'add seats', 'remove seats', 'minimum term', 'lock in', 'long term'],
    title: 'Terms stay flexible',
    text: ['You can add or remove plans at any time, and scale seats up or down as demand moves — our service reps handle the transition so coverage never drops.',
           'All terms stay negotiable through the final consultation, including payment structures aligned to your revenue cycle.'],
    links: [['Read the FAQ', P.faq], ['Book a consultation', P.book]],
    chips: [['Billing', 'billing'], ['Free trial', 'trial'], ['Pricing', 'pricing']] },

  { id: 'billing',
    kw: ['invoice', 'invoicing', 'billing', 'payment', 'pay', 'payment terms', 'upfront', 'deposit', 'currency', 'monthly bill', 'how do i pay'],
    title: 'Billing and payment',
    text: ['Pricing is per hour per seat, and payment structures are aligned with your revenue cycles rather than a fixed template. There are no upfront fees on the hiring side — you only pay once you hire.',
           'The exact schedule, currency and invoicing cadence get set in the consultation.'],
    links: [['See pricing', P.pricing], ['Book a consultation', P.book]],
    chips: [['Contract terms', 'contract'], ['Free trial', 'trial']] },

  /* ---------- delivery ---------- */
  { id: 'how_it_works',
    kw: ['how it works', 'how does it work', 'process', 'onboarding', 'get started', 'getting started', 'timeline', 'how long', 'how fast', 'steps', 'next step', 'ramp', 'setup', 'start date', 'lead time'],
    title: 'From consult to coverage in four steps',
    text: ['• Day 0 — Free consultation: the services you need and your expected volume. Always free.',
           '• Day 1–2 — Team design: we scope the personnel mix, pricing and terms.',
           '• Day 3 — Pick your agents: review profiles and run quick interviews, or leave selection to us.',
           '• Day 4–14 — Monitored training and delivery: full training, hourly work logs, daily email reports.',
           'Most clients go from first call to a fully onboarded pod inside two weeks.'],
    links: [['See the full process', P.home], ['Book a consultation', P.book]],
    chips: [['Training', 'training'], ['Free trial', 'trial'], ['Reporting', 'reporting'], ['Pricing', 'pricing']] },

  { id: 'hiring_roles',
    kw: ['what roles', 'which roles', 'roles', 'position', 'positions', 'job title', 'hire', 'hiring', 'staffing', 'recruit', 'candidate', 'candidates', 'interview', 'profiles', 'choose agents', 'replace agent'],
    title: 'Roles you can fill',
    text: ['We place executive assistants, bookkeepers and AP/AR, operations associates, customer support, SDRs, data entry and reporting, and marketing assistants — among others.',
           'You review vetted candidate profiles and can interview them. If none feel like a fit, you pay nothing: we keep looking or part ways. Most roles fill within 7 to 21 days.'],
    links: [['Read the FAQ', P.faq], ['Book a consultation', P.book]],
    chips: [['How it works', 'how_it_works'], ['Pro vs Expert', 'tiers'], ['Pricing', 'pricing']] },

  { id: 'training',
    kw: ['training', 'train', 'trained', 'training process', 'how do you train', 'onboard agents', 'product training', 'sop', 'documentation', 'learning curve', 'ramp up', 'shadow'],
    title: 'Training, before the first ticket',
    text: ['Agents complete rigorous assessments before placement, then a collaborative training process on your systems — your macros, your tone-of-voice guide, your SLAs — before they touch live work.',
           'If nothing is documented yet, we build the SOP during onboarding and hand it back to you. You keep it whether or not you stay.'],
    links: [['Learn more', P.cs], ['Book a consultation', P.book]],
    chips: [['How it works', 'how_it_works'], ['Quality and QA', 'quality'], ['Tools you use', 'tools']] },

  { id: 'reporting',
    kw: ['report', 'reports', 'reporting', 'monitoring', 'work log', 'work logs', 'time tracking', 'time tracker', 'screenshot', 'productivity', 'transparency', 'daily report', 'kpi', 'dashboard', 'oversight'],
    title: 'What lands in your inbox',
    text: ['AI-assisted monitoring with hourly work logs and daily email reports on every seat. GTM pods add a weekly pipeline report and a standup with your pod lead.',
           'The time tracking client is available on request only — it is never required.'],
    links: [['See a GTM pod', P.gtm], ['Book a consultation', P.book]],
    chips: [['Quality and QA', 'quality'], ['GTM teams', 'gtm'], ['How it works', 'how_it_works']] },

  { id: 'quality',
    kw: ['quality', 'iso 9001', 'qa', 'quality assurance', 'scoring', 'performance', 'guarantee', 'accountability', 'standards', 'audit'],
    title: 'Quality is measured, not promised',
    text: ['Rem Assist holds ISO 9001:2015 for quality management. On customer service accounts, 100% of interactions are QA-reviewed against a 95%+ CSAT target; on outbound, we report meetings held rather than activity counts.',
           'KPIs are set together at the start, then reported against every week.'],
    links: [['Verify our certifications', P.certs], ['Read reviews', P.trustpilot]],
    chips: [['Security', 'security'], ['Reporting', 'reporting'], ['Reviews', 'reviews']] },

  { id: 'security',
    kw: ['security', 'iso 27001', 'data protection', 'gdpr', 'compliance', 'nda', 'confidential', 'hipaa', 'pci', 'secure', 'data safe', 'privacy of data', 'infosec', 'breach'],
    title: 'Security and certifications',
    text: ['Rem Assist maintains dual ISO certifications — ISO 9001:2015 for quality and ISO 27001:2022 for information security — with certified handling embedded in every task, on every account.',
           'That covers customer records, prospect data and any systems we are given access to. Specific NDAs, regional requirements and access controls get agreed during scoping.'],
    links: [['Verify our certifications', P.certs], ['Read our Privacy Policy', P.privacy], ['Book a consultation', P.book]],
    chips: [['Quality and QA', 'quality'], ['Where agents are based', 'locations'], ['Privacy policy', 'privacy']] },

  { id: 'tools',
    kw: ['tools', 'software', 'tech stack', 'gohighlevel', 'ghl', 'hubspot', 'salesforce', 'sales navigator', 'slack', 'zoom', 'monday', 'notion', 'trello', 'crm', 'what systems', 'our systems', 'our software', 'platform'],
    title: 'We work in your stack, not around it',
    text: ['Daily drivers include GoHighLevel, HubSpot, LinkedIn Sales Navigator, Zendesk, Intercom, Slack, Microsoft Teams, Zoom, Monday.com, QuickBooks, Zapier, Make.com, n8n, Apollo.io, ListKit, Instantly and Calendly.',
           'If you run something else, our agents adapt — no software mandates, ever. You do not have to use our proprietary tools.'],
    links: [['See the stack', P.home], ['Book a consultation', P.book]],
    chips: [['Custom software', 'custom_software'], ['Email & ticketing', 'email_support'], ['Training', 'training']] },

  { id: 'hours',
    kw: ['timezone', 'time zone', 'coverage', 'shift', 'shifts', 'night', 'weekend', 'overnight', 'business hours', 'part time', 'full time', 'hours per week', 'available 24', 'always on'],
    title: 'Coverage on your clock',
    text: ['Shifts run to your timezone, from part-time seats under 20 hours a week through to true 24/7 with a pod of three to six across timezones.',
           'Anything past 40 hours a week means more than one person — two agents can cover nights and weekends without overtime. Sales and support at Rem Assist are available 24/7.'],
    links: [['See pricing', P.pricing], ['Book a consultation', P.book]],
    chips: [['Customer service', 'customer_service'], ['Pricing', 'pricing'], ['Find your fit', 'fit_finder']] },

  { id: 'locations',
    kw: ['where are your agents', 'where are agents based', 'location', 'located', 'based', 'offshore', 'nearshore', 'ethiopia', 'addis', 'italy', 'cassino', 'country', 'onsite', 'in office', 'work from home'],
    title: 'Where our agents sit',
    text: ['Our agents are based in Addis Ababa, Ethiopia and Cassino, Italy. Remote, hybrid and in-office setups are all available.',
           'That spread is what makes genuine 24/7 rotas affordable rather than an overtime problem.'],
    links: [['Read the FAQ', P.faq], ['Book a consultation', P.book]],
    chips: [['24/7 coverage', 'hours'], ['Languages', 'languages'], ['Security', 'security']] },

  { id: 'languages',
    kw: ['language', 'languages', 'english', 'bilingual', 'multilingual', 'spanish', 'french', 'arabic', 'accent', 'native speaker'],
    title: 'Languages',
    text: ['Our agents work in English by default, across voice, chat and email. For any other language requirement, tell us the market on the call and we will confirm what we can staff before you commit to anything.'],
    links: [['Book a consultation', P.book]],
    chips: [['Leave a message', '__form'], ['Where agents are based', 'locations']] },

  /* ---------- company ---------- */
  { id: 'reviews',
    kw: ['review', 'reviews', 'testimonial', 'testimonials', 'trustpilot', 'reference', 'references', 'case study', 'case studies', 'client', 'clients', 'proof', 'rating', 'reputation'],
    title: 'What clients say',
    text: ['We are rated Excellent on Trustpilot, verified against real engagements — including a virtual sales team stood up quickly for TANO Group, and support work described as prompt, detailed and reliable.'],
    links: [['Read them on Trustpilot', P.trustpilot], ['Book a consultation', P.book]],
    chips: [['Quality and QA', 'quality'], ['Follow us', 'social'], ['Book a consultation', 'book']] },

  { id: 'industries',
    kw: ['industry', 'industries', 'sector', 'niche', 'saas', 'ecommerce', 'e-commerce', 'healthcare', 'fintech', 'real estate', 'insurance', 'legal', 'roofing', 'logistics', 'do you work with'],
    title: 'Industries we staff',
    text: ['Our generalist bench adapts to any helpdesk or product within days. For accounts that need it, we place agents from dedicated niche tracks — SaaS support, e-commerce, healthcare admin, fintech — who arrive already speaking your customers’ language.',
           'If your sector is not on that list, it is almost certainly still a fit. Ask on the call.'],
    links: [['Learn more', P.cs], ['Book a consultation', P.book]],
    chips: [['Pro vs Expert', 'tiers'], ['Reviews', 'reviews'], ['Leave a message', '__form']] },

  { id: 'about',
    kw: ['about', 'about you', 'who are you', 'company', 'rem assist', 'remassistance', 'your team', 'founder', 'ceo', 'leadership', 'history', 'what does rem mean', 'rem stand for', 'remote standard'],
    title: 'About Rem Assist',
    text: ['Rem Assist builds remote teams that match your culture. The name is the standard: Results-driven, Efficient, Matching your culture, On target, Thoroughly excellent, Every time.',
           'The company is led by Johnathan Zemene (CEO) and Minassie Sora (COO), with dedicated design, HR, IT security, process and legal leads behind every account.'],
    links: [['Meet the team', P.home], ['Read our reviews', P.trustpilot], ['Follow on LinkedIn', LINKEDIN]],
    chips: [['Your services', 'services'], ['Where agents are based', 'locations'], ['Follow us', 'social']] },

  { id: 'careers',
    kw: ['job', 'jobs', 'career', 'careers', 'apply', 'application', 'work for you', 'join your team', 'employment', 'cv', 'resume', 'vacancy', 'recruitment', 'hiring agents', 'i want to work'],
    title: 'Looking to work with us?',
    text: ['We are always assessing agents for the bench — customer service, SDR, back office, IT and marketing tracks.',
           'Send your CV to ' + EMAIL + ' with the track you are after, and the team will point you to the current openings.'],
    links: [['Email your CV', 'mailto:' + EMAIL + '?subject=Application%20-%20Rem%20Assist'], ['Follow us on LinkedIn', LINKEDIN]],
    chips: [['Leave a message', '__form'], ['About Rem Assist', 'about'], ['Follow us', 'social']] },

  { id: 'contact',
    kw: ['contact', 'contact you', 'phone number', 'your number', 'email address', 'reach you', 'get in touch', 'address', 'call you', 'support line', 'talk to sales'],
    title: 'How to reach us',
    text: ['• Phone — ' + PHONE,
           '• Email — ' + EMAIL,
           '• Book a free consultation at a time that suits you',
           '• Or find us on LinkedIn, Instagram and YouTube',
           'Support and sales are available 24/7.'],
    links: [['Call ' + PHONE, 'tel:' + TEL], ['Email us', 'mailto:' + EMAIL], ['Book a consultation', P.book]],
    chips: [['Leave a message', '__form'], ['Follow us', 'social'], ['Book a consultation', 'book']] },

  /* Asked often enough to deserve its own topic. The long phrasings below are
     deliberate: `marketing` owns the bare phrase "social media" because there
     it means the service we sell, so only an explicit question about *our*
     accounts should land here. */
  { id: 'social',
    kw: ['linkedin', 'instagram', 'insta', 'youtube', 'facebook', 'tiktok', 'twitter', 'socials', 'social profiles',
         'your social media', 'do you have social media', 'are you on social media', 'social media page',
         'social media account', 'social media accounts', 'social media profile', 'follow you', 'follow us',
         'your channel', 'your page', 'your profile', 'where can i find you'],
    title: 'Where to find us',
    text: ['• LinkedIn — company updates and hiring news',
           '• Instagram — team posts and behind the scenes',
           '• YouTube — service explainers and walkthroughs',
           'Those three are the accounts we keep active. For anything you need answered directly, phone and email are still the fastest.'],
    links: [['LinkedIn', LINKEDIN], ['Instagram', INSTAGRAM], ['YouTube', YOUTUBE]],
    chips: [['Contact details', 'contact'], ['About Rem Assist', 'about'], ['Reviews', 'reviews']] },

  { id: 'book',
    kw: ['book', 'booking', 'consultation', 'consult', 'schedule', 'appointment', 'meeting', 'demo', 'calendly', 'set up a call', 'speak to sales', 'free consultation'],
    title: 'Book a free consultation',
    text: ['Tell us the services you need and your expected volume, and we will come back with the seat mix, timeline and pricing. It is free, there is no commitment, and a pilot period comes before anything is signed.'],
    links: [['Pick a time', P.book], ['See pricing first', P.pricing]],
    chips: [['How it works', 'how_it_works'], ['Free trial', 'trial'], ['Leave a message', '__form']] },

  { id: 'fit_finder',
    kw: ['not sure', 'unsure', 'which service', 'what do i need', 'recommend', 'recommendation', 'quiz', 'fit finder', 'help me choose', 'best option', 'suggest', 'advice'],
    title: 'Not sure which shape fits?',
    text: ['Our two-minute fit finder asks five questions and returns a recommended seat mix, tier and estimated monthly cost — with the context we would normally walk you through on a call.',
           'It is an estimate, not a quote, and you leave knowing how this works whether or not you book.'],
    links: [['Try the fit finder', P.quiz], ['Book a consultation', P.book]],
    chips: [['Your services', 'services'], ['Pricing', 'pricing'], ['Leave a message', '__form']] },

  { id: 'privacy',
    kw: ['privacy', 'privacy policy', 'terms', 'terms of service', 'policy', 'tos', 'data policy', 'sms consent', 'unsubscribe', 'opt out', 'cookies', 'legal'],
    title: 'Privacy and terms',
    text: ['Our Privacy Policy covers what we collect, how it is used and how to opt out; the Terms of Service cover the commercial relationship. Messaging consent is never a condition of purchase, and you can reply STOP to unsubscribe at any time.'],
    links: [['Privacy Policy', P.privacy], ['Terms of Service', P.terms]],
    chips: [['Security', 'security'], ['Contact details', 'contact']] }

  ];

  /* Shown when nothing scores high enough, and under the greeting. */
  var DEFAULT_CHIPS = [['Your services', 'services'], ['Pricing', 'pricing'], ['How it works', 'how_it_works'], ['Book a consultation', 'book']];

  /* Trades visitors sometimes ask us to perform ourselves. Rem Assist is an
     outsourcing partner, not a field-services company — so "do you have a home
     cleaning service?" must not fall through to the generic services answer,
     which reads as a yes. These get an explicit no, followed by the work we
     really do run for companies in that trade.

     Phrases, never bare words: "cleaning" on its own would swallow "data
     cleaning", which is genuine VA work. */
  var OUTSIDE = [
    { label: 'cleaning',           kw: ['home cleaning', 'house cleaning', 'office cleaning', 'commercial cleaning', 'cleaning service', 'cleaning services', 'cleaning company', 'janitorial', 'housekeeping', 'maid service'] },
    { label: 'plumbing',           kw: ['plumbing', 'plumber'] },
    { label: 'electrical work',    kw: ['electrician', 'electrical service', 'electrical work'] },
    { label: 'HVAC',               kw: ['hvac', 'air conditioning', 'heating and cooling', 'furnace repair'] },
    { label: 'landscaping',        kw: ['landscaping', 'lawn care', 'lawn mowing', 'gardening service'] },
    { label: 'pest control',       kw: ['pest control', 'exterminator'] },
    { label: 'moving',             kw: ['moving company', 'movers', 'removals', 'relocation service'] },
    { label: 'construction',       kw: ['construction', 'handyman', 'carpentry', 'painting service', 'renovation'] },
    { label: 'catering',           kw: ['catering', 'caterer', 'food delivery', 'meal prep'] },
    { label: 'physical security',  kw: ['security guard', 'security guards', 'guard service', 'patrol service'] },
    { label: 'auto repair',        kw: ['auto repair', 'car repair', 'mechanic', 'towing', 'body shop'] },
    { label: 'salon and spa work', kw: ['salon', 'barber', 'spa service', 'massage', 'nail tech'] },
    { label: 'childcare',          kw: ['childcare', 'child care', 'babysitting', 'daycare', 'nanny'] },
    { label: 'home care',          kw: ['home care', 'elder care', 'caregiver', 'nursing home'] },
    { label: 'laundry',            kw: ['laundry service', 'dry cleaning'] },
    { label: 'courier and delivery', kw: ['courier', 'truck driver', 'delivery driver', 'rideshare', 'taxi service'] },
    { label: 'pet care',           kw: ['pet grooming', 'dog walking', 'veterinary', 'pet sitting'] },
    { label: 'tutoring',           kw: ['tutoring', 'tutor'] },
    { label: 'photography',        kw: ['photography', 'videography', 'photographer'] }
  ];

  /* ---- Matching ---------------------------------------------------------
     Deliberately boring: normalise, then score each entry by the trigger words
     it hits. Phrases outweigh single words so "lead generation" beats "leads",
     and a one-character typo on a longer word still scores — just less. */

  function norm(s) {
    return (' ' + String(s).toLowerCase().replace(/[^a-z0-9$]+/g, ' ') + ' ').replace(/\s+/g, ' ');
  }

  /* Cheap edit-distance-of-1 test: enough for "pricin"/"serivces", nothing more.
     Both the plural and the typo rule ignore short words — without the length
     floor, "to" matches the keyword "tos" and a sentence about anything at all
     lands on the terms-of-service answer. */
  function near(a, b) {
    if (a === b) return true;
    if (b.length >= 4 && (a === b + 's' || b === a + 's')) return true;
    if (b.length < 5) return false;
    if (Math.abs(a.length - b.length) > 1) return false;
    var i = 0, j = 0, edits = 0;
    while (i < a.length && j < b.length) {
      if (a.charAt(i) === b.charAt(j)) { i++; j++; continue; }
      if (++edits > 1) return false;
      if (a.length > b.length) i++;
      else if (b.length > a.length) j++;
      else { i++; j++; }
    }
    return edits + (a.length - i) + (b.length - j) <= 1;
  }

  function score(text, kws) {
    var n = norm(text), toks = n.trim().split(' ').filter(Boolean), total = 0;
    for (var i = 0; i < kws.length; i++) {
      var k = norm(kws[i]).trim();
      if (!k) continue;
      if (k.indexOf(' ') >= 0) {
        if (n.indexOf(' ' + k + ' ') >= 0) total += 4 + k.split(' ').length;
        continue;
      }
      if (n.indexOf(' ' + k + ' ') >= 0) { total += 3; continue; }
      for (var t = 0; t < toks.length; t++) {
        if (near(toks[t], k)) { total += 2; break; }
      }
    }
    return total;
  }

  var MIN_SCORE = 2;

  /* Runs ahead of match(): returns the trade label if the visitor is asking
     for work we do not perform, else null. Longest phrase wins, so
     "commercial cleaning" beats "cleaning service". */
  function outsideScope(text) {
    var n = norm(text), best = null, bestLen = 0;
    for (var i = 0; i < OUTSIDE.length; i++) {
      var kws = OUTSIDE[i].kw;
      for (var j = 0; j < kws.length; j++) {
        var k = norm(kws[j]).trim();
        if (!k || n.indexOf(' ' + k + ' ') < 0) continue;
        if (k.length > bestLen) { bestLen = k.length; best = OUTSIDE[i].label; }
      }
    }
    return best;
  }

  /* The answer that actually helps: no, we don't do that — here is what we run
     for the companies that do. Shaped like a KB entry so it renders through
     the same path as everything else. */
  function outsideEntry(label) {
    return {
      id: '__outside',
      title: 'Not something we do ourselves',
      text: ['Rem Assist does not provide ' + label + ' itself — we are an outsourcing partner, so we build and run the teams behind the companies that do.',
             'For businesses in ' + label + ', we typically cover:',
             '• Inbound calls, live chat and email — bookings, scheduling and dispatch',
             '• Quotes, invoicing, CRM hygiene and back-office admin',
             '• Outbound and lead generation to win new contracts',
             '• IT helpdesk, marketing support and custom software',
             'If that is your business, it is exactly the kind of account we take on.'],
      links: [['Customer Service Agents', P.cs], ['See the full bench', P.extra], ['Book a consultation', P.book]],
      chips: [['Pricing', 'pricing'], ['How it works', 'how_it_works'], ['Free trial', 'trial'], ['Leave a message', '__form']]
    };
  }

  /* Returns { entry, alts } — alts are runner-up topics offered as chips so a
     near-miss ("sales") still lands the visitor somewhere useful. */
  function match(text) {
    var ranked = [];
    for (var i = 0; i < KB.length; i++) {
      var s = score(text, KB[i].kw);
      if (s >= MIN_SCORE) ranked.push({ e: KB[i], s: s, i: i });
    }
    if (!ranked.length) return { entry: null, alts: [] };
    ranked.sort(function (a, b) { return b.s - a.s || a.i - b.i; });
    var alts = [];
    for (var j = 1; j < ranked.length && alts.length < 2; j++) {
      if (ranked[j].s >= Math.max(MIN_SCORE + 1, ranked[0].s * 0.5)) {
        alts.push([ranked[j].e.title || ranked[j].e.id, ranked[j].e.id]);
      }
    }
    return { entry: ranked[0].e, alts: alts };
  }

  function byId(id) {
    for (var i = 0; i < KB.length; i++) if (KB[i].id === id) return KB[i];
    return null;
  }

  /* ---- Styles ----------------------------------------------------------- */
  var NAVY = '#000543', BLUE = '#0085fe', SKY = '#34bdf0', WA = '#25d366';

  var CSS = [
    '#rem-ask,#rem-ask *{box-sizing:border-box}',
    '#rem-ask{position:fixed;right:24px;bottom:24px;z-index:90000;font-family:"Sora",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.5}',

    /* launcher */
    '#rem-ask-launch{position:relative;display:flex;align-items:center;justify-content:center;width:62px;height:62px;padding:0;border:0;border-radius:50%;cursor:pointer;background:linear-gradient(150deg,' + SKY + ' 0%,' + BLUE + ' 55%,' + NAVY + ' 100%);box-shadow:0 14px 34px -8px rgba(0,5,67,.55);opacity:0;transform:translateY(14px) scale(.9);transition:opacity .35s ease,transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .2s}',
    '#rem-ask.is-ready #rem-ask-launch{opacity:1;transform:none}',
    '#rem-ask-launch:hover{box-shadow:0 18px 40px -8px rgba(0,5,67,.6);transform:translateY(-2px)}',
    '#rem-ask-launch:focus-visible{outline:3px solid ' + SKY + ';outline-offset:3px}',
    '#rem-ask-launch span{position:absolute;inset:5px;border-radius:50%;background:#fff;display:grid;place-items:center;overflow:hidden}',
    '#rem-ask-launch img{width:66%;height:66%;object-fit:contain;display:block}',
    '#rem-ask-launch b{position:absolute;top:2px;right:2px;width:15px;height:15px;border-radius:50%;background:' + WA + ';border:2.5px solid #fff}',
    '#rem-ask-launch i{position:absolute;inset:-4px;border-radius:50%;border:2px solid ' + SKY + ';opacity:0;animation:remAskPing 2.8s ease-out infinite}',
    '@keyframes remAskPing{0%{opacity:.7;transform:scale(.92)}70%,100%{opacity:0;transform:scale(1.28)}}',
    '#rem-ask.is-open #rem-ask-launch{opacity:0;transform:scale(.7);pointer-events:none}',

    /* teaser */
    '#rem-ask-teaser{position:absolute;right:74px;bottom:8px;width:max-content;max-width:236px;padding:11px 34px 11px 14px;border-radius:14px 14px 2px 14px;background:#fff;color:' + NAVY + ';font-size:13px;font-weight:500;box-shadow:0 14px 34px -12px rgba(0,5,67,.45);border:1px solid rgba(0,5,67,.08);opacity:0;transform:translateX(8px);transition:opacity .3s ease,transform .3s ease;pointer-events:none}',
    '#rem-ask-teaser.is-shown{opacity:1;transform:none;pointer-events:auto}',
    '#rem-ask-teaser button{position:absolute;top:4px;right:4px;width:22px;height:22px;display:grid;place-items:center;border:0;background:none;color:#98a2b3;cursor:pointer;border-radius:50%;font-size:15px;line-height:1}',
    '#rem-ask-teaser button:hover{background:#f2f4f7;color:' + NAVY + '}',

    /* panel */
    '#rem-ask-panel{position:absolute;right:0;bottom:0;width:384px;max-width:calc(100vw - 32px);height:min(624px,calc(100vh - 130px));display:none;flex-direction:column;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 34px 80px -24px rgba(0,5,67,.5),0 0 0 1px rgba(0,5,67,.06);opacity:0;transform:translateY(16px) scale(.98);transform-origin:100% 100%;transition:opacity .26s ease,transform .26s cubic-bezier(.2,.8,.2,1)}',
    '#rem-ask.is-open #rem-ask-panel{display:flex}',
    '#rem-ask.is-visible #rem-ask-panel{opacity:1;transform:none}',

    /* header */
    '#rem-ask-head{position:relative;display:flex;align-items:center;gap:12px;padding:16px 14px 16px 18px;background:linear-gradient(135deg,#326dda 0%,' + NAVY + ' 78%);color:#fff;overflow:hidden;flex:none}',
    '#rem-ask-head:before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.16) 1.2px,transparent 1.3px);background-size:13px 13px;opacity:.4;pointer-events:none}',
    '#rem-ask-head>*{position:relative}',
    '#rem-ask-face{width:42px;height:42px;flex:none;border-radius:50%;background:#fff;display:grid;place-items:center;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.2)}',
    '#rem-ask-face img{width:64%;height:64%;object-fit:contain;display:block}',
    '#rem-ask-id{min-width:0;flex:1}',
    '#rem-ask-id strong{display:block;font-size:15px;font-weight:700;letter-spacing:-.01em}',
    '#rem-ask-id span{display:flex;align-items:center;gap:6px;font-size:11.5px;color:rgba(255,255,255,.78);margin-top:2px}',
    '#rem-ask-id span:before{content:"";width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 0 3px rgba(74,222,128,.22)}',
    '.rem-ask-icon{width:34px;height:34px;flex:none;display:grid;place-items:center;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;cursor:pointer;transition:background .15s,transform .15s}',
    '.rem-ask-icon:hover{background:rgba(255,255,255,.26);transform:scale(1.06)}',
    '.rem-ask-icon:focus-visible{outline:2px solid ' + SKY + ';outline-offset:2px}',

    /* log */
    '#rem-ask-log{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:18px 16px 8px;background:#f5f7fa;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin}',
    '#rem-ask-log::-webkit-scrollbar{width:8px}',
    '#rem-ask-log::-webkit-scrollbar-thumb{background:#d7dde8;border-radius:8px;border:2px solid #f5f7fa}',

    '.rem-ask-row{display:flex;gap:9px;align-items:flex-end;animation:remAskIn .28s cubic-bezier(.2,.8,.2,1) both}',
    '@keyframes remAskIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '.rem-ask-row.me{flex-direction:row-reverse}',
    '.rem-ask-av{width:28px;height:28px;flex:none;border-radius:50%;background:#fff;display:grid;place-items:center;overflow:hidden;box-shadow:0 2px 8px rgba(0,5,67,.14)}',
    '.rem-ask-av img{width:66%;height:66%;object-fit:contain;display:block}',
    '.rem-ask-bub{max-width:87%;padding:12px 14px;border-radius:16px;background:#fff;color:' + NAVY + ';box-shadow:0 2px 10px rgba(0,5,67,.07);border:1px solid rgba(0,5,67,.05);border-bottom-left-radius:5px}',
    '.me .rem-ask-bub{background:linear-gradient(140deg,#0f8ffe,#326dda);color:#fff;border:0;border-radius:16px;border-bottom-right-radius:5px;box-shadow:0 6px 16px -6px rgba(50,109,218,.6)}',
    '.rem-ask-pad{flex:none;height:0;margin-top:-12px}',

    /* welcome card — full width, no avatar, leads with a headline */
    '.rem-ask-row.hero .rem-ask-bub{max-width:100%;width:100%;padding:18px 17px;border-bottom-left-radius:16px}',
    '.rem-ask-bub .hero-t{margin:0 0 7px;font-size:20px;line-height:1.22;font-weight:700;letter-spacing:-.02em;color:' + NAVY + '}',
    '.rem-ask-bub .hero-s{margin:0;font-size:13px;line-height:1.55;color:#667180}',
    '.rem-ask-row.hero + .rem-ask-sug{padding-left:2px}',

    '.rem-ask-bub h4{margin:0 0 6px;font-size:14px;font-weight:700;color:' + NAVY + ';letter-spacing:-.01em}',
    '.rem-ask-bub p{margin:0 0 8px;font-size:13.5px}',
    '.rem-ask-bub p:last-child{margin-bottom:0}',
    '.rem-ask-bub .li{margin:0 0 6px;padding-left:15px;position:relative;font-size:13.5px}',
    '.rem-ask-bub .li:before{content:"";position:absolute;left:2px;top:8px;width:5px;height:5px;border-radius:50%;background:' + BLUE + '}',

    /* answer links */
    '.rem-ask-links{display:flex;flex-wrap:wrap;gap:7px;margin-top:11px}',
    '.rem-ask-links a{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:10px;font-size:12.5px;font-weight:600;text-decoration:none;background:#eef4ff;color:#1c56c4;border:1px solid #d9e6ff;transition:background .15s,transform .15s}',
    '.rem-ask-links a:hover{background:#e0ecff;transform:translateY(-1px);text-decoration:none;color:#1c56c4}',
    '.rem-ask-links a:first-child{background:' + BLUE + ';color:#fff;border-color:' + BLUE + '}',
    '.rem-ask-links a:first-child:hover{background:#0070d8;color:#fff}',
    '.rem-ask-links a svg{flex:none;opacity:.85}',

    /* per-answer handoff row */
    '.rem-ask-hand{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px;padding-top:10px;border-top:1px dashed rgba(0,5,67,.12)}',
    '.rem-ask-hand button,.rem-ask-hand a{display:inline-flex;align-items:center;gap:6px;padding:7px 11px;border-radius:999px;font-size:12px;font-weight:600;cursor:pointer;text-decoration:none;border:1px solid rgba(0,5,67,.12);background:#fff;color:' + NAVY + ';transition:background .15s,border-color .15s,transform .15s}',
    '.rem-ask-hand button:hover,.rem-ask-hand a:hover{transform:translateY(-1px);border-color:rgba(0,5,67,.25);text-decoration:none;color:' + NAVY + '}',
    '.rem-ask-hand .tel{border-color:#cfe0ff;color:#1c56c4}',
    '.rem-ask-hand .tel:hover{background:#eef4ff;color:#1c56c4}',

    /* chips */
    '.rem-ask-sug{display:flex;flex-wrap:wrap;gap:7px;padding:0 2px 2px 37px}',
    '.rem-ask-sug button{padding:8px 12px;border-radius:999px;border:1px solid #cfe0ff;background:#fff;color:#1c56c4;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s,transform .15s,border-color .15s}',
    '.rem-ask-sug button:hover{background:#eef4ff;transform:translateY(-1px)}',
    '.rem-ask-sug button:focus-visible{outline:2px solid ' + BLUE + ';outline-offset:2px}',

    /* typing */
    '.rem-ask-typing{display:flex;gap:4px;padding:14px}',
    '.rem-ask-typing i{width:7px;height:7px;border-radius:50%;background:#b9c3d4;animation:remAskDot 1.15s ease-in-out infinite}',
    '.rem-ask-typing i:nth-child(2){animation-delay:.16s}',
    '.rem-ask-typing i:nth-child(3){animation-delay:.32s}',
    '@keyframes remAskDot{0%,60%,100%{opacity:.35;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}',

    /* form card */
    '.rem-ask-form{width:100%;max-width:100%}',
    '.rem-ask-form label{display:block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#667180;margin:10px 0 4px}',
    '.rem-ask-form input,.rem-ask-form textarea{width:100%;padding:9px 11px;border:1px solid #dbe1ea;border-radius:10px;font-family:inherit;font-size:13px;color:' + NAVY + ';background:#fbfcfe;transition:border-color .15s,box-shadow .15s}',
    '.rem-ask-form textarea{min-height:74px;resize:vertical}',
    '.rem-ask-form input:focus,.rem-ask-form textarea:focus{outline:0;border-color:' + BLUE + ';box-shadow:0 0 0 3px rgba(0,133,254,.14)}',
    '.rem-ask-form .err{color:#b42318;font-size:11.5px;margin-top:6px;display:none}',
    '.rem-ask-form .err.on{display:block}',
    '.rem-ask-form .fine{margin-top:10px;font-size:10.5px;line-height:1.5;color:#8892a4}',
    '.rem-ask-form .fine a{color:#1c56c4;text-decoration:underline}',
    '.rem-ask-form .row{display:flex;gap:8px;margin-top:12px}',
    '.rem-ask-send{flex:1;padding:10px 14px;border:0;border-radius:10px;background:' + BLUE + ';color:#fff;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s}',
    '.rem-ask-send:hover{background:#0070d8}',
    '.rem-ask-cancel{padding:10px 14px;border:1px solid #dbe1ea;border-radius:10px;background:#fff;color:#667180;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer}',
    '.rem-ask-cancel:hover{background:#f5f7fa}',

    /* composer */
    '#rem-ask-bar{flex:none;display:flex;align-items:flex-end;gap:8px;padding:12px 14px 14px;background:#fff;border-top:1px solid rgba(0,5,67,.07)}',
    /* 48px, not 46: border-box height must clear padding + one line + borders,
       or an empty textarea overflows by 2px and shows a scrollbar. */
    '#rem-ask-input{flex:1;min-width:0;height:48px;max-height:120px;padding:13px 13px;border:1px solid #dbe1ea;border-radius:14px;font-family:inherit;font-size:13.5px;line-height:1.45;color:' + NAVY + ';background:#f7f9fc;resize:none;overflow-y:auto;scrollbar-width:thin;transition:border-color .15s,box-shadow .15s}',
    /* Windows renders stepper arrows on a scrolling textarea; hide them. */
    '#rem-ask-input::-webkit-scrollbar{width:6px}',
    '#rem-ask-input::-webkit-scrollbar-button{display:none}',
    '#rem-ask-input::-webkit-scrollbar-thumb{background:#d7dde8;border-radius:6px}',
    '#rem-ask-input:focus{outline:0;border-color:' + BLUE + ';background:#fff;box-shadow:0 0 0 3px rgba(0,133,254,.13)}',
    '#rem-ask-submit{width:42px;height:42px;flex:none;display:grid;place-items:center;border:0;border-radius:50%;background:' + BLUE + ';color:#fff;cursor:pointer;transition:background .15s,transform .15s}',
    '#rem-ask-submit:hover{background:#0070d8;transform:scale(1.05)}',
    '#rem-ask-submit:disabled{background:#c8d2e0;cursor:default;transform:none}',
    /* full-screen on phones */
    '@media (max-width:520px){',
    '#rem-ask{right:16px;bottom:16px}',
    '#rem-ask-panel{position:fixed;inset:0;width:100vw;max-width:none;height:100dvh;border-radius:0}',
    '#rem-ask-teaser{max-width:190px}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '#rem-ask *,#rem-ask *:before,#rem-ask *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}',
    '}'
  ].join('');

  /* ---- Small DOM helpers ------------------------------------------------ */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function icon(path, size) {
    var s = size || 17;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', s); svg.setAttribute('height', s);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2'); svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', path);
    svg.appendChild(p);
    return svg;
  }

  var I_PHONE = 'M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z';
  var I_CLOSE = 'M6 6l12 12M18 6L6 18';
  var I_SEND  = 'M4 12l16-8-6 8 6 8-16-8Z';
  var I_CHAT  = 'M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-3.9-.9L3 20.5l1.6-4.7A8.3 8.3 0 0 1 3.6 11.5a8.4 8.4 0 0 1 8.9-8.4 8.4 8.4 0 0 1 8.5 8.4Z';
  var I_CAL   = 'M8 2v4m8-4v4M3.5 9.5h17M5 5h14a1.5 1.5 0 0 1 1.5 1.5V19A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V6.5A1.5 1.5 0 0 1 5 5Z';
  var I_MAIL  = 'M3.5 6.5h17v11h-17v-11Zm0 .5 8.5 6 8.5-6';
  var I_ARROW = 'M5 12h14m-6-6 6 6-6 6';
  var I_MIN   = 'M6 12h12';

  /* A mailto addressed to the support inbox, with the subject and body filled
     in so the visitor never has to restate their question. */
  function mailLink(subject, body) {
    return 'mailto:' + EMAIL +
           '?subject=' + encodeURIComponent(subject) +
           (body ? '&body=' + encodeURIComponent(body) : '');
  }

  function isExternal(href) {
    return /^(https?:|tel:|mailto:)/i.test(href);
  }

  /* ---- State ------------------------------------------------------------
     The transcript lives in sessionStorage so a visitor who follows a "Learn
     more" link to another page comes back to the same conversation. Entries
     are replayed by id rather than by stored markup, so edits to KB show up
     immediately in an in-flight session. */
  var KEY = 'remAsk.v1';
  var state = { open: false, log: [], teased: false };

  function load() {
    try {
      var raw = sessionStorage.getItem(KEY);
      if (raw) {
        var v = JSON.parse(raw);
        if (v && Object.prototype.toString.call(v.log) === '[object Array]') state = v;
      }
    } catch (e) { /* private mode, or corrupt value — start fresh */ }
  }

  function save() {
    try {
      if (state.log.length > 40) state.log = state.log.slice(-40);
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { /* nothing worth breaking the widget over */ }
  }

  /* ---- Build ------------------------------------------------------------ */
  var root, panel, logEl, inputEl, sendBtn, teaser, spacer;
  var anchorRow = null, lastFocus = null, visTimer = null;

  function build() {
    var style = el('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    root = el('div');
    root.id = 'rem-ask';

    /* launcher */
    var launch = el('button');
    launch.id = 'rem-ask-launch';
    launch.type = 'button';
    launch.setAttribute('aria-label', 'Ask RemAssist — open chat');
    var ring = el('i'), face = el('span'), dot = el('b');
    var lImg = el('img'); lImg.src = AVATAR; lImg.alt = '';
    face.appendChild(lImg);
    launch.appendChild(ring); launch.appendChild(face); launch.appendChild(dot);
    launch.addEventListener('click', open);

    /* teaser */
    teaser = el('div');
    teaser.id = 'rem-ask-teaser';
    teaser.appendChild(document.createTextNode('Questions about our teams or pricing? Ask me.'));
    var tClose = el('button', null, '×');
    tClose.type = 'button';
    tClose.setAttribute('aria-label', 'Dismiss');
    tClose.addEventListener('click', function (e) { e.stopPropagation(); hideTeaser(); });
    teaser.appendChild(tClose);
    teaser.addEventListener('click', function () { hideTeaser(); open(); });

    /* panel */
    panel = el('section');
    panel.id = 'rem-ask-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', 'Ask RemAssist');

    var head = el('div'); head.id = 'rem-ask-head';
    var hFace = el('div'); hFace.id = 'rem-ask-face';
    var hImg = el('img'); hImg.src = AVATAR; hImg.alt = 'Rem Assist';
    hFace.appendChild(hImg);
    var hId = el('div'); hId.id = 'rem-ask-id';
    hId.appendChild(el('strong', null, 'Ask RemAssist'));
    /* Short enough to stay on one line at 375px — the long version wrapped. */
    hId.appendChild(el('span', null, 'Online · Replies instantly'));

    var mailBtn = el('a', 'rem-ask-icon');
    mailBtn.href = mailLink('Website enquiry', '');
    mailBtn.title = 'Email ' + EMAIL;
    mailBtn.setAttribute('aria-label', 'Email the team at ' + EMAIL);
    mailBtn.appendChild(icon(I_MAIL, 16));

    var closeBtn = el('button', 'rem-ask-icon');
    closeBtn.type = 'button';
    closeBtn.title = 'Minimise';
    closeBtn.setAttribute('aria-label', 'Close chat');
    closeBtn.appendChild(icon(I_MIN, 17));
    closeBtn.addEventListener('click', close);

    head.appendChild(hFace); head.appendChild(hId);
    head.appendChild(mailBtn); head.appendChild(closeBtn);

    logEl = el('div'); logEl.id = 'rem-ask-log';
    logEl.setAttribute('role', 'log');
    logEl.setAttribute('aria-live', 'polite');
    logEl.setAttribute('aria-relevant', 'additions');

    /* Tail spacer. Kept as the last child of the log so a short answer can
       still be scrolled far enough for its question to reach the top — see
       anchorNow(). Height is recomputed on every anchor. */
    spacer = el('div', 'rem-ask-pad');
    logEl.appendChild(spacer);

    var bar = el('form'); bar.id = 'rem-ask-bar';
    inputEl = el('textarea'); inputEl.id = 'rem-ask-input';
    inputEl.rows = 1;
    inputEl.placeholder = 'Ask your question…';
    inputEl.setAttribute('aria-label', 'Type your question');
    sendBtn = el('button'); sendBtn.id = 'rem-ask-submit';
    sendBtn.type = 'submit';
    sendBtn.setAttribute('aria-label', 'Send');
    sendBtn.appendChild(icon(I_SEND, 17));
    bar.appendChild(inputEl); bar.appendChild(sendBtn);

    panel.appendChild(head); panel.appendChild(logEl); panel.appendChild(bar);

    root.appendChild(teaser); root.appendChild(launch); root.appendChild(panel);
    document.body.appendChild(root);

    bar.addEventListener('submit', function (e) {
      e.preventDefault();
      submitInput();
    });
    inputEl.addEventListener('input', autosize);
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitInput(); }
    });
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
    });
  }

  function autosize() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.max(48, Math.min(inputEl.scrollHeight + 2, 120)) + 'px';
  }

  /* ---- Rendering -------------------------------------------------------- */
  /* Once now and once after layout: rAF alone never fires while the tab is
     hidden, which would leave a restored transcript scrolled to the top. */
  function scrollDown() {
    logEl.scrollTop = logEl.scrollHeight;
    requestAnimationFrame(function () { logEl.scrollTop = logEl.scrollHeight; });
  }

  /* Parks the visitor's own question at the top of the view so the answer
     reads from its first line down. Jumping to the bottom instead — the naive
     behaviour — drops people into the tail of a long answer with no idea what
     they are looking at.

     Short answers cannot scroll that far on their own, so the tail spacer is
     grown to cover the shortfall, then collapsed again on the next anchor. */
  function anchorNow() {
    if (!anchorRow || anchorRow.parentNode !== logEl) { scrollDown(); return; }
    if (spacer.parentNode === logEl) logEl.appendChild(spacer); /* keep it last */
    spacer.style.height = '0px';

    var top = anchorRow.getBoundingClientRect().top -
              logEl.getBoundingClientRect().top + logEl.scrollTop;
    var shortfall = logEl.clientHeight - (logEl.scrollHeight - top) - GAP;
    if (shortfall > 0) spacer.style.height = Math.round(shortfall) + 'px';

    logEl.scrollTop = Math.max(0, top - GAP);
    requestAnimationFrame(function () {
      if (anchorRow && anchorRow.parentNode === logEl) {
        logEl.scrollTop = Math.max(0, anchorRow.getBoundingClientRect().top -
          logEl.getBoundingClientRect().top + logEl.scrollTop - GAP);
      }
    });
  }
  var GAP = 14;

  /* Everything is inserted ahead of the tail spacer so it stays last. */
  function push(node) {
    if (spacer && spacer.parentNode === logEl) logEl.insertBefore(node, spacer);
    else logEl.appendChild(node);
  }

  function row(me, hero) {
    var r = el('div', 'rem-ask-row' + (me ? ' me' : '') + (hero ? ' hero' : ''));
    if (!me && !hero) {
      var av = el('div', 'rem-ask-av');
      var img = el('img'); img.src = AVATAR; img.alt = 'Rem Assist';
      av.appendChild(img);
      r.appendChild(av);
    }
    var b = el('div', 'rem-ask-bub');
    r.appendChild(b);
    push(r);
    return b;
  }

  function userBubble(text) {
    var b = row(true);
    b.appendChild(el('p', null, text));
    anchorRow = b.parentNode;
  }

  /* Renders one KB entry: title, paragraphs, links, the standing handoff row,
     then suggestion chips. `ctx` labels the message form's placeholder. */
  function botBubble(entry, alts, ctx) {
    var b = row(false, entry.hero);

    if (entry.hero) {
      if (entry.title) b.appendChild(el('h3', 'hero-t', entry.title));
      (entry.text || []).forEach(function (line) {
        b.appendChild(el('p', 'hero-s', line));
      });
    } else {
      if (entry.title) b.appendChild(el('h4', null, entry.title));
      (entry.text || []).forEach(function (line) {
        var bullet = line.charAt(0) === '•';
        b.appendChild(el('p', bullet ? 'li' : null, bullet ? line.slice(1).trim() : line));
      });
    }

    var links = (entry.links || []).filter(function (l) { return !inHandoff(l[1]); });
    if (links.length) {
      var wrap = el('div', 'rem-ask-links');
      links.forEach(function (l, i) {
        var a = el('a');
        a.href = l[1];
        if (isExternal(l[1]) && !/^(tel|mailto):/i.test(l[1])) { a.target = '_blank'; a.rel = 'noopener'; }
        a.appendChild(document.createTextNode(l[0]));
        if (i === 0) a.appendChild(icon(I_ARROW, 14));
        wrap.appendChild(a);
      });
      b.appendChild(wrap);
    }

    b.appendChild(handoff(ctx || entry.title || entry.id));

    var chips = (alts || []).concat(entry.chips || DEFAULT_CHIPS).slice(0, 4);
    if (chips.length) suggest(chips);
    anchorNow();
    return b;
  }

  /* Destinations the handoff row below every answer already covers. Most KB
     entries also list "Book a consultation" of their own, which rendered the
     same button twice in a row; botBubble drops those rather than us having to
     hand-prune ~37 entries. Prefilled mailto links are deliberately not listed
     here — they carry the visitor's own question, which the form does not. */
  function inHandoff(href) {
    var base = String(href).split('?')[0];
    return base === CALENDLY.split('?')[0] || base === 'tel:' + TEL;
  }

  /* Stands under every answer so nothing is ever a conversational dead end:
     book a slot, email the team, or leave a message without leaving the chat. */
  function handoff(ctx) {
    var wrap = el('div', 'rem-ask-hand');

    var bk = el('a');
    bk.href = CALENDLY;
    bk.target = '_blank'; bk.rel = 'noopener';
    bk.appendChild(icon(I_CAL, 13));
    bk.appendChild(document.createTextNode('Book a consultation'));

    var msg = el('button');
    msg.type = 'button';
    msg.appendChild(icon(I_MAIL, 13));
    msg.appendChild(document.createTextNode('Leave a message'));
    msg.addEventListener('click', function () { openForm(ctx); });

    var call = el('a', 'tel');
    call.href = 'tel:' + TEL;
    call.appendChild(icon(I_PHONE, 13));
    call.appendChild(document.createTextNode('Call us'));

    wrap.appendChild(bk); wrap.appendChild(msg); wrap.appendChild(call);
    return wrap;
  }

  function suggest(chips) {
    var wrap = el('div', 'rem-ask-sug');
    chips.forEach(function (c) {
      var b = el('button', null, c[0]);
      b.type = 'button';
      b.addEventListener('click', function () {
        wrap.remove();
        say(c[0]);
        respond(c[1], c[0]);
      });
      wrap.appendChild(b);
    });
    push(wrap);
  }

  function clearSuggestions() {
    var nodes = logEl.querySelectorAll('.rem-ask-sug');
    for (var i = 0; i < nodes.length; i++) nodes[i].remove();
  }

  function typing() {
    var r = el('div', 'rem-ask-row rem-ask-typing-row');
    var av = el('div', 'rem-ask-av');
    var img = el('img'); img.src = AVATAR; img.alt = '';
    av.appendChild(img);
    var b = el('div', 'rem-ask-bub');
    var t = el('div', 'rem-ask-typing');
    t.appendChild(el('i')); t.appendChild(el('i')); t.appendChild(el('i'));
    b.appendChild(t);
    r.appendChild(av); r.appendChild(b);
    push(r);
    anchorNow();
    return r;
  }

  /* ---- Conversation ----------------------------------------------------- */
  function say(text) {
    clearSuggestions();
    userBubble(text);
    state.log.push({ r: 'u', t: text });
    save();
    anchorNow();
  }

  function submitInput() {
    var text = (inputEl.value || '').trim();
    if (!text) return;
    inputEl.value = '';
    autosize();
    say(text);
    answer(text);
  }

  /* Routes one free-text question. The out-of-scope check comes first: without
     it "do you have a home cleaning service?" scores on the word "service" and
     gets answered as though we sell cleaning. */
  function answer(text) {
    var trade = outsideScope(text);
    if (trade) { respond('__outside', text, null, false, trade); return; }
    var hit = match(text);
    respond(hit.entry ? hit.entry.id : '__none', text, hit.alts);
  }

  /* Answers by KB id. '__none' is the unknown-keyword path, '__form' opens the
     message form, '__outside' answers for a trade we do not perform. All three
     are reachable from chips as well as from a typed query. */
  function respond(id, query, alts, instant, label) {
    if (id === '__form') { openForm(query || 'your enquiry'); return; }

    var delay = instant ? 0 : 380 + Math.min(520, (query || '').length * 12);
    var ghost = instant ? null : typing();

    setTimeout(function () {
      if (ghost) ghost.remove();
      if (id === '__none') {
        unknown(query || '');
        if (!instant) { state.log.push({ r: 'b', id: '__none', q: query || '' }); save(); }
        return;
      }
      if (id === '__outside') {
        botBubble(outsideEntry(label), [], label);
        if (!instant) { state.log.push({ r: 'b', id: '__outside', q: label }); save(); }
        return;
      }
      var entry = byId(id);
      if (!entry) { unknown(query || ''); return; }
      botBubble(entry, alts, entry.title || entry.id);
      if (!instant) { state.log.push({ r: 'b', id: id }); save(); }
    }, delay);
  }

  /* Unknown keyword: hand straight over, carrying the visitor's own words into
     the email so they never have to retype them. */
  function unknown(query) {
    var b = row(false);
    b.appendChild(el('h4', null, 'Let me get a human on this'));
    b.appendChild(el('p', null, 'Our team answers 24/7, and your question is already attached to the email below.'));

    /* Only the prefilled email here — calling and booking are one row down in
       the handoff, and repeating them reads as a stutter. */
    var wrap = el('div', 'rem-ask-links');
    var mail = el('a');
    mail.href = mailLink('Website question', query);
    mail.appendChild(document.createTextNode('Email the team'));
    mail.appendChild(icon(I_ARROW, 14));
    wrap.appendChild(mail);
    b.appendChild(wrap);
    b.appendChild(handoff('a question I asked your website assistant'));
    suggest([['Leave a message', '__form']].concat(DEFAULT_CHIPS).slice(0, 4));
    anchorNow();
  }

  /* ---- Leave a message -------------------------------------------------- */
  var formOpen = false;

  function openForm(ctx) {
    if (formOpen) {
      var existing = logEl.querySelector('.rem-ask-form input');
      if (existing) existing.focus();
      return;
    }
    formOpen = true;
    clearSuggestions();

    var b = row(false);
    b.appendChild(el('h4', null, 'Leave a message'));
    b.appendChild(el('p', null, 'Tell us how to reach you and someone from the team will come back to you — sales and support run 24/7.'));

    var f = el('form', 'rem-ask-form');
    var fields = [
      { k: 'name',    label: 'Your name',   type: 'text',  ph: 'Jane Doe', req: true },
      { k: 'email',   label: 'Email',       type: 'email', ph: 'jane@company.com' },
      { k: 'phone',   label: 'Phone', type: 'tel', ph: '+1 555 0100' }
    ];
    var inputs = {};
    fields.forEach(function (fd) {
      var id = 'rem-ask-f-' + fd.k;
      var lab = el('label', null, fd.label + (fd.req ? '' : ' (optional)'));
      lab.setAttribute('for', id);
      var inp = el('input');
      inp.id = id; inp.type = fd.type; inp.placeholder = fd.ph;
      inp.name = fd.k;
      inp.autocomplete = fd.k === 'name' ? 'name' : fd.k === 'email' ? 'email' : 'tel';
      f.appendChild(lab); f.appendChild(inp);
      inputs[fd.k] = inp;
    });

    var mLab = el('label', null, 'How can we help?');
    mLab.setAttribute('for', 'rem-ask-f-msg');
    var msg = el('textarea');
    msg.id = 'rem-ask-f-msg'; msg.name = 'message';
    msg.placeholder = ctx && ctx.indexOf(' ') > 0 ? 'I have a question about ' + ctx + '…' : 'A few lines about what you need…';
    f.appendChild(mLab); f.appendChild(msg);
    inputs.message = msg;

    var err = el('div', 'err');
    f.appendChild(err);

    var fine = el('div', 'fine');
    fine.appendChild(document.createTextNode('By sending, you authorize Rem Assist to contact you about your enquiry. Message and data rates may apply; consent is not a condition of purchase. See our '));
    var pl = el('a', null, 'privacy policy');
    pl.href = P.privacy;
    fine.appendChild(pl);
    fine.appendChild(document.createTextNode('.'));
    f.appendChild(fine);

    var rowEl = el('div', 'row');
    var send = el('button', 'rem-ask-send', 'Send message');
    send.type = 'submit';
    var cancel = el('button', 'rem-ask-cancel', 'Cancel');
    cancel.type = 'button';
    rowEl.appendChild(send); rowEl.appendChild(cancel);
    f.appendChild(rowEl);

    cancel.addEventListener('click', function () {
      formOpen = false;
      b.parentNode.remove();
      suggest(DEFAULT_CHIPS);
    });

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {
        name: inputs.name.value.trim(),
        email: inputs.email.value.trim(),
        phone: inputs.phone.value.trim(),
        message: inputs.message.value.trim()
      };
      var problem = '';
      if (!data.name) problem = 'Please add your name so we know who we are replying to.';
      else if (!data.email && !data.phone) problem = 'Please leave an email or a phone number so we can reach you.';
      else if (data.email && data.email.indexOf('@') < 1) problem = 'That email address does not look right.';
      else if (!data.message) problem = 'Please tell us briefly what you need.';
      if (problem) {
        err.textContent = problem;
        err.className = 'err on';
        return;
      }
      err.className = 'err';
      send.disabled = true;
      send.textContent = 'Sending…';
      deliver(data, function () {
        formOpen = false;
        b.parentNode.remove();
      });
    });

    b.appendChild(f);
    anchorNow();
    if (window.innerWidth > 520) inputs.name.focus();
  }

  /* Page names on this site contain spaces, so the raw pathname arrives
     percent-encoded — decode it before it lands in someone's inbox. */
  function pageName() {
    var last = location.pathname.split('/').pop();
    if (!last) return location.href;
    try { return decodeURIComponent(last); } catch (e) { return last; }
  }

  function summarise(d) {
    return 'New enquiry from the Rem Assist website\n' +
           'Name: ' + d.name + '\n' +
           (d.email ? 'Email: ' + d.email + '\n' : '') +
           (d.phone ? 'Phone: ' + d.phone + '\n' : '') +
           'Page: ' + pageName() + '\n\n' +
           d.message;
  }

  /* With LEAD_ENDPOINT set the message is posted straight to it. Without one —
     the default on this static site — we compose the email to the support
     inbox and hand it to the visitor to send, so nothing is silently lost. */
  function deliver(d, done) {
    var text = summarise(d);
    var first = d.name.split(' ')[0];

    function composed() {
      done();
      var b = row(false);
      b.appendChild(el('h4', null, 'Thanks, ' + first + ' — one tap to send'));
      b.appendChild(el('p', null, 'Your message is written and addressed to ' + EMAIL + '. Send it from your mail app:'));
      var wrap = el('div', 'rem-ask-links');
      var mail = el('a');
      mail.href = mailLink('Website enquiry — ' + d.name, text);
      mail.appendChild(document.createTextNode('Send by email'));
      mail.appendChild(icon(I_ARROW, 14));
      var call = el('a');
      call.href = 'tel:' + TEL;
      call.appendChild(document.createTextNode('Call instead'));
      wrap.appendChild(mail); wrap.appendChild(call);
      b.appendChild(wrap);
      b.appendChild(el('p', null, 'Prefer a scheduled slot? The consultation is free and takes about 20 minutes.'));
      var wrap2 = el('div', 'rem-ask-links');
      var bk = el('a');
      bk.href = CALENDLY; bk.target = '_blank'; bk.rel = 'noopener';
      bk.appendChild(document.createTextNode('Book a consultation'));
      bk.appendChild(icon(I_ARROW, 14));
      wrap2.appendChild(bk);
      b.appendChild(wrap2);
      suggest(DEFAULT_CHIPS);
      scrollDown();
    }

    if (!LEAD_ENDPOINT || typeof fetch !== 'function') { composed(); return; }

    fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: d.name, email: d.email, phone: d.phone, message: d.message,
        page: location.href, source: 'Ask RemAssist'
      })
    }).then(function (res) {
      if (!res.ok) throw new Error('bad status');
      done();
      var b = row(false);
      b.appendChild(el('h4', null, 'Message sent, ' + first));
      b.appendChild(el('p', null, 'Someone from the team will be in touch shortly. If it is urgent, ' + PHONE + ' is the fastest way to reach us.'));
      b.appendChild(handoff('my message'));
      suggest(DEFAULT_CHIPS);
      scrollDown();
    })['catch'](composed);
  }

  /* ---- Open / close ----------------------------------------------------- */
  function open() {
    if (!root) return;
    hideTeaser();
    lastFocus = document.activeElement;
    state.open = true; save();
    root.classList.add('is-open');
    /* setTimeout rather than rAF: a hidden tab suspends rAF, and a panel that
       never gets .is-visible stays at opacity 0 for good. */
    clearTimeout(visTimer);
    visTimer = setTimeout(function () { root.classList.add('is-visible'); }, 20);
    /* Not childNodes — the tail spacer is always in there. */
    if (!logEl.querySelector('.rem-ask-row')) replay();
    anchorNow();
    if (window.innerWidth > 520) inputEl.focus({ preventScroll: true });
  }

  function close() {
    if (!root || !root.classList.contains('is-open')) return;
    root.classList.remove('is-visible');
    state.open = false; save();
    clearTimeout(visTimer);
    visTimer = setTimeout(function () {
      root.classList.remove('is-open');
      if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }, 260);
  }

  /* Replays a stored transcript instantly (no typing indicator), then greets a
     first-time visitor. */
  function replay() {
    if (!state.log.length) {
      botBubble(byId('greeting'), [], 'Rem Assist');
      state.log.push({ r: 'b', id: 'greeting' });
      save();
      return;
    }
    state.log.forEach(function (m, i) {
      var last = i === state.log.length - 1;
      if (m.r === 'u') { userBubble(m.t); return; }
      if (m.id === '__none') { unknown(m.q || ''); if (!last) clearSuggestions(); return; }
      var e = m.id === '__outside' ? outsideEntry(m.q || 'that work') : byId(m.id);
      if (!e) return;
      botBubble(e, [], e.title || e.id);
      if (!last) clearSuggestions();
    });
    anchorNow();
  }

  function hideTeaser() {
    if (!teaser) return;
    teaser.classList.remove('is-shown');
    state.teased = true;
    save();
  }

  /* ---- Boot -------------------------------------------------------------
     On the home page the widget must not appear over the full-screen loader,
     so we wait for it to be dismissed before revealing the launcher. */
  function whenChromeReady(cb) {
    var loader = document.getElementById('rem-loader');
    if (!loader) { setTimeout(cb, 350); return; }
    var iv = setInterval(function () {
      var cs = window.getComputedStyle(loader);
      if (!loader.parentNode || cs.display === 'none' || parseFloat(cs.opacity) === 0) {
        clearInterval(iv); clearTimeout(bail); cb();
      }
    }, 250);
    var bail = setTimeout(function () { clearInterval(iv); cb(); }, 12000);
  }

  function start() {
    build();
    whenChromeReady(function () {
      root.classList.add('is-ready');
      if (state.open) { replay(); open(); return; }
      if (!state.teased && !state.log.length) {
        setTimeout(function () {
          if (!state.open && !state.teased) teaser.classList.add('is-shown');
          setTimeout(function () { if (!state.open) teaser.classList.remove('is-shown'); }, 9000);
        }, 5200);
      }
    });
  }

  load();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.remAsk = {
    open: open,
    close: close,
    ask: function (idOrText) {
      open();
      if (!logEl.querySelector('.rem-ask-row')) replay();
      var entry = byId(idOrText);
      if (entry) { say(entry.title || idOrText); respond(entry.id, idOrText); return; }
      say(idOrText);
      answer(idOrText);
    }
  };
})();
