import dotenv from 'dotenv';
import mongoose from 'mongoose';
import SiteSettings from '../src/models/SiteSettings.js';

dotenv.config();

async function updateFormEmail() {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to MongoDB');

    const result = await SiteSettings.findOneAndUpdate(
      {},
      { 'contact.formEmail': 'pawanafurniture07@gmail.com' },
      { new: true }
    );

    if (result) {
      console.log('✅ Form email updated to:', result.contact.formEmail);
    } else {
      console.log('❌ No SiteSettings document found');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateFormEmail();
