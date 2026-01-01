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

async function updateContactSettings() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');

    const result = await SiteSettings.findOneAndUpdate(
      {},
      {
        $set: {
          'contact.phone': '+91 6239811718',
          'contact.whatsapp': '916239811718',
          'contact.email': 'pawanafurniture07@gmail.com'
        }
      },
      { new: true, upsert: true }
    );

    console.log('Updated contact settings:');
    console.log('Phone:', result.contact.phone);
    console.log('WhatsApp:', result.contact.whatsapp);
    console.log('Email:', result.contact.email);

    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateContactSettings();
