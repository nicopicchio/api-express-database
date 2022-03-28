const express = require('express');
const db = require('../utils/database');
const petsRouter = express.Router();

petsRouter.get('/', (req, res) => {
	db.query('SELECT * FROM pets').then((dbResult) => {
		res.json({ pets: dbResult.rows });
	});
});

petsRouter.get('/:id', (req, res) => {
	db.query('SELECT * FROM pets WHERE id = $1', [req.params.id])
		.then((dbResult) => {
			if (dbResult.rowCount === 0) {
				res.status(404);
				res.json({ error: 'pet not found!' });
			} else
			res.json({ pet: dbResult.rows[0] });
		})
		.catch((err) => {
			res.status(500);
			res.json({ error: 'unexpected error!' });
		});
});

petsRouter.post('/', (req, res) => {
	const postPetQuery = `
    INSERT INTO pets(
    name,
    age,
    type,
    breed,
    microchip)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
	const postPetQueryValues = [
		req.body.name,
		req.body.age,
		req.body.type,
		req.body.breed,
		req.body.microchip,
	];
	db.query(postPetQuery, postPetQueryValues)
		.then((dbResult) => {
			res.json({ pet: dbResult.rows[0] });
		})
		.catch((err) => {
			res.status(500);
			res.json({ error: 'unexpected error!' });
		});
});

petsRouter.delete('/:id', (req, res) => {
	db.query('DELETE FROM pets WHERE id = $1 RETURNING *', [req.params.id])
		.then((dbResult) => {
			if (dbResult.rowCount === 0) {
				res.status(404);
				res.json({ error: 'pet not found' });
			} else
				res.json({ pet: dbResult.rows[0] });
		})
		.catch((err) => {
			res.status(500);
			res.json({ error: 'unexpected error!' });
			console.log(err);
		});
});

module.exports = petsRouter;
