import joi from "joi";

const gameSchema = joi.object({
    name: joi.string().required(),
    image: joi.string().uri().required(),
    stockTotal: joi.number().min(1).required(),
    categoryId: joi.number().required(),
    pricePerDay: joi.number().min(1).required(),
})

export async function getGames(req, res) {
    try {
        res.send("ok");
    } catch (error) {
        res.status(500).send(error);
    }
}

export async function postGame(req, res) {


    const validation = gameSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }
    try {
        res.send("ok");
    } catch (error) {
        res.status(500).send(error);
    }
}