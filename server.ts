import express from 'express';

import index from './routes/index';
import users from './routes/users';

import db from './database';

const app = express();
const PORT = 3000;

(async () => {
    try {
        await db.sequelize.authenticate();
        db.sequelize.sync({ force: true });
        console.log('Connection has been established successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

app.use("/", index);
app.use("/users", users);

app.listen(PORT, () => {});
