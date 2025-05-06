import express from 'express';

import index from './routes/index.ts';
import users from './routes/users.ts';

const app = express();
const PORT = 3000;

app.use("/", index);
app.use("/users", users);

app.listen(PORT, () => {});
