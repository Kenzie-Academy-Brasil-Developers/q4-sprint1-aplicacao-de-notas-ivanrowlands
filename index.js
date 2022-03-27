import express from "express";
import { v4 as uuidv4 } from "uuid";

const app = express();

app.use(express.json());

const userDB = [];

app.listen(3000, () =>
  console.log("Application running on http://localhost:3000")
);

const checkUser = (req, res, next) => {
  const userCPF = req.params.cpf;

  const findUser = userDB.find((user) => user.cpf == userCPF);

  if (!findUser) {
    res.status(404).json({ error: "user is not registered" });
  } else next();
};

const checkSameCPF = (req, res, next) => {
  const userCPF = req.body.cpf;

  const findUser = userDB.find((user) => user.cpf == userCPF);

  if (findUser) {
    res.status(422).json({ error: "user already exists" });
  } else next();
};

const checkNoteID = (req, res, next) => {
  const userCPF = req.params.cpf;
  const noteID = req.params.id;

  const findUser = userDB.find((user) => user.cpf == userCPF);

  const findNoteID = findUser.notes.find((note) => note.id == noteID);

  if (!findNoteID) {
    res.status(404).json({ error: "note is not registered" });
  } else next();
};

app.post("/users", checkSameCPF, (req, res) => {
  const data = req.body;

  const userSerializer = {
    id: uuidv4(),
    name: data.name,
    cpf: data.cpf,
    notes: [],
  };

  userDB.push(userSerializer);

  res.status(201).json(userSerializer);
});

app.get("/users", (req, res) => {
  res.status(200).json(userDB);
});

app.patch("/users/:cpf", checkUser, (req, res) => {
  const userCPF = req.params.cpf;
  const data = req.body;

  const findUser = userDB.find((user) => user.cpf == userCPF);

  if (data.name) {
    findUser.name = data.name;
  }

  if (data.cpf) {
    findUser.cpf = data.cpf;
  }

  res.status(200).json({
    message: "User is updated",
    user: findUser,
  });
});

app.delete("/users/:cpf", checkUser, (req, res) => {
  const userCPF = req.params.cpf;

  const findUser = userDB.find((user) => user.cpf == userCPF);

  userDB.pop(findUser);

  res.status(204).json("");
});

app.post("/users/:cpf/notes", checkUser, (req, res) => {
  const data = req.body;
  const userCPF = req.params.cpf;
  const date = new Date();

  const findUser = userDB.find((user) => user.cpf == userCPF);

  const noteSerializer = {
    id: uuidv4(),
    created_at: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}T${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}Z`,
    title: data.title,
    content: data.content,
  };

  findUser.notes.push(noteSerializer);

  res
    .status(201)
    .json(`${noteSerializer.title} was added into ${findUser.name}'s notes`);
});

app.get("/users/:cpf/notes", checkUser, (req, res) => {
  const userCPF = req.params.cpf;

  const findUser = userDB.find((user) => user.cpf == userCPF);

  res.status(200).json(findUser.notes);
});

app.patch("/users/:cpf/notes/:id", checkUser, checkNoteID, (req, res) => {
  const data = req.body;
  const userCPF = req.params.cpf;
  const noteID = req.params.id;
  const date = new Date();

  const findUser = userDB.find((user) => user.cpf == userCPF);

  const findNoteID = findUser.notes.find((note) => note.id == noteID);

  if (data.title) {
    findNoteID.title = data.title;
  }

  if (data.content) {
    findNoteID.content = data.content;
  }

  findNoteID[
    "updated_at"
  ] = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}T${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}Z`;

  res.status(200).json(findNoteID);
});

app.delete("/users/:cpf/notes/:id", checkUser, checkNoteID, (req, res) => {
  const userCPF = req.params.cpf;
  const noteID = req.params.id;

  const findUser = userDB.find((user) => user.cpf == userCPF);

  const findNoteID = findUser.notes.find((note) => note.id == noteID);

  findUser.notes.pop(findNoteID);

  res.status(204).json("");
});
