import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/game2d';
    // Log URI with password masked
    const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
    console.log(`[Database] Attempting to connect to MongoDB at: ${maskedUri}`);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail after 5 seconds if no server
      socketTimeoutMS: 45000,
    });
    
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
