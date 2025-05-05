import express from 'express';
import fs from 'fs';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);

app.get('/users', (req, res) => {
    try {
        console.log('Reading file...');
        const data = fs.readFileSync('utilisateurs.json', 'utf8');
        console.log('File read successfully');
        const users = JSON.parse(data);
        let result = "";
        users.forEach((user) => {
            result += (`Nom: ${user.nom}, Prenom: ${user.prenom}, Age: ${user.age}, Mail : ${user.email}`);
            result += "<br>";
        }); 
        res.send(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Error reading file');
    }
});

app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    try {
        console.log('Reading file...');
        const data = fs.readFileSync('utilisateurs.json', 'utf8');
        console.log('File read successfully');
        const users = JSON.parse(data);
        const user = users.find(user => user.id == id);
        if (user) {
            res.send(`Nom: ${user.nom}, Prenom: ${user.prenom}, Age: ${user.age}, Mail : ${user.email}`);
        } else {
            res.status(404).send('User not found');
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Error reading file');
    }
});

app.listen(PORT, () => {});
