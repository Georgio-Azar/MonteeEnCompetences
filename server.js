import express from 'express';
import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);

async function hashPassword(password) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

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


app.post('/users', express.json(), async (req, res) => {
    const newUser = req.body;
    try {
        console.log('Reading file...');
        if (newUser.nom === undefined || newUser.prenom === undefined || 
            newUser.age === undefined || newUser.email === undefined || newUser.password === undefined) {
            res.status(400).send('Missing user information');
            return;
        }
        const data = fs.readFileSync('utilisateurs.json', 'utf8');
        console.log('File read successfully');
        const users = JSON.parse(data);
        newUser.id = crypto.randomUUID();
        if (users.find(user => user.email === newUser.email)) {
            res.status(400).send('Email already exists');
            return;
        }
        newUser.password = await hashPassword(newUser.password);
        users.push(newUser);
        fs.writeFileSync('utilisateurs.json', JSON.stringify(users, null, 2));
        res.status(201).send('User added successfully');
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Error writing file');
    }
});

app.put('/users/:id', express.json(), (req, res) => {
    const id = req.params.id;
    const updatedUser = req.body;
    try {
        if (updatedUser.nom === undefined || updatedUser.prenom === undefined || updatedUser.age === undefined || updatedUser.email === undefined) {
            res.status(400).send('Missing user information');
            return;
        }
        console.log('Reading file...');
        const data = fs.readFileSync('utilisateurs.json', 'utf8');
        console.log('File read successfully');
        const users = JSON.parse(data);
        const userIndex = users.findIndex(user => user.id == id);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updatedUser };
            fs.writeFileSync('utilisateurs.json', JSON.stringify(users, null, 2));
            res.send('User updated successfully');
        } else {
            res.status(404).send('User not found');
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Error writing file');
    }
});

app.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    try {
        console.log('Reading file...');
        const data = fs.readFileSync('utilisateurs.json', 'utf8');
        console.log('File read successfully');
        const users = JSON.parse(data);
        const userIndex = users.findIndex(user => user.id == id);
        if (userIndex !== -1) {
            users.splice(userIndex, 1);
            fs.writeFileSync('utilisateurs.json', JSON.stringify(users, null, 2));
            res.send('User deleted successfully');
        } else {
            res.status(404).send('User not found');
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Error writing file');
    }
});

app.listen(PORT, () => {});
