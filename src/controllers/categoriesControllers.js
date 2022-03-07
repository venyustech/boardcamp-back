import db from '../db.js';
import joi from "joi";

const categorySchema = joi.object({
    name: joi.string().required(),
});

export async function getCategories(req, res) {
    try {
        const result = await db.query('SELECT * FROM categories');
        res.send(result.rows);
    } catch (error) {
        res.status(500).send(error);
    }
}

export async function postCategory(req, res) {
    const { name } = req.body;

    const validation = categorySchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    try {
        const result = await db.query(`SELECT * FROM categories WHERE name = $1`, [name]);

        if (result.rowCount > 0)
            return res.status(409).send("Essa categoria já está cadastrada.");

        await db.query(`INSERT INTO categories (name) VALUES ($1)`, [name]);
        res.sendStatus(201);
    } catch (error) {
        res.status(500).send(error);
    }
}
