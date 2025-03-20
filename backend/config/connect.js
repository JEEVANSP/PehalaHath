// import { createClient } from '@supabase/supabase-js';

// // Load environment variables
// const SUPABASE_URL = process.env.SUPABASE_URL;
// const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
//   throw new Error('Supabase credentials are missing. Check your .env file.');
// }

// // Create Supabase client
// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


import mongoose from 'mongoose';

const connectDB = (url) => {
  mongoose.set('strictQuery', true);
  mongoose.connect(url)
    .then(() => console.log('connected to mongo'))
    .catch((err) => {
      console.error('failed to connect with mongo');
      console.error(err);
    });
};

export default connectDB;
