const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-data'));
app.use(cors());

morgan.token('req-data', (req, res) => {
    const reqBody = JSON.stringify(req.body);
    if (reqBody !== '{}') {
        return reqBody;
    }
    return '';
});

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

app.get('/api/persons', ((req, res) => {
    res.json(persons);
}));

app.get('/info', (req, res) => {
    const info = '<div>' +
        `<p>Phonebook has info for ${persons.length} people</p>` +
        `<p>${Date()}</p>` +
        '</div>';
    res.send(info);
});

app.get('/api/persons/:id', (req, res) => {
    const id = Number.parseInt(req.params.id);
    const person = persons.find(p => p.id === id);

    if (person) {
        res.json(person);
    } else {
        res.status(404).end();
    }
});

app.delete('/api/persons/:id', (req, res) => {
    const id = Number.parseInt(req.params.id);
    persons = persons.filter(p => p.id !== id);
    res.status(204).end();
});

app.post('/api/persons', (req, res) => {
    const id = Math.floor(Math.random() * 10e10);
    const body = req.body;
    const person = {name: body.name, number: body.number, id: id};

    if (!person.name || !person.number) {
        res.status(400).json({error: 'No name or number provided.'});
    } else if (persons.map(p => p.name).indexOf(person.name) !== -1) {
        res.status(400).json({error: 'Name already in phonebook'});
    } else {
        persons.push(person);
        res.json(person);
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
