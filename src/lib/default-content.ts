import { SiteContent, SiteSettings, Leader, CommunityVoice } from '@/types';

export const defaultSettings: SiteSettings = {
  siteTitle: 'The CX Assembly — India’s Peer-Led Community for CX Leaders',
  metaDescription:
    'A private, peer-led leadership community bringing together India’s senior customer experience leaders to challenge perspectives, solve real problems and shape the future of CX.',
  linkedinUrl: 'https://www.linkedin.com/company/the-cx-assembly',
  contactEmail: 'contact@thecxassembly.com',
  credibilityText: 'Launched on World CX Day 2026',
  foundingCount: '50 Founding CX Leaders',
};

export const defaultContent: SiteContent = {
  hero: {
    headline: 'Better Customer Experiences Start With Better Conversations.',
    subheadline:
      'A private, peer-led community bringing together India’s customer experience leaders to challenge perspectives, solve real problems and shape what CX needs to become next.',
    tagline: 'Built by CX Leaders. For CX Leaders.',
    ctaPrimaryText: 'Join The Assembly',
    ctaSecondaryText: 'Meet Our Founding Leaders',
  },
  whyWeExist: {
    badge: 'Why We Exist',
    headline: "Everyone Talks About Customer Experience. Who's Talking About What It Really Takes?",
    paragraph1:
      'Customer expectations are changing. Technology is evolving. And CX leaders are expected to deliver seamless experiences across increasingly complex customer journeys.',
    paragraph2:
      'But behind every great customer experience are difficult decisions, competing priorities, failed experiments and lessons that rarely make it into a conference presentation.',
    paragraph3:
      'We believe CX leaders deserve a space to talk about those realities. A space where they can ask questions without having all the answers. Challenge established thinking. Learn from what others have tried. And find support from people navigating similar challenges.',
    conclusion: "That's why The CX Assembly exists.",
  },
  philosophy: {
    badge: 'Our Philosophy',
    headline: 'Less Networking. More Collective Thinking.',
    pillars: [
      {
        title: 'A Curated Community for Senior CX Leaders',
        description:
          'The focus is exclusively on shared challenges, practical perspectives and mutual learning rather than vendor sales pitches.',
      },
      {
        title: 'Real Questions. Honest Answers.',
        description:
          'Success stories are valuable. So are the lessons from what did not work. We encourage candid conversations that go far beyond polished presentations.',
      },
      {
        title: 'A Community Beyond Events',
        description:
          'Meaningful relationships are built over time. The Assembly is designed to foster continuous conversations, peer support and lasting collaboration.',
      },
      {
        title: 'Shaped by CX Leaders',
        description:
          'Our members are not just participants. Their perspectives, priorities and day-to-day challenges guide the agenda and direction of the community.',
      },
    ],
  },
  forLeaders: {
    badge: 'For CX Leaders',
    headline: "Your Challenges Aren't Unique. Your Perspectives Are.",
    subheadline:
      'From earning leadership buy-in for CX investments to connecting fragmented customer journeys, improving retention, measuring experience and making AI genuinely useful — CX leadership comes with questions that rarely have straightforward answers.',
    callout:
      'Somewhere within this community, another leader may have already navigated something similar. The CX Assembly brings those experiences together.',
    takeaways: [
      'Peer Perspectives: Exchange ideas and battle-tested experiences with CX leaders across diverse consumer sectors.',
      'Collective Problem-Solving: Seek candid feedback on strategic challenges, organizational roadblocks, and roadmap decisions.',
      'Shared Learning: Discuss emerging operational approaches, shifting customer expectations, AI integration, and journey orchestration.',
      'Trusted Connections: Build deep relationships with fellow leaders who truly understand the everyday realities and pressures of your role.',
      'A Collective Voice: Help shape meaningful industry dialogues that elevate the importance of customer experience across India.',
    ],
    ctaText: 'Apply to Join',
    note: 'Membership is curated and exclusively for eligible senior brand-side CX leaders.',
  },
  forPartners: {
    badge: 'For Partners',
    headline: 'Meaningful Partnerships. Better Industry Conversations.',
    paragraph1:
      'The future of customer experience will be shaped through genuine collaboration between leaders, innovators, and organisations committed to elevating customer journeys.',
    paragraph2:
      'At The CX Assembly, we believe the most valuable partnerships begin with understanding real industry challenges, not selling solutions. We welcome conversations with organisations that bring proven domain expertise, fresh perspectives, and a sincere commitment to advancing CX.',
    paragraph3:
      'Through closed-door roundtables, research initiatives, curated discussions, and collaborative formats, we create high-trust opportunities for meaningful ecosystem engagement.',
    principle: 'Our principle is simple: Community trust always comes first.',
  },
  aboutUs: {
    badge: 'About Us',
    headline: 'Built Around Leaders. Designed for Conversations That Matter.',
    paragraph1:
      'The CX Assembly is an initiative of The Executive Assembly, an established platform dedicated to building trusted, peer-led leadership communities across India.',
    paragraph2:
      'Created following the successful establishment of The CMO Assembly, The CX Assembly brings that same dedication to candid, high-value peer exchange into the world of customer experience.',
    paragraph3:
      'Each community operates with its own distinct identity and leadership focus, united by one core belief: The most valuable industry conversations happen when leaders feel comfortable being honest, curious, and collaborative.',
    founderNote:
      'The Executive Assembly was founded by Vivek Sheth, drawing on more than a decade of experience building premier professional communities and leadership engagement platforms.',
  },
  founding50: {
    headline: 'THE FOUNDING 50',
    subheadline: '50 Leaders. One Shared Belief.',
    leadParagraph: 'CX deserves better conversations.',
    description:
      'On World CX Day, October 6, 2026, 50 customer experience leaders came together to mark the beginning of The CX Assembly. A collective built on the belief that India’s CX leaders can achieve more when they share experiences, challenge thinking, and support one another. These founding leaders are helping shape not just the community, but also the conversations it stands for.',
  },
  privacyPolicy: `
### Privacy Policy

**Effective Date:** October 2026

The CX Assembly ("we", "our", or "us"), an initiative of The Executive Assembly, respects your privacy and is committed to protecting the personal data of our members, partners, and website visitors.

#### Information We Collect
- **Membership & Contact Details:** When you apply to join or submit an inquiry, we collect your full name, work email address, company name, designation, and optional LinkedIn URL or message.
- **Usage & Technical Data:** We may collect standard browser and device logs to ensure platform security, responsiveness, and service reliability.

#### How We Use Your Information
- To evaluate membership eligibility for The CX Assembly.
- To communicate updates, roundtable invitations, and community announcements.
- To review and coordinate partnership opportunities.
- We **never sell or rent** your personal information to third parties.

#### Data Security
All submission records are stored in secure, access-controlled databases with strict administrative safeguards.

#### Contact
If you have any questions regarding this Privacy Policy or your personal information, please reach out to us at contact@thecxassembly.com.
  `.trim(),
};

