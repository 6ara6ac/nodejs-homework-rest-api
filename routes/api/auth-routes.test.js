const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require("jsonwebtoken")


const app = require('../../app');

const {User} = require('../../models')

const {DB_HOST_TEST, PORT, SECRET_KEY} = process.env;

describe("test register route", () => {
    let server = null
    beforeAll(async ()=> {
        server = app.listen(PORT);
        await mongoose.connect(DB_HOST_TEST);
    })

    afterAll(async () => {
        server.close();
        await mongoose.connection.close();
    })


    test("test register with correct data", async ()=> {
        const registerData = {
            email: "marvel@gmail.com",
            password: "123456"
        };

        const {statusCode, body} = await request(app).post('/api/auth/login').send(registerData);
        expect(statusCode).toBe(200);

         const {id} = jwt.verify(body.token, SECRET_KEY)
         const {email, subscription} = await User.findById(id);
         expect(email).toBe(registerData.email)
        
         console.log(email)
         console.log(subscription)
    })

})