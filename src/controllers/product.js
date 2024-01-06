"use strict";

const {Product} = require('../models/product')

module.exports = {
    list: async (req, res) => {
        const data = await Product.findAndCountAll({paranoid: false})

        res.status(200).send(data)
    },

    create: async (req, res) => {
        req.body.creatorId = req.user.id
        const data = await Product.create(req.body)

        res.status(200).send(data)
    },

    read: async (req, res) => {
        const data = await Product.findByPk(req.params.id)
        if (!data) throw new Error("Product not found!")

        res.status(200).send(data)
    },

    update: async (req, res) => {
        const isUpdated = await Product.update(req.body, {
            where: {id: req.params.id}, individualHooks: true,
        });

        res.status(202).send({
            isUpdated: Boolean(isUpdated[0]), data: await Product.findByPk(req.params.id)
        })
    },

    delete: async (req, res) => {
        const isDeleted = await Product.destroy({where: {id: req.params.id}});

        res.status(isDeleted ? 204 : 404).send({
            error: !Boolean(isDeleted),
            message: isDeleted ? "Product deleted succesfully" : "Product not found or something went wrong."
        })
    }}