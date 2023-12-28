"use strict";

const User = require("../models/user");

module.exports = {
  list: async (req, res) => {
    console.log(req.user);
    const data = await User.findAndCountAll();
    res.status(200).send({
      result: data,
    });
  },

  create: async (req, res) => {
    const data = await User.create(req.body);
    res.status(201).send({
      data,
    });
  },

  read: async (req, res) => {
    const data = await User.findByPk(req.params.id);
    res.status(200).send({
      data,
    });
  },
  update: async (req, res) => {
    const isUpdated = await User.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });
    // isUpdated return: [ 1 ] or [ 0 ]
    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await User.findByPk(req.params.id),
    });
  },
  delete: async (req, res) => {
    const isDeleted = await User.destroy({ where: { id: req.params.id } });
    res.status(isDeleted ? 204 : 404).send({
      error: Boolean(isDeleted),
    });
  },
};
