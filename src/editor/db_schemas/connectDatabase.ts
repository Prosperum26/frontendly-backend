import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const databaseConnect = async (): Promise<void> => {
  try {
    const dbUri = process.env.DB_URI;
    await mongoose.connect(dbUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    throw error;
  }
};

export const databaseDisconnect = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('Failed to disconnect from MongoDB', error);
  }
};
