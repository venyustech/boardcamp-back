import joi from "joi";

const rentalSchema = joi.object({
    customerId: joi.number().required(),
    gameId: joi.number().required(),
    daysRented: joi.number().required()
})

export async function getRentals(req, res) {
    try {
        res.sendStatus("ok")

    } catch (error) {
        res.status(500).send(error);
    }
}
export async function postRental(req, res) {
    try {
        res.sendStatus("ok")

    } catch (error) {
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