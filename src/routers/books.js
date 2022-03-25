const express = require('express');

// Required our database - this db variable 
// is actually a "Client" object from the 
// node postgres library: https://node-postgres.com/api/client
const db = require('../utils/database');
const booksRouter = express.Router();

// GET /books - getting all books from the database
booksRouter.get('/', (req, res) => {
  // Using the query method to send a SQL query to the database.
  // This is asynchronous - so we use our "then" callbacks to handle the response
	db.query('SELECT * FROM books')
    .then((dbResult) => {
		console.log(dbResult)

    // Send back the rows we got from the query to the client
    res.json({books: dbResult.rows})
    })
    // If there is a database error, the callback we provide to catch will be called.
    // In this case we want to send the client a 500 (server error) and log out the message
    .catch(err => {
      res.status(500)
      res.json({err: 'Unexpected error'})
      console.log(err)
    })
	});

module.exports = booksRouter;
