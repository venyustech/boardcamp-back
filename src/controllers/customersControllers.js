import joi from "joi";
import db from "../db.js";

const customerSchema = joi.object({
    name: joi.string().required(),
    phone: joi.string().pattern(/^[0-9]{11}$/).required(),
    cpf: joi.string().pattern(/^[0-9]{11}$/).required(),
    birthday: joi.string().pattern(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
})

export async function getCustomers(req, res) {
    const { cpf } = req.query;

    try {
        if (!cpf) {
            const result = await db.query(`SELECT * FROM customers`);
            return res.send(result.rows);
        }

        const isThereCPFonSystem = await db.query(`SELECT * FROM customers WHERE cpf LIKE $1`, [`${cpf}%`]);
        res.send(isThereCPFonSystem.rows)

    } catch (error) {
        res.status(500).send(error);
    }
}
export async function getCustomerById(req, res) {
    const { id } = req.params;
    try {
        const result = await db.query(`SELECT * FROM customers WHERE id = $1`, [id]);
        if (result.rowCount === 0)
            return res.status(404).send("id não existente");
        res.send(result.rows[0]);

    } catch (error) {
        res.status(500).send(error);
    }
}
export async function postCustomer(req, res) {
    const { name, phone, cpf, birthday } = req.body;

    const validation = customerSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    try {
        const isThereCPF = await db.query(` SELECT * FROM customers WHERE cpf=$1`, [cpf]);
        if (isThereCPF.rowCount > 0)
            return res.status(409).send("cpf já existente");

        await db.query(` 
        INSERT INTO customers
            (name, phone, cpf, birthday ) VALUES ($1, $2, $3, $4)`, [name, phone, cpf, birthday])
        return res.status(201).send("OK");
    } catch (error) {
        res.status(500).send(error);
    }
}
export async function putCustomer(req, res) {
    const { name, phone, cpf, birthday } = req.body;
    const { id } = req.params;

    const validation = customerSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    try {
        const findCustomerId = await db.query(` SELECT * FROM customers WHERE id = $1`, [id]);

        if (findCustomerId.rows[0].cpf !== 0) {
            const isThereCPF = await db.query(`SELECT * FROM customers WHERE cpf = $1`, [cpf]);
            if (isThereCPF.rowCount > 0)
                return res.status(409).send("cpf já existente");
        }

        await db.query(`
            UPDATE customers 
                SET name = $1, phone = $2, cpf = $3, birthday = $4 
            WHERE id = $5`, [name, phone, cpf, birthday, id]
        );
        res.sendStatus(201);
    } catch (error) {
        res.status(500).send(error);
    }
}