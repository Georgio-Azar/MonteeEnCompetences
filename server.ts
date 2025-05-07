import express from 'express';

import index from './routes/index';
import users from './routes/users';

const app = express();
const PORT = 3000;

app.use("/", index);
app.use("/users", users);

app.listen(PORT, () => {});
