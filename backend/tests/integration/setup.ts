import { beforeAll, afterEach, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod: MongoMemoryServer;

// Before all tests — start an in-memory MongoDB and connect to it.
// Each test file gets a fresh database, completely isolated from Atlas.
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// After each test — clear all collections so tests don't affect each other.
// A user created in test 1 won't interfere with test 2.
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// After all tests — disconnect and stop the in-memory server.
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
