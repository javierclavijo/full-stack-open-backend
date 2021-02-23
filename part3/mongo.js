const mongoose = require('mongoose')

if (process.argv.length < 3 || process.argv.length === 4) {
    console.log('Please provide the password as an argument (and, optionally, a new person\'s name and number): node mongo.js <password> <name> <number>')
    process.exit(1)
}


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {
    const newName = process.argv[3]
    const newNumber = process.argv[4]

    const newPerson = new Person({ name: newName, number: newNumber })


    newPerson.save().then(() =>
        mongoose.connection.close()
    )
} else if (process.argv.length === 3) {
    Person.find({}).then(res => {
        res.forEach(person => {
            console.log(person)
        }
        )
        mongoose.connection.close()
    }).catch(() => {
        console.log('Database is empty or unreachable.')
        mongoose.connection.close()
    })
}