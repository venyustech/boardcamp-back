import db from '../db.js';
import joi from "joi";
import dayjs from 'dayjs';

const rentalSchema = joi.object({
    customerId: joi.number().required(),
    gameId: joi.number().required(),
    daysRented: joi.number().min(1).required()
})

export async function getRentals(req, res) {
    try {
        console.log("leu")

        const result = await db.query(`
             SELECT 
                rentals.*, 
                customers.id AS "customerId",
                customers.name AS "customerName",
                games.id AS "gameId",
                games.name AS "gameName",
                games."categoryId",
                categories.name AS "categoryName"
            FROM rentals
                JOIN customers
                    ON  rentals."customerId" = customers.id
                JOIN games 
                    ON rentals."gameId" = games.id
                JOIN categories
                    ON games."categoryId" = categories.id

        `)
        console.log("leu")
        if (result.rowCount === 0)
            return res.sendStatus(404);

        return res.send(result.rows);

    } catch (error) {
        res.status(500).send(error);
    }
}
export async function postRental(req, res) {
    const { customerId, gameId, daysRented } = req.body;

    const validation = rentalSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    try {
        const findCustomer = await db.query(` SELECT * FROM customers WHERE id = $1`, [customerId]);

        if (findCustomer.rowCount === 0)
            return res.status(404).send("customer ID não existente");

        const findGame = await db.query(` SELECT * FROM games WHERE id = $1`, [gameId]);
        if (findGame.rowCount === 0)
            return res.status(404).send("game ID não existente");

        const pricePerDayGame = findGame.rows[0].pricePerDay
        const originalPrice = daysRented * pricePerDayGame

        const rentDate = dayjs().format("YYYY-MM-DD");

        await db.query(`
            INSERT INTO rentals 
                ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7)`, [customerId, gameId, rentDate, daysRented, null, originalPrice, null]
        )

        res.sendStatus(201);
    } catch (error) {
        console.log("error")

        res.status(500).send(error);
    }
}
export async function returnRental(req, res) {
    try {
        res.sendStatus("ok")

    } catch (error) {
        res.status(500).send(error);
    }
}
export async function deleteRental(req, res) {
    try {
        res.sendStatus("ok")

    } catch (error) {
        res.status(500).send(error);
    }
}