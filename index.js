const express = require("express");
const app = express();

const cors = require("cors");

const path = require("path");
const dbPath = path.join(__dirname, "product.db");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./product.db", sqlite3.OPEN_READWRITE);

app.use(express.json());

app.use(cors());
let myDatabase;

const initialzeDbAndServer = async () => {
  try {
    myDatabase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(8000, () => console.log("Initialize successful"));
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initialzeDbAndServer();

console.log("Hi");

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INT, title VARCHAR(5000), price FLOAT, description VARCHAR(5000), category VARCHAR(2000), image VARCHAR(2000), sold BOOLEAN, dateOfSale DATEtIME
 )
 `;
db.run(createTableQuery);

const axios = require("axios");

const fetchAndInsert = async () => {
  const response = await axios.get(
    "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
  );
  const data = response.data;

  for (let item of data) {
    const queryData = `SELECT id FROM tasks WHERE id = ${item.id}`;
    const existingData = await myDatabase.get(queryData);
    if (existingData === undefined) {
      const query = `
   INSERT INTO tasks (id, title, price, description, category, image, sold, dateOfSale) 
   VALUES (
       ${item.id},
       '${item.title.replace(/'/g, "''")}',
       ${item.price},
       '${item.description.replace(/'/g, "''")}',
       '${item.category.replace(/'/g, "''")}',
       '${item.image.replace(/'/g, "''")}',
       ${item.sold},
       '${item.dateOfSale.replace(/'/g, "''")}'
   );
`;

      await db.run(query);
    }
  }
  console.log("tasks added");
};

fetchAndInsert();

app.get(`/tasks`, async (request, response) => {
  console.log("Hi");
  const getUserQuery = `
    SELECT * FROM tasks ;`;
  const userQuery = await myDatabase.all(getUserQuery);
  console.log(userQuery);
  response.send(userQuery);
});

app.get("/tasks/:id", async (request, response) => {
  const { id } = request.params;

  console.log("Hi");
  const getUserQuery = `
    SELECT * FROM tasks WHERE id = ${id}; `;
  const userQuery = await myDatabase.get(getUserQuery);
  console.log(userQuery);
  response.send(userQuery);
});

app.get(`/tasksSum`, async (request, response) => {
  console.log("Hi");

  const getUserQuery = `
    SELECT sum(price) FROM tasks ;`;
  const userQuery = await myDatabase.all(getUserQuery);
  console.log(userQuery);
  response.send(userQuery);
});

app.get(`/tasksSoldItem`, async (request, response) => {
  console.log("Hi");
  const getUserQuery = `
    SELECT sum(sold) FROM tasks ;`;
  const userQuery = await myDatabase.all(getUserQuery);
  console.log(userQuery);
  response.send(userQuery);
});

app.get(`/tasksMonth`, async (request, response) => {
  console.log("Hi");
  const getUserQuery = `
    SELECT * FROM tasks `;
  const userQuery = await myDatabase.all(getUserQuery);
  console.log(userQuery);
  response.send(userQuery);
});

app.get(`/tasksMonth/:months`, async (request, response) => {
  try {
    const { months } = request.params;
    console.log(months);
    const getUserQuery = `
    SELECT * FROM tasks WHERE strftime('%m',dateOfSale) = '${months}';`;
    const userQuery = await myDatabase.all(getUserQuery);
    console.log(userQuery);
    response.send(userQuery);
  } catch (e) {
    console.log(e.message);
  }
});
