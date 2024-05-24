const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.use(express.json());
// app.use(morgan("tiny"));
app.use(cors());

morgan.token("body", (req) => JSON.stringify(req.body));
morgan.token("query", (req) => JSON.stringify(req.query));

app.use(
  morgan((tokens, req, res) => {
    let logFormat = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ];

    if (req.method === "POST" || req.method === "PUT") {
      logFormat.push(tokens.body(req, res));
    }

    return logFormat.join(" ");
  })
);

app.get("/", (request, response) => {
  response.send("<h1>Hello world</h1>");
});

app.get("/info", (request, response) => {
  const time = new Date();
  response.send(`
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${time.toString()}</p>
  `);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((p) => p.id !== id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (!body.name || !body.number) {
    return response.status(400).json({ error: "Name or number is missing" });
  }
  if (persons.find((p) => p.name === body.name)) {
    return response.status(400).json({ error: "name must be unique" });
  }

  const newPerson = {
    id: Math.max(...persons.map((p) => p.id)) + 1,
    name: body.name,
    number: body.number,
  };
  persons = persons.concat(newPerson);
  response.status(201).json(newPerson);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
