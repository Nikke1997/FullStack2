const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

morgan.token("body", (req) => JSON.stringify(req.body));
const custom = morgan(":method :url :status :res[content-length] - :response-time ms :body");

app.use(custom);


//Hardcoded persons
let persons = [
  { id: 1, name: "Arto Hellas", number: "040-123456" },
  { id: 2, name: "Ada Lovelance", number: "39-44-5323523" },
  { id: 3, name: "Dan Abramov", number: "12-43-234345" },
  { id: 4, name: "Mary Poppendick", number: "39-23-6423122" },
];

//Get the homepage
app.get("/api/persons", (req, res) => {
  res.json(persons);
});

//Get the length of the phonebook and the current date
app.get("/api/info", (req, res) => {
  const date = new Date();
  res.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`
  );
});

//Get a single person
app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

//Delete a single person
app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    persons = persons.filter((person) => person.id !== id);
    res.status(204).end();
  } else {
    res.status(404).end();
  }
});

app.post("/api/persons", (req, res) => {
const body = req.body
const {name, number} = body;
const prev = persons.find(person => person.name.toLowerCase() === name.toLowerCase());

if(!name || !number){
    return res.status(400).json({   
        error: !name ? "name missing" : "number missing"
    })
}

if(prev){
    return res.status(409).json({
        error: "name must be unique"
    })
}

const person = {
    name: name,
    number: number,
    id: Math.floor(Math.random() * 1000)
}

persons = persons.concat(person);

res.json(person);

});


//Configuration of the port
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
