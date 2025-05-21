import express from 'express';
import cors from 'cors';

import index from './routes/index';
import users from './routes/users';
import auth from './routes/auth';
import loggerMiddleware from './middleware/loggerMiddleware';
import errorMiddleware from './middleware/erreurMiddleware';

import { sequelize } from './database';

const app = express();
app.use(cors({
    origin: 'http://127.0.0.1:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json());
const PORT = 3000;

app.use(loggerMiddleware);

app.use("/", index);
app.use("/users", users);
app.use("/auth", auth);

app.use(errorMiddleware);

async function startServer() {
    try {
        await sequelize.sync();
        console.log('Connection has been established successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

startServer();
