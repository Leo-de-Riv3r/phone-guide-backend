const { json } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())
let persons = [
  {
    id:1,
    name: "Arto Hellas",
    number: "040-12244"
  },
  {
    id:2,
    name: "Ada Lovelace",
    number: "39-844-256732"
  },
  {
    id:3,
    name: "Dan Abramov",
    number: "12-43-2354565"
  },
  {
    id:4,
    name: "Mery Poppendick",
    number: "39-23-64542781"
  }
]
const requestLogger = (request, response, next) => {
  if (request.method == "POST") 
    console.log(JSON.stringify(request.body))
  next()
}

const unknownEndpoint = (req, res) => {
  res.status(404).json({
    error: 'unknown endpoint'
  })
}

app.use(morgan('dev'))
app.use(requestLogger)

app.get("/", (req, res) => {
  res.send("Hello world!")
})

app.get("/api/persons", (req, res) => {
  res.json(persons)
})

app.get("/info", (req, res) => {
  res.send(`<h1>Phonebook has info for ${persons.length} people</h1>${new Date()}`)
})

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id)
  const personFound = persons.find(p => p.id === id)

  if (personFound) 
    res.json(personFound)
  else 
    res.send(`<h1>No person found with id ${id}`)
})

app.delete("/api/persons/:id", (req, res) =>{
  const id = Number(req.params.id)
  persons = persons.filter((person) => person.id !== id)
  res.status(204).end()
})


app.post('/api/persons', (request, response) => {
  
  if (!request.body.name || !request.body.number) {
    return response.status(400).json({ 
      error: 'content missing'
    })
  }

  let personsName = persons.map((person) => person.name)
  if (personsName.includes(request.body.name)){
    return response.status(400).json({ 
      error: 'name must be unique'
    })
  }

  const person = {
    id: Date.now(),
    name: request.body.name,
    number: request.body.number
  }

  persons = persons.concat(person)
  response.json(person)
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});