const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectTestDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        storageEngine: 'wiredTiger'
      }
    });
  } catch (error) {
    console.error('Failed to start MongoMemoryServer:', error);
    throw error;
  }
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};

const disconnectTestDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectTestDB, disconnectTestDB };
