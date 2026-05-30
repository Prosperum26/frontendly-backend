import mongoose from 'mongoose';

export const databaseConnect = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.DB_URI);
    /* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
    console.log('MongoDB connected successfully');
  } catch (error) {
    /* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
    console.error('Failed to connect to MongoDB', error);
    throw error;
  }
};

export const databaseDisconnect = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    /* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    /* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
    console.error('Failed to disconnect from MongoDB', error);
  }
};
