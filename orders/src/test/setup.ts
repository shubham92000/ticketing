import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// tell ts that there is a global function called signin
declare global {
	var signin: () => string[];
}

jest.mock('../nats-wrapper');
jest.setTimeout(50000);

let mongo: any;

beforeAll(async () => {
	process.env.JWT_KEY = 'asdf';
	// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

	mongo = await MongoMemoryServer.create();
	const mongoUri = mongo.getUri();

	await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
	jest.clearAllMocks();
	const collections = await mongoose.connection.db.collections();

	for (let collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	if (mongo) {
		await mongo.stop();
	}
	await mongoose.connection.close();
});

global.signin = () => {
	// build a jwt payload
	const payload = {
		id: new mongoose.Types.ObjectId().toHexString(),
		email: 'test99@test.com',
	};

	// create jwt
	const token = jwt.sign(payload, process.env.JWT_KEY!);

	// build session object
	const session = {
		jwt: token,
	};

	// turn into session
	const sessionJSON = JSON.stringify(session);

	// turn json and encode in base64
	const base64 = Buffer.from(sessionJSON).toString('base64');

	return [`session=${base64}`];
};
