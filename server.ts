import express from 'express';

import index from './routes/index';
import users from './routes/users';
import auth from './routes/auth';
import loggerMiddleware from './middleware/loggerMiddleware';
import errorMiddleware from './middleware/erreurMiddleware';

import { sequelize } from './database';

const app = express();
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

/*
async function main() {
    const app = express();
    const PORT = 3000;

    try {
        await db.sequelize.authenticate();
        db.sequelize.sync();
        console.log('Connection has been established successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    app.use("/", index);
    app.use("/users", users);
    app.listen(PORT, () => {});
};

main();*/