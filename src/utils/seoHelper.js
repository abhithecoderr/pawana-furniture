/**
 * SEO Helper Utilities
 * Generates meta tags, Open Graph data, and JSON-LD structured data
 */

const SITE_URL = 'https://pawanafurniture.com';

/**
 * Generate Organization JSON-LD schema
 */
export function generateOrganizationSchema(settings) {
  const seo = settings.seo || {};
  const contact = settings.contact || {};

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seo.organization?.name || 'Pawana Furniture',
    legalName: seo.organization?.legalName || 'Pawana Furniture by Pawan Kumar',
    url: seo.siteUrl || SITE_URL,
    logo: seo.organization?.logo || '',
    foundingDate: seo.organization?.foundingDate || '1980',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: contact.phone1 || '+91 8360550271',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi', 'Punjabi']
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${contact.address?.line1 || ''}, ${contact.address?.line2 || ''}`,
      addressLocality: 'Rajpura',
      addressRegion: 'Punjab',
      postalCode: '140401',
      addressCountry: 'IN'
    },
    sameAs: [
      contact.socialMedia?.facebook,
      contact.socialMedia?.instagram
    ].filter(Boolean)
  };
}

/**
 * Generate WebSite JSON-LD schema with SearchAction for sitelinks search box
 */
export function generateWebSiteSchema(settings) {
  const seo = settings.seo || {};
  const siteUrl = seo.siteUrl || SITE_URL;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seo.siteName || 'Pawana® Furniture',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/catalogue?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Generate SiteNavigationElement schema for sitelinks
 */
export function generateNavigationSchema(rooms) {
  const navigationItems = [
    { name: 'Living Room', url: '/room/living-room' },
    { name: 'Dining Room', url: '/room/dining-room' },
    { name: 'Bedroom', url: '/room/bedroom' },
    { name: 'Office', url: '/room/office' },
    { name: 'Showpieces', url: '/room/showpieces' },
    { name: 'Contact', url: '/contact' },
    { name: 'About Pawana', url: '/about' }
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: navigationItems.map((item, index) => ({
      '@type': 'SiteNavigationElement',
      position: index + 1,
      name: item.name,
      url: `${SITE_URL}${item.url}`
    }))
  };
}

/**
 * Generate Product JSON-LD schema for furniture items
 */
export function generateProductSchema(item, siteUrl = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    description: item.description || `${item.name} - ${item.style} style ${item.type} for your ${item.room}`,
    sku: item.code,
    image: item.images?.map(img => img.url) || [],
    brand: {
      '@type': 'Brand',
      name: 'Pawana Furniture'
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Pawana Furniture'
    },
    category: `${item.room} > ${item.type}`,
    material: item.materials?.join(', ') || 'Premium Wood',
    url: `${siteUrl}/item/${item.slug}`,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow'
      }
    }
  };
}

/**
 * Generate Product schema for furniture sets
 */
export function generateSetSchema(set, siteUrl = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: set.name,
    description: set.description || `${set.name} - Complete furniture set for your ${set.room}`,
    sku: set.code,
    image: set.images?.map(img => img.url) || [],
    brand: {
      '@type': 'Brand',
      name: 'Pawana Furniture'
    },
    category: `${set.room} > Furniture Sets`,
    url: `${siteUrl}/set/${set.slug}`
  };
}

/**
 * Generate LocalBusiness JSON-LD schema for contact page
 */
export function generateLocalBusinessSchema(settings) {
  const contact = settings.contact || {};
  const seo = settings.seo || {};

  return {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: 'Pawana Furniture',
    image: seo.organization?.logo || '',
    '@id': seo.siteUrl || SITE_URL,
    url: seo.siteUrl || SITE_URL,
    telephone: contact.phone1 || '+91 8360550271',
    email: contact.email || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${contact.address?.line1 || ''}, ${contact.address?.line2 || ''}`,
      addressLocality: 'Rajpura',
      addressRegion: 'Punjab',
      postalCode: '140401',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 30.4762,
      longitude: 76.5942
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '19:30'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '08:00',
        closes: '18:30'
      }
    ],
    priceRange: '₹₹₹',
    servesCuisine: undefined,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Furniture Collection',
      itemListElement: [
        { '@type': 'OfferCatalog', name: 'Living Room Furniture' },
        { '@type': 'OfferCatalog', name: 'Bedroom Furniture' },
        { '@type': 'OfferCatalog', name: 'Dining Room Furniture' },
        { '@type': 'OfferCatalog', name: 'Office Furniture' },
        { '@type': 'OfferCatalog', name: 'Showpieces' }
      ]
    }
  };
}

/**
 * Generate BreadcrumbList JSON-LD schema
 */
export function generateBreadcrumbSchema(items, siteUrl = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${siteUrl}${item.url}` : undefined
    }))
  };
}

/**
 * Generate Collection/ItemList schema for room pages
 */
export function generateCollectionSchema(room, items, siteUrl = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${room.name} Furniture`,
    description: `Explore our ${room.name.toLowerCase()} furniture collection. Premium handcrafted furniture in Rajpura, Punjab.`,
    url: `${siteUrl}/room/${room.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.slice(0, 10).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/item/${item.slug}`
      }))
    }
  };
}

/**
 * Wrap multiple schemas in a graph for the page
 */
export function wrapSchemas(...schemas) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': schemas
  });
}

/**
 * Generate script tag with JSON-LD
 */
export function generateSchemaScript(schema) {
  const schemaString = typeof schema === 'string' ? schema : JSON.stringify(schema);
  return `<script type="application/ld+json">${schemaString}</script>`;
}
