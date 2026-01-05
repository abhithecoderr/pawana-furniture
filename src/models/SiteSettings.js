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
      }]
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
