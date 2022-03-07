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

        res.sendStatus("ok")

    } catch (error) {
        res.status(500).send(error);
    }
}
export async function postRental(req, res) {
    const { customerId, gameId, daysRented } = req.body;
    try {
        console.log("entrou")

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