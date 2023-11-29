require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('body', (req) => JSON.stringify(req.body))
const custom = morgan(
  ':method :url :status :res[content-length] - :response-time ms :body'
)

app.use(custom)

//Handling unknown endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

//Error handling
const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

//Get the homepage
app.get('/api/persons', (req, res) => {
  Person.find({}).then((result) => {
    res.json(result)
  })
})

//Get the length of the phonebook and the current date
app.get('/api/info', (req, res) => {
  const date = new Date()
  Person.find({}).then((result) =>
    res.send(
      `<p>Phonebook has info for ${result.length} people</p><p>${date}</p>`
    )
  )
})

//Get a single person
app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => {
      next(error)
    })
})

//Delete a single person
app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndDelete(id)
    .then(() => {
      res.status(204).end()
    })
    .catch((error) => {
      next(error)
    })
})

//Add a new person
app.post('/api/persons', (req, res, next) => {
  const body = req.body
  const { name, number } = body

  const person = new Person({
    name: name,
    number: number,
  })

  person
    .save()
    .then((result) => {
      console.log('number saved!')
      res.json(result)
    })
    .catch((error) => {
      next(error)
    })
})

//Update a person
app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const id = req.params.id
  const { number } = body
  Person.findByIdAndUpdate(id, { number: number }, { new: true, runValidators: true, context: 'query' })
    .then((updatedPerson) => {
      res.json(updatedPerson)
    })
    .catch((error) => {
      next(error)
    })
})

app.use(unknownEndpoint)
app.use(errorHandler)

//Configuration of the port
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
