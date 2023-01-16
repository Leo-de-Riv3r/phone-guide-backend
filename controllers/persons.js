const personRouter = require('express').Router()
const Person = require('../models/person')

personRouter.get('/hello-world', (req, res) => {
  res.send('Hello world!')
})

personRouter.get('/persons', (req, res) => {
  Person.find({}).then((p) => {
    res.json(p)
  })
})

// app.get("/info", (req, res) => {
//   res.send(
//     `<h1>Phonebook has info for ${persons.length} people</h1>${new Date()}`
//   );
// });

personRouter.put('/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
    _id: body._id,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((newP) => res.json(newP))
    .catch((err) => next(err))
})

personRouter.get('/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((p) => {
      if (p) res.json(p)
      else res.status(404).end()
    })
    .catch((error) => next(error))
})

personRouter.delete('/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch((err) => next(err))
})

personRouter.post('/persons', (request, response, next) => {
  if (!request.body.name || !request.body.number) {
    return response.status(400).json({
      error: 'content missing',
    })
  }

  let names = []
  Person.find({}).then((p) => (names = p))
  if (names.includes(request.body.name)) {
    return response.status(400).json({
      error: 'name must be unique',
    })
  }

  const person = new Person({
    name: request.body.name,
    number: request.body.number,
  })

  person
    .save()
    .then((p) => {
      return response.json(p.toJSON())
    })
    .then((resp) => response.json(resp))
    .catch((err) => next(err))
})

module.exports = personRouter