export const sampleLeaders: Leader[] = [
  {
    id: 'leader-1',
    name: 'Rajesh Varma',
    designation: 'Head of Customer Experience',
    company: 'Titan Company Limited',
    photoUrl: '/brand/leader-sample-1.jpg',
    linkedinUrl: 'https://linkedin.com',
    bio: 'Pioneering omnichannel customer journey orchestration, personalized retail experiences, and scalable voice-of-customer programs across 2,000+ retail stores in India.',
    order: 1,
    published: true,
  },
  {
    id: 'leader-2',
    name: 'Priyanka Sen',
    designation: 'Senior Vice President — CX & Service Operations',
    company: 'MakeMyTrip',
    photoUrl: '/brand/leader-sample-2.jpg',
    linkedinUrl: 'https://linkedin.com',
    bio: 'Leading end-to-end traveler experience transformations, generative AI resolution workflows, and high-empathy customer delight systems for over 50 million active users.',
    order: 2,
    published: true,
  },
  {
    id: 'leader-3',
    name: 'Anand Kulkarni',
    designation: 'Chief Customer Officer',
    company: 'HDFC Life',
    photoUrl: '/brand/leader-sample-3.jpg',
    linkedinUrl: 'https://linkedin.com',
    bio: 'Championing digital-first claims experiences, customer retention ecosystems, and trust-centered CX metrics in India’s leading life insurance sector.',
    order: 3,
    published: true,
  },
  {
    id: 'leader-4',
    name: 'Meera Nair',
    designation: 'Head of Customer Experience & Operations',
    company: 'Nykaa',
    photoUrl: '/brand/leader-sample-4.jpg',
    linkedinUrl: 'https://linkedin.com',
    bio: 'Driving seamless post-purchase customer journeys, beauty advisory engagement, and rapid customer resolutions across digital and luxury physical stores.',
    order: 4,
    published: true,
  },
];

export const sampleVoices: CommunityVoice[] = [
  {
    id: 'voice-1',
    quote:
      'The CX Assembly is the only forum where senior CX leaders can take off the corporate mask and talk honestly about the messy, complex reality of changing customer journeys.',
    name: 'Vikram Joshi',
    designation: 'VP Customer Experience',
    company: 'Swiggy',
    order: 1,
    published: true,
  },
  {
    id: 'voice-2',
    quote:
      'Connecting with peers who are solving the exact same retention and journey fragmentation puzzles is invaluable. It’s collective thinking at its finest.',
    name: 'Shweta Rao',
    designation: 'Head of Client Experience',
    company: 'ICICI Bank',
    order: 2,
    published: true,
  },
  {
    id: 'voice-3',
    quote:
      'An exceptional peer community that puts honesty and depth above vendor sales pitches. The discussions have directly influenced our 2026 CX roadmap.',
    name: 'Arjun Mathur',
    designation: 'Chief Experience Officer',
    company: 'Tata Digital',
    order: 3,
    published: true,
  },
];
