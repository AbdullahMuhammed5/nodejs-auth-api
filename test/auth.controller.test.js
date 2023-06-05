const request = require('supertest');
const app = require('../app');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const User = require('../models/userModel');
const mongodbMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const { ROLES } = require('../models/userModel');

dotenv.config({ path: './test.env' });

// Open database connection before each test.
beforeAll(async () => {
    const server = await mongodbMemoryServer.create();
    const uri = server.getUri();
    await mongoose.connect(uri);
});

// Closing database connection after each test.
afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
});

describe('Register API', () => {
    beforeEach(async () => {
        await User.deleteMany({})
    });

    // Test successfull signup
    it('should create a new user', async () => {
        const data = {
            firstName: 'jane',
            lastName: 'smith',
            email: 'jane@example.com',
            password: 'password',
            passwordConfirm: 'password',
        };

        const res = await request(app).post('/api/v1/users/signup').send(data);
        expect(res.statusCode).toEqual(201);
        expect(res.body.data).toBeDefined();
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data).toHaveProperty('firstName');
        expect(res.body.data).toHaveProperty('lastName');
        expect(res.body.data).toHaveProperty('email');
        expect(res.body.data).not.toHaveProperty('password');
        expect(res.body).toHaveProperty('token');
    });

    it('should return 400 bad request - duplicate key: email', async () => {
        const data = {
            firstName: 'John',
            lastName: 'smith',
            email: 'john@example.com',
            password: 'password',
            passwordConfirm: 'password',
        };

        await request(app).post('/api/v1/users/signup').send(data);
        const res = await request(app).post('/api/v1/users/signup').send(data);

        expect(res.statusCode).toEqual(400);
    });

    it('should return 422 status code - missing data', async () => {
        const res = await request(app).post('/api/v1/users/signup').send({ firstName: 'John' });

        expect(res.statusCode).toEqual(422);
    });

    it('should return 422 status code - passwords are not matched', async () => {
        const data = {
            firstName: 'john',
            lastName: 'smith',
            email: 'john@example.com',
            password: 'password',
            passwordConfirm: 'anotherpassword',
        };

        const res = await request(app).post('/api/v1/users/signup').send(data);

        expect(res.statusCode).toEqual(422);
    });
});

describe('Login API', () => {
    let token;

    beforeAll(async () => {
        await User.create({
            firstName: 'test',
            lastName: 'user',
            email: 'test@email.com',
            password: 'password',
            passwordConfirm: 'password',
        });
    });

    // Test case for successful login
    it('should return a valid JWT token on successful login', async () => {
        const response = await request(app)
            .post('/api/v1/users/login')
            .send({
                email: 'test@email.com',
                password: 'password'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        token = response.body.token; // store the token for future tests
    });

    // Test case for unsuccessful login with wrong credentials
    it('should return an error for invalid credentials', async () => {
        const response = await request(app)
            .post('/api/v1/users/login')
            .send({
                email: 'wrong@email.com',
                password: 'wrongPassword'
            });

        expect(response.status).toBe(401);
    });

    // Test case for accessing a protected route with a valid token
    it('should allow access to a protected route with a valid token', async () => {
        const response = await request(app)
            .get('/api/v1/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
    });

    // Test case for accessing a protected route without a token
    it('should return an error for accessing a protected route without a token', async () => {
        const response = await request(app)
            .get('/api/v1/protected');

        expect(response.status).toBe(401);
    });

    // Test case for accessing a protected route with an invalid token
    it('should return an error for accessing a protected route with an invalid token', async () => {
        const response = await request(app)
            .get('/api/v1/protected')
            .set('Authorization', 'Bearer invalidToken');

        expect(response.status).toBe(401);
    });
});


describe('Logout API', () => {
    let token;

    beforeAll(async () => {
        await User.deleteMany({});
        await User.create({
            firstName: 'test',
            lastName: 'user',
            email: 'test@email.com',
            password: 'password',
            passwordConfirm: 'password',
        });
    });

    // Test case for successful logout
    it('should logout successfullly', async () => {
        let response = await request(app)
            .post('/api/v1/users/login')
            .send({
                email: 'test@email.com',
                password: 'password'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');

        token = response.body.token; 

        response = await request(app)
            .get('/api/v1/users/logout')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
    });
});

describe('Protected Routes', () => {
    let adminToken;
    let supervisorToken;

    beforeAll(async () => {
        await User.deleteMany({});
        await User.create({
            firstName: 'test',
            lastName: 'user',
            email: 'admin@email.com',
            password: 'password',
            passwordConfirm: 'password',
            role: ROLES.ADMIN,
        });
        await User.create({
            firstName: 'test',
            lastName: 'user',
            email: 'supervisor@email.com',
            password: 'password',
            passwordConfirm: 'password',
            role: ROLES.SUPERVISOR,
        },);

        let response = await request(app)
            .post('/api/v1/users/login')
            .send({
                email: 'admin@email.com',
                password: 'password'
            });

        adminToken = response.body.token;

        response = await request(app)
            .post('/api/v1/users/login')
            .send({
                email: 'supervisor@email.com',
                password: 'password'
            });

        supervisorToken = response.body.token;
    });

    it('should return status 200 OK - for admin access', async () => {
        const response = await request(app)
            .get('/api/v1/products/list')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
    });

    it('should return status 200 OK - for supervisor access', async () => {
        const response = await request(app)
            .get('/api/v1/products/list')
            .set('Authorization', `Bearer ${supervisorToken}`);

        expect(response.status).toBe(200);
    });

    it('should return status 200 OK - for admin access', async () => {
        const response = await request(app)
            .delete('/api/v1/products/delete')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
    });

    it('should return status 401 unauthoeized - for supervisor access', async () => {
        const response = await request(app)
            .delete('/api/v1/products/delete')
            .set('Authorization', `Bearer ${supervisorToken}`);

        expect(response.status).toBe(403);
    });
});
