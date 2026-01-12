import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema({
  // Home Page Settings
  home: {
    hero: {
      tagline: {
        type: String,
        default: "Only The Finest Furniture"
      },
      badges: {
        type: [String],
        default: ["Workshop In Rajpura", "Since 1980"]
      },
      stats: [{
        number: {
          type: String,
          required: true
        },
        label: {
          type: String,
          required: true
        }
      }],
      // Hero images (up to 3)
      images: [{
        url: { type: String, default: '' },
        publicId: { type: String, default: '' }
      }],
      activeImageIndex: {
        type: Number,
        default: 0
      }
    },
    featuredCodes: {
      signatureItems: {
        type: [String],
        default: []
      },
      featuredItems: {
        type: [String],
        default: []
      },
      featuredSets: {
        type: [String],
        default: []
      }
    },
    browseByRoomCodes: {
      'Living Room': { type: String, default: 'LT-04' },
      'Dining Room': { type: String, default: 'DR-04' },
      'Bedroom': { type: String, default: 'BR-09' },
      'Office': { type: String, default: 'OT-02' },
      'Showpieces': { type: String, default: 'SR-044' }
    },
    // Showpieces room page - furniture type images
    showpiecesTypeCodes: {
      'Cabinet': { type: String, default: 'SR-033' },
      'Console': { type: String, default: 'ST-048' },
      'Fireplace': { type: String, default: 'SR-089' }
    }
  },

  // Contact Page Settings
  contact: {
    phone1: {
      type: String,
      default: "+91 8360550271"
    },
    phone2: {
      type: String,
      default: "+91 6239811718"
    },
    whatsappEnquiry: {
      type: String,
      default: "918360550271"
    },
    email: {
      type: String,
      default: "pawanafurniture07@gmail.com"
    },
    formEmail: {
      type: String,
      default: "pawanafurniture07@gmail.com"
    },
    address: {
      line1: {
        type: String,
        default: "Pawana Furniture"
      },
      line2: {
        type: String,
        default: "Patiala Road, NH 7"
      },
      line3: {
        type: String,
        default: "Liberty Chowk, Punjab 140401"
      },
      country: {
        type: String,
        default: "India"
      }
    },
    businessHours: {
      weekday: {
        type: String,
        default: "Monday - Saturday: 8:00 AM - 7:30 PM"
      },
      weekend: {
        type: String,
        default: "Sunday: 8:00 AM - 6:30 PM"
      }
    }
  },

  // About Page Settings
  about: {
    story: {
      title: { type: String, default: 'Our Story' },
      subtitle: { type: String, default: 'Resilience, Artistry, and a Vision for Perfection.' },
      content: { type: String, default: '' },
      image: {
        url: { type: String, default: '' },
        publicId: { type: String, default: '' }
      }
    },
    values: [{
      icon: { type: String, default: 'craftsmanship' },
      title: { type: String, required: true },
      description: { type: String, required: true }
    }],
    process: {
      intro: { type: String, default: '' },
      steps: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        image: {
          url: { type: String, default: '' },
          publicId: { type: String, default: '' }
        }
      }]
    },
    heritage: {
      title: { type: String, default: '100% Crafted in India' },
      description: { type: String, default: '' }
    }
  },

  // Services Page Settings
  services: {
    intro: {
      title: { type: String, default: 'More Than Just Furniture' },
      description: { type: String, default: '' }
    },
    items: [{
      title: { type: String, required: true },
      description: { type: String, required: true },
      features: [{ type: String }],
      image: {
        url: { type: String, default: '' },
        publicId: { type: String, default: '' }
      }
    }]
  }
}, {
  timestamps: true
});

// Singleton pattern - always get or create the single settings document
siteSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Update settings (upsert)
siteSettingsSchema.statics.updateSettings = async function(updates) {
  return await this.findOneAndUpdate(
    {},
    { $set: updates },
    { new: true, upsert: true, runValidators: true }
  );
};

export default mongoose.model("SiteSettings", siteSettingsSchema);
