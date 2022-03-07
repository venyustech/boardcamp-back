import db from '../db.js';
import joi from "joi";

const gameSchema = joi.object({
    name: joi.string().required(),
    image: joi.string().uri().required(),
    stockTotal: joi.number().min(1).required(),
    categoryId: joi.number().required(),
    pricePerDay: joi.number().min(1).required(),
})

export async function getGames(req, res) {
    const { name } = req.query;
    try {
        if (name) {
            const result = await db.query(`
                SELECT games.*, categories.name AS "categoryName" FROM games
                JOIN categories 
                    ON games."categoryId" = categories.id
                WHERE name LIKE $1`, [`${name}%`]
            );

            return res.send(result.rows);
        }

        const result = await db.query(`
        SELECT games.*, categories.name AS "categoryName" FROM games
            JOIN categories 
                ON games."categoryId" = categories.id
        `);

        if (result.rowCount === 0)
            return res.status(400).send("Não há jogos");

        res.send(result.rows);
    } catch (error) {
        res.status(500).send(error);
    }
}

export async function postGame(req, res) {
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

    const validation = gameSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }
    try {
        const isThereGame = await db.query(`SELECT * FROM games WHERE name = $1`, [name]);
        if (isThereGame.rowCount > 0)
            return res.status(409).send("Jogo já existente");

        const isThereCategoryId = await db.query(`SELECT * FROM categories WHERE id=$1`, [categoryId]);
        if (isThereCategoryId.rowCount === 0)
            return res.status(400).send("categoryId não existente");

        await db.query(
            `INSERT INTO games
                (name, image, "stockTotal", "categoryId", "pricePerDay")
            VALUES
                ($1, $2, $3, $4, $5)`, [name, image, stockTotal, categoryId, pricePerDay]
        );
        res.status(201).send("OK");
    } catch (error) {
        res.status(500).send(error);
    }
}