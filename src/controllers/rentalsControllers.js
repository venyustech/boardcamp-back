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
        if (result.rowCount === 0)
            return res.sendStatus(404);
        const rentals = result.rows.map(r => {
            return {
                id: r.id,
                customerId: r.customerId,
                gameId: dayjs(r.gameId).format("YYYY-MM-DD"),
                rentDate: dayjs(r.rentDate).format("YYYY-MM-DD"),
                daysRented: r.daysRented,
                returnDate: dayjs(r.returnDate).format("YYYY-MM-DD"),
                originalPrice: r.originalPrice,
                delayFee: r.delayFee,
                customer: {
                    id: r.customerId,
                    name: r.customerName
                },
                game: {
                    id: r.gameId,
                    name: r.gameName,
                    categoryId: r.categoryId,
                    categoryName: r.categoryName
                }
            }
        });
        return res.send(rentals);

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
        res.status(500).send(error);
    }
}
export async function returnRental(req, res) {
    const { id } = req.params;

    try {
        let newDelayFee = 10;

        const isThereRental = await db.query(` SELECT * FROM rentals WHERE id = $1 `, [id])

        if (isThereRental.rowCount === 0)
            return res.sendStatus(404)

        if (isThereRental.rows[0].returnDate !== null)
            return res.status(404).send("aluguel finalizado");

        const newReturnDate = dayjs().format("YYYY-MM-DD");

        const returnDateLimitWithoutDelays = Date.parse(
            dayjs(isThereRental.rows[0].rentDate).add(isThereRental.rows[0].daysRented, "day")
        );

        const delayedDays = Math.round(
            (Date.parse(newReturnDate) - returnDateLimitWithoutDelays) / (24 * 60 * 60 * 1000)
        );


        if (delayedDays > 0) {
            const getGame = await db.query(` 
                SELECT * FROM  games 
                WHERE id = $1`, [isThereRental.rows[0].gameId]
            )
            newDelayFee = delayedDays * getGame.rows[0].pricePerDay;

        }
        await db.query(`
            UPDATE rentals 
                SET 
                    "returnDate" = $1,
                    "delayFee" = $2
            WHERE id = $3`, [newReturnDate, newDelayFee, id]
        );
        return res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error);
    }
}
export async function deleteRental(req, res) {
    const { id } = req.params;
    try {
        const result = await db.query(`SELECT * FROM rentals WHERE id = $1`, [id]);
        if (result.rowCount === 0)
            res.sendStatus(404);
        if (result.rows[0].returnDate !== null)
            return res.status(400).send("Aluguel finalizado");

        await db.query(`DELETE FROM rentals WHERE id = $1`, [id])

        res.sendStatus(200)
    } catch (error) {
        res.status(500).send(error);
    }
}