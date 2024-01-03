const {Vehicle} = require('../models/vehicle')

module.exports= {
    list:async(req, res)=>{
        const data = await Vehicle.findAndCountAll({paranoid: false});

        res.status(200).send(data)
    },

    create: {

    },

    read:{

    },

    update:{

    },

    delete:{

    }

}