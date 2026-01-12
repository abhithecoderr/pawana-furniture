import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import SiteSettings from '../src/models/SiteSettings.js';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URL = process.env.DB_URI;

// Existing content from about.ejs and services.ejs
const aboutData = {
  story: {
    title: 'Our Story',
    subtitle: 'Resilience, Artistry, and a Vision for Perfection.',
    content: `The foundation of Pawana Furniture is rooted in the unwavering hard work and dedication of its founder, Mr Pawan Kumar. His dream was shaped not by prosperity, but by the struggles and difficult circumstances he witnessed during his childhood. While his father worked continuously as an employee in the furniture industry, Mr Pawan found his true inspiration in his grandfather, who was an experienced employee of the British Railways, and whose work reflected discipline, precision, and deep expertise. This strict discipline sharpened Mr Pawan's thinking, motivating him to excel academically and then move forward in his professional life. He consistently refined his skills and worked with leading companies in Punjab, always in search of a broader perspective. His intense pursuit of exceptional quality took him beyond India's borders, where he studied advanced furniture techniques in Italy and gained a unique competitive edge.

Mr Pawan knew that he would have to build his success on his own; despite the lack of financial security and the backward mindset of his family, which was unable to support his dreams, he remained firmly determined to achieve something significant. He took a major and defining risk by launching his own venture—Pawana Furniture. The early phase was extremely challenging, marked by a shortage of clients and immense difficulties. Yet Mr Pawan stayed focused on his core strengths—sharp skill, superior finishing, and delivering the highest quality at a fair price. People were drawn to his craftsmanship and began to realize that they were receiving truly unmatched quality. Gradually, word of mouth spread, and strong connections were formed with influential individuals who became an important support system for him. Born out of isolation and unwavering determination, Pawana Furniture has today become a success story of skill and resilience, driven by a single purpose: to fulfill customers' dreams by transforming their visions into reality.

And even today, continued success depends on good clients like you—clients we genuinely value and truly need.`,
    image: {
      url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767229823/ourstory_x9c179.jpg',
      publicId: ''
    }
  },
  values: [
    {
      icon: 'craftsmanship',
      title: 'Craftsmanship',
      description: 'Every piece is meticulously handcrafted by skilled artisans who have honed their craft over decades, ensuring unparalleled quality and attention to detail.'
    },
    {
      icon: 'sustainability',
      title: 'Sustainability',
      description: 'We source our materials responsibly, using sustainable wood and eco-friendly finishes to create furniture that\'s beautiful and environmentally conscious.'
    },
    {
      icon: 'design',
      title: 'Timeless Design',
      description: 'Our designs blend classic elegance with modern functionality, creating pieces that remain stylish and relevant for generations to come.'
    },
    {
      icon: 'customer',
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We work closely with you to understand your vision and bring it to life with personalized service and support.'
    }
  ],
  process: {
    intro: 'At Pawana Furniture, we believe true luxury is turning a personalized vision into a tangible reality. Our entire bespoke process—from the initial Design Brief to Full-Service Delivery—is purposefully structured to translate your unique aspirations for comfort and style into a meticulously crafted piece. We are not just fulfilling an order; we are Working on Your Dream, ensuring that the final result perfectly reflects your personal aesthetic and living philosophy.',
    steps: [
      {
        title: 'Design Brief',
        description: 'This is the critical starting point for your custom furniture commission, where we hold a focused consultation to fully understand your functional needs and aesthetic preferences. The Design Brief formally outlines the scale, style, and essential parameters for the piece, ensuring our design team has a clear, shared vision before any work begins.',
        image: { url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767228917/step1_ozp9qm.jpg', publicId: '' }
      },
      {
        title: 'Product Design',
        description: 'Our experts transform the approved brief into precise, technical documents, creating detailed 2D drawings and advanced 3D models. This stage involves focusing on structural integrity, exact measurements, and ensuring all functional elements work perfectly, making Product Design the detailed blueprint for manufacturing your unique piece.',
        image: { url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767228910/step2_glwklo.jpg', publicId: '' }
      },
      {
        title: 'Detail Selection',
        description: 'This is the personalization phase where your furniture truly comes to life; you will choose all the final elements that define the look and feel of the piece. This includes selecting your preferred wood finishes, fabric types, leather quality, and hardware options, as Detail Selection ensures the piece is perfectly tailored to your taste and space.',
        image: { url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767228903/step-3_bn3vk7.jpg', publicId: '' }
      },
      {
        title: 'Price Estimate',
        description: 'Once the design and all materials have been formally approved, we issue this document, which is a transparent breakdown of all associated costs. The Price Estimate includes material sourcing, manufacturing labor, and our specialized delivery service fees, confirming the total investment required for your bespoke Pawana Furniture® commission.',
        image: { url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767228925/step-4_hgmlf0.jpg', publicId: '' }
      },
      {
        title: 'Project Oversight',
        description: 'A dedicated manager is assigned to supervise the entire commission process, managing the production schedule, monitoring quality, and coordinating all logistics. Project Oversight guarantees that deadlines are met and that the project progresses smoothly, ensuring a seamless and worry-free experience for the client.',
        image: { url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767228902/step-5_jpvz4t.jpg', publicId: '' }
      },
      {
        title: 'Quality Assurance',
        description: 'Our commitment to excellence is finalized at this critical stage, where every piece of furniture undergoes a rigorous, multi-point inspection. We check construction, stability, finish perfection, and adherence to the original specifications, as Quality Assurance certifies that your furniture meets the exacting standards of Pawana Furniture®.',
        image: { url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767228916/step-6_h6xjac.jpg', publicId: '' }
      },
      {
        title: 'Full-Service Delivery',
        description: 'This is the final phase where your finished piece is safely brought to its new location by our specialized team, who handle all transportation and placement logistics. Full-Service Delivery includes professional unpacking, complete setup, and removal of all packaging materials, ensuring a perfect installation and a pristine finish in your space.',
        image: { url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767228902/step-7_laqhpf.jpg', publicId: '' }
      }
    ]
  },
  heritage: {
    title: '100% Crafted in India',
    description: 'Every piece of Pawana Furniture® is conceptualized, sourced, and manufactured entirely within India. This commitment ensures that we uphold the highest standards of quality control and leverage the generational skill of local master artisans. By keeping our process fully domestic, we deliver furniture that embodies authentic Indian craftsmanship, structural integrity, and a profound sense of heritage.'
  }
};

const servicesData = {
  intro: {
    title: 'More Than Just Furniture',
    description: 'At Pawana Furniture, we offer a complete range of services designed to make your furniture journey seamless and enjoyable. From initial consultation to after-sales support, we\'re with you every step of the way.'
  },
  items: [
    {
      title: 'Custom Furniture Design',
      description: 'Bring your vision to life with our bespoke furniture design service. Our expert designers work closely with you to create unique pieces that perfectly match your style, space, and functional requirements. From concept sketches to final product, we ensure every detail reflects your personality.',
      features: ['Personalized design consultations', '3D visualizations and mockups', 'Material and finish selection guidance', 'Unlimited design revisions'],
      image: { url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767288381/service1_r8chue.jpg', publicId: '' }
    },
    {
      title: 'Space Planning & Interior Consultation',
      description: 'Not sure how to arrange your furniture or which pieces would work best in your space? Our interior consultants provide expert advice on space planning, furniture placement, and style coordination to create harmonious and functional living spaces.',
      features: ['On-site space assessment', 'Furniture layout planning', 'Color and style recommendations', 'Complete room design packages'],
      image: { url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767288375/service2_hmtqdi.jpg', publicId: '' }
    },
    {
      title: 'Professional Installation',
      description: 'Our skilled installation team ensures your furniture is assembled and positioned perfectly. We handle everything with care and precision, so you can start enjoying your new furniture immediately without any hassle.',
      features: ['Expert assembly and installation', 'Careful handling and placement', 'Packaging removal and cleanup', 'Final quality inspection'],
      image: { url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767288371/service3_e5v3tl.jpg', publicId: '' }
    },
    {
      title: 'Furniture Restoration & Repair',
      description: 'Give your beloved furniture pieces a new lease on life. Our restoration experts can repair, refinish, and restore antique or damaged furniture to its former glory, preserving memories while enhancing functionality.',
      features: ['Wood repair and refinishing', 'Upholstery replacement', 'Antique furniture restoration', 'Hardware replacement and upgrades'],
      image: { url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767288376/service4_dm1dyn.jpg', publicId: '' }
    },
    {
      title: 'Customization & Modifications',
      description: 'Already have furniture but want to update its look or functionality? We offer customization services including reupholstering, refinishing, resizing, and style modifications to breathe new life into your existing pieces.',
      features: ['Fabric and leather reupholstering', 'Wood staining and painting', 'Size and configuration changes', 'Hardware and accent updates'],
      image: { url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767288369/service5_k6nux3.jpg', publicId: '' }
    },
    {
      title: 'Delivery & White Glove Service',
      description: 'We offer secure, timely delivery with our white glove service. Our team handles your furniture with utmost care, from our workshop to your home, ensuring it arrives in perfect condition and is set up exactly where you want it.',
      features: ['Scheduled delivery at your convenience', 'Protective packaging and transport', 'Room-of-choice placement', 'Assembly and setup included'],
      image: { url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767288372/service6_npggev.jpg', publicId: '' }
    },
    {
      title: 'Maintenance & Care Services',
      description: 'Keep your furniture looking beautiful for years to come with our maintenance and care services. We provide professional cleaning, polishing, and preventive care to protect your investment.',
      features: ['Professional furniture cleaning', 'Wood polishing and conditioning', 'Leather care and treatment', 'Annual maintenance packages'],
      image: { url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767535744/service7_s6tlkh.jpg', publicId: '' }
    },
    {
      title: 'Commercial & Hospitality Solutions',
      description: 'We partner with businesses, hotels, restaurants, and offices to provide comprehensive furniture solutions. From design to installation, we handle projects of all sizes with professionalism and efficiency.',
      features: ['Bulk orders and volume discounts', 'Commercial-grade furniture options', 'Project management and coordination', 'Flexible payment and delivery terms'],
      image: { url: 'https://res.cloudinary.com/duiix4ryu/image/upload/v1767535744/service8_tbg15k.jpg', publicId: '' }
    }
  ]
};

async function seedAboutServices() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');

    const result = await SiteSettings.findOneAndUpdate(
      {},
      {
        $set: {
          about: aboutData,
          services: servicesData
        }
      },
      { new: true, upsert: true }
    );

    console.log('✓ About settings seeded:');
    console.log('  - Story title:', result.about.story.title);
    console.log('  - Values count:', result.about.values.length);
    console.log('  - Process steps count:', result.about.process.steps.length);
    console.log('  - Heritage title:', result.about.heritage.title);

    console.log('\n✓ Services settings seeded:');
    console.log('  - Intro title:', result.services.intro.title);
    console.log('  - Services count:', result.services.items.length);

    result.services.items.forEach((item, i) => {
      console.log(`  - Service ${i + 1}: ${item.title}`);
    });

    await mongoose.disconnect();
    console.log('\nDone! About and Services settings have been seeded.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedAboutServices();
