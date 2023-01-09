const { json, response } = require("express");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const Person = require("./models/person.js");
const app = express();
app.use(express.static("build"));
app.use(express.json());
app.use(cors());
const url = process.env.MONGODB_URI

mongoose.connect(url);

const requestLogger = (request, response, next) => {
  if (request.method == "POST") console.log(JSON.stringify(request.body));
  next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).json({
    error: "unknown endpoint",
  });
};

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name == "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name == "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(morgan("dev"));
app.use(requestLogger);

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((p) => {
    res.json(p);
  });
});

// app.get("/info", (req, res) => {
//   res.send(
//     `<h1>Phonebook has info for ${persons.length} people</h1>${new Date()}`
//   );
// });

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
    _id: body._id,
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((newP) => res.json(newP))
    .catch((err) => next(err));
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((p) => {
      if (p) res.json(p);
      else res.status(404).end();
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((result) => res.status(204).end())
    .catch((err) => next(err));
});

app.post("/api/persons", (request, response, next) => {
  if (!request.body.name || !request.body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  let names = [];
  Person.find({}).then((p) => (names = p));
  if (names.includes(request.body.name)) {
    return response.status(400).json({
      errorhot: "name must be unique",
    });
  }

  const person = new Person({
    name: request.body.name,
    number: request.body.number,
  });

  person
    .save()
    .then((p) => {
      return response.json(p.toJSON());
    })
    .then((resp) => response.json(resp))
    .catch((err) => next(err));
});

app.use(unknownEndpoint);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
