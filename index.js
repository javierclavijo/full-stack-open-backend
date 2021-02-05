require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person')

const app = express();

app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-data'));
app.use(cors());
app.use(express.static('build'))

morgan.token('req-data', (req, res) => {
    const reqBody = JSON.stringify(req.body);
    if (reqBody !== '{}') {
        return reqBody;
    }
    return '';
});

let persons = [];
app.get('/api/persons', ((req, res) => {
    Person.find({}).then(persons => {
        res.json(persons);
    })
}));

app.get('/info', (req, res) => {
    console.log(persons)
    const info = '<div>' +
        `<p>Phonebook has info for ${persons.length} people</p>` +
        `<p>${Date()}</p>` +
        '</div>';
    res.send(info);
});

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then((person) => {
            res.json(person);
        })
        .catch(next)
});

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).end())
        .catch(next)
});

app.post('/api/persons', (req, res) => {
    if (!req.body.name || !req.body.number) {
        res.status(400).json({error: 'Content missing'});
    } else {
        const newPerson = new Person(
            {name: req.body.name, number: req.body.number})
        newPerson
            .save()
            .then(person => res.json(person));
    }
});

app.put('/api/persons/:id', (req, res, next) => {
    const updatedPerson = {name: req.body.name, number: req.body.number}
    Person.findByIdAndUpdate(req.params.id, updatedPerson, {new: true})
        .then(person => res.json(person))
        .catch(next)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'});
}

app.use(unknownEndpoint);

const errorHandler = (err, req, res, next) => {
    console.error(err.message);

    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).send({error: 'malformatted id'})
    }
    next(err)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
