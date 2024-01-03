const {Vehicle} = require('../models/vehicle')

module.exports= {
    list: async(req, res)=>{
        const data = await Vehicle.findAndCountAll({paranoid: false});

        res.status(200).send(data)
    },

    create: async(req, res)=>{
        req.body.creatorId = req.user.id;
        const data = await Vehicle.create(req.body);

        res.status(200).send(data)
    },

    read: async(req, res) => {
        const data = await Vehicle.findByPk(req.params.id);
        if(!data) throw new Error("Vehicle not found!");

        res.status(200).send(data)
    },

    update: async (req, res) => {
        const isUpdated = await Vehicle.update(req.body, {
            where: {id: req.params.id},
            individualHooks: true,
        });

        res.status(202).send({
            isUpdated: Boolean(isUpdated[0]),
            data : await Vehicle.findByPk(req.params.id)
        })
    },

    delete: async(req, res) => {
        const isDeleted = await Vehicle.destroy( {where: {id: req.params.id}});

        res.status(isDeleted ? 204 : 404).send({
            error: !Boolean(isDeleted),
            message: isDeleted ? 
            "Vehicle deleted successfully" 
            : " Vehicle not found or something went wrong."
        })

    }

}