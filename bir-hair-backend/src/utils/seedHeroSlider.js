
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const heroSliderService = require('../services/heroSlider.service');

const force = process.argv.includes('--force');

async function run() {
  await connectDB();

  try {
    const result = await heroSliderService.seedDefaults({ force });
    console.log(
      `Hero slider ${force ? 'reset to' : 'initialised with'} ${result.slides.length} default slides (version ${result.version}).`
    );
  } catch (err) {
    if (err.statusCode === 409) {
      console.log(err.message);
      console.log('To overwrite ONLY the hero slider settings, run: npm run seed:hero -- --force');
    } else {
      console.error('Hero slider seed failed:', err.message);
      process.exitCode = 1;
    }
  } finally {
    await mongoose.connection.close();
  }
}

run();