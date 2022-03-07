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

        const isThereCPFonSystem = await db.query(`SELECT * FROM customers WHERE cpf LIKE '$1%'`, [cpf]);
        res.send(isThereCPFonSystem.rows)

    } catch (error) {
        res.status(500).send(error);
    }
}
export async function getCustomerById(req, res) {

    try {
        res.send("ok");
    } catch (error) {
        res.status(500).send(error);
    }
}
export async function postCustomer(req, res) {
    const { name, phone, cpf, birthday } = req.body;

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

    try {
        res.send("ok");
    } catch (error) {
        res.status(500).send(error);
    }
}