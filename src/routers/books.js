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

			// Send back the rows we got from the query to the client
			res.json({ books: dbResult.rows });
		})
		// If there is a database error, the callback we provide to catch will be called.
		// In this case we want to send the client a 500 (server error) and log out the message
		.catch((err) => {
			res.status(500);
			res.json({ err: 'Unexpected error' });
		});
});

// GET /books/:id - loads a single book by id
booksRouter.get('/:id', (req, res) => {
	// The query we want to run - in this case the id of the book we
	// are looking for will come from the request URL. We don't want
	// to add it to the query directly, instead we use $1 as a place
	// holder
	db.query('SELECT * FROM books WHERE id = $1', [req.params.id])
		// Create an array of values to use instead of the placeholders
		// in the above query. When the database runs the query, it will
		// replace the $ placeholders with the values from this array.
		// $1 will be replaced by the first value in the array
		// $2 (if we had one for this query) would be replaced by
		// the second value in the array
		// $3 by the third, etc.
		// Run the query, passing our query values as a second argument
		// to db.query

		.then((dbResult) => {
			if (dbResult.rowCount === 0) {
				res.status(404);
				res.json({ error: 'Book does not exist' });
			}
			res.json({ book: dbResult.rows[0] });
		})
		.catch((err) => {
			res.status(500);
			res.json({ err: 'Unexpected error' });
		});
});

booksRouter.post('/', (req, res) => {
	const postBookQuery = `
    INSERT INTO books(
    title,
    type,
    author,
    topic,
    publicationDate,
    pages)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
	const postBookQueryValues = [
		req.body.title,
		req.body.type,
		req.body.author,
		req.body.topic,
		req.body.publicationDate,
		req.body.pages,
	];
	db.query(postBookQuery, postBookQueryValues)
		.then((dbResult) => {
			res.json({ book: dbResult.rows[0] });
		})
		.catch((err) => {
			res.status(500);
			res.json({ error: 'Unexpected error' });
		});
});

booksRouter.delete('/:id', (req, res) => {
	db.query('DELETE FROM books WHERE id = $1 RETURNING *', [req.params.id])
	.then((dbResult) => {
		if (dbResult.rowCount === 0) {
			res.status(404);
			res.json({ error: 'book not found'})
		} else
			res.json({ book: dbResult.rows[0]})
	})
	.catch((err) => {
		res.status(500);
		res.json({ err: 'Unexpected error' })
	})
})

module.exports = booksRouter;
