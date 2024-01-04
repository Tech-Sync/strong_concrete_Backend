const {Production} = require('../models/production')

module.exports = {
    list: async(req, res) => {
        const data = await Production.findAndCountAll({paranoid: false})

        res.status(200).send(data)
    },

    create: async(req, res) => {
        req.body.creatorId = req.user.id
        const data = await Production.create(req.body)

        res.status(200).send(data)
    },

    read: async(req, res) => {
        const data = await Production.findByPk(req.params.id)
        if(!data) throw new Error("Production not found!")

        res.status(200).send(data)
    },

    update: async(req, res) => {
        const isUpdated = await Production.update(req.body, {
            where: {id: req.params.id},
            individualHooks: true, 
        });

        res.status(202).send({
            isUpdated: Boolean(isUpdated[0]),
            data: await Production.findByPk(req.params.id)
        })
    },

    delete: async (req, res) => {
        const isDeleted =await Production.destroy({where: {id: req.params.id}});

        res.status(isDeleted ? 204 : 404).send({
            error: !Boolean(isDeleted),
            message: isDeleted
            ? "Production deleted succesfully"
            : "Production not found or something went wrong."
        })
    }




}