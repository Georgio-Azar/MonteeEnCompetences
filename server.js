import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);

app.get('/utilisateurs', (req, res) => {
    res.sendFile('utilisateurs.json', { root: "." }, (err) => {
        if (err) {
            console.error(err);
            res.status(err.status).end();
        } else {
            console.log('Sent:', 'utilisateurs.json');
        }
    });
});

app.listen(PORT, () => {});
