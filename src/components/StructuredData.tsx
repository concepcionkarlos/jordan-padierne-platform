// JSON-LD structured data — tells Google exactly who Jordan is, where he works,
// and what he does. This powers rich results and the local "map pack" ranking.

const BASE = 'https://jordanpadierne.com'

export default function StructuredData() {
  const realEstateAgent = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${BASE}/#agent`,
    name: 'Jordan Padierne',
    alternateName: 'Jordan Padierne Realtor',
    description:
      'South Florida Realtor with eXp Realty specializing in pre-construction, investment, and luxury real estate for buyers, investors, and international clients across Miami-Dade.',
    url: BASE,
    image: `${BASE}/icon-512.png`,
    logo: `${BASE}/icon-512.png`,
    telephone: '+1-305-799-6973',
    email: 'info@jordanpadierne.com',
    priceRange: '$$$',
    knowsLanguage: ['English', 'Spanish'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Miami',
      addressRegion: 'FL',
      addressCountry: 'US',
    },
    areaServed: [
      'Miami-Dade County', 'Brickell', 'Downtown Miami', 'Doral',
      'Coral Gables', 'Hialeah', 'Coconut Grove', 'Edgewater', 'Aventura', 'Miami Beach',
    ].map((name) => ({ '@type': 'Place', name })),
    memberOf: { '@type': 'Organization', name: 'eXp Realty' },
    makesOffer: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Home Buying' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Pre-Construction Real Estate' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Real Estate Investment' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Luxury Real Estate' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Home Selling & Valuation' } },
    ],
    sameAs: [
      'https://www.instagram.com/jordanpadiernerealtor',
      'https://www.facebook.com/share/1D4osW7eJa/',
      'https://www.linkedin.com/in/jordan-padierne-realtor-',
      'https://www.zillow.com/profile/jordanpadierne',
    ],
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE}/#website`,
    url: BASE,
    name: 'Jordan Padierne Real Estate',
    publisher: { '@id': `${BASE}/#agent` },
    inLanguage: ['en-US', 'es'],
  }

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What areas of South Florida does Jordan Padierne serve?',
        acceptedAnswer: { '@type': 'Answer', text: 'Jordan serves Miami-Dade County including Brickell, Downtown Miami, Doral, Coral Gables, Hialeah, and surrounding areas.' },
      },
      {
        '@type': 'Question',
        name: 'Does Jordan Padierne speak Spanish?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Jordan is fully bilingual and works with clients in both English and Spanish, including international buyers.' },
      },
      {
        '@type': 'Question',
        name: 'What does Jordan Padierne specialize in?',
        acceptedAnswer: { '@type': 'Answer', text: 'Jordan specializes in pre-construction opportunities, investment properties, and luxury real estate in Miami, while also helping first-time and family buyers.' },
      },
      {
        '@type': 'Question',
        name: 'How can I find out what my Miami home is worth?',
        acceptedAnswer: { '@type': 'Answer', text: 'Request a free, no-obligation home valuation on jordanpadierne.com/home-value and Jordan will prepare a personalized market report within 24 hours.' },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateAgent) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  )
}
