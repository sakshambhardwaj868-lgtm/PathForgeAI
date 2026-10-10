import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';

// Configure DNS resolvers for reliable MongoDB Atlas SRV record resolution across Windows environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // If setServers is not permitted in the environment, continue with system defaults
}

export class Database {
  private static isConnected = false;

  public static async connect(): Promise<boolean> {
    if (this.isConnected && mongoose.connection.readyState === 1) {
      return true;
    }

    // Directly evaluate process.env.MONGODB_URI with fallback to validated env object
    const uri = process.env.MONGODB_URI !== undefined ? process.env.MONGODB_URI : env.MONGODB_URI;

    if (!uri || uri.trim() === '') {
      console.warn('[Database] MONGODB_URI is not set in environment (process.env.MONGODB_URI is undefined or empty). Cloud persistence is operating in offline mode.');
      this.isConnected = false;
      return false;
    }

    try {
      // Connect to MongoDB Atlas with target database name pathforge_ai
      await mongoose.connect(uri, {
        dbName: 'pathforge_ai',
        autoIndex: true,
        serverSelectionTimeoutMS: 8000,
      });

      this.isConnected = true;
      console.log(`[Database] Successfully connected to MongoDB Atlas (Database: ${mongoose.connection.db?.databaseName || 'pathforge_ai'})`);
      return true;
    } catch (err: any) {
      this.isConnected = false;
      // Sanitize error message to prevent logging credentials
      const sanitizedError = err.message ? err.message.replace(/:([^@]+)@/, ':****@') : 'Connection failed';

      // Provide clear, actionable diagnostic insight without exposing credentials
      let likelyCause = 'Verify Atlas cluster status and network connectivity.';
      if (err.message && /bad auth|Authentication failed|auth failed/i.test(err.message)) {
        likelyCause = 'Authentication failed. Please verify the username and password in MONGODB_URI.';
      } else if (err.message && /queryTxt ETIMEOUT|queryTxt ENOTFOUND|ESERVFAIL|querySrv/i.test(err.message)) {
        likelyCause = 'DNS SRV lookup failed for cluster hostname. Check network DNS resolution for MongoDB Atlas SRV records.';
      } else if (err.message && /Could not connect to any servers|timed out|Server selection timed out/i.test(err.message)) {
        likelyCause = 'Connection timed out. Check that your current IP address is whitelisted in MongoDB Atlas Network Access (e.g. 0.0.0.0/0).';
      }

      console.error(`[Database] MongoDB connection failed: ${sanitizedError} | Diagnostic: ${likelyCause}`);
      return false;
    }
  }

  public static isConfigured(): boolean {
    const uri = process.env.MONGODB_URI !== undefined ? process.env.MONGODB_URI : env.MONGODB_URI;
    return Boolean(uri && uri.trim() !== '');
  }

  public static isReady(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public static async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('[Database] Disconnected from MongoDB');
    }
  }
}
