require('dotenv').config();
require('express-async-errors');

//security
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

const connectDB = require('./db/connect');
const authenticateUser = require('./middleware/authentication');
//routers
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');
//error handlers
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handle');

const express = require('express');
const app = express();

app.set('Trust Proxy', 1);
app.use(
    rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

app.get('/', (req, res) => {
    res.status(200).json({msg: "HEELLO WELCOME TO TESTING"});
})

//routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

//error-handler middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

//db connectivity 
const port = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL);
        app.listen(process.env.PORT, () => {
            console.log(`THE SERVER IS RUNNING ON http://localhost:${port}`);
        })
    } catch (error) {
        console.log(error);
    }
}
start();