"use strict";

const Account = require("../models/account");
const Purchase = require("../models/purchase");

module.exports = {
  list: async (req, res) => {
    const data = await Purchase.findAndCountAll();

    res.status(200).send(data);
  },

  create: async (req, res) => {
    req.body.creatorId = req.user.id;
    const data = await Purchase.create(req.body);

    const accountData = {
      PurchaseId: data.id,
      debit: data.totalPrice,
      balance: data.totalPrice,
      FirmId: data.FirmId,
      creatorId: data.creatorId,
      updaterId: null,
    };
    const account = await Account.create(accountData);

    if (!account) throw new Error("Account table not created for some reason.");

    res.status(200).send(data);
  },

  read: async (req, res) => {
    const data = await Purchase.findByPk(req.params.id);
    if (!data) throw new Error("Purchase not found !");

    res.status(200).send(data);
  },
  update: async (req, res) => {
    req.body.updaterId = req.user.id;

    const isUpdated = await Purchase.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });

    const updatedPurchase = await Purchase.findByPk(req.params.id);
    const oldAccount = await Account.findOne({
      where: { PurchaseId: req.params.id },
    });

    const account = await Account.update(
      {
        debit: updatedPurchase.totalPrice,
        FirmId: updatedPurchase.FirmId,
        balance: updatedPurchase.totalPrice - oldAccount.credit,
      },
      { where: { PurchaseId: req.params.id } }
    );

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: updatedPurchase,
    });
  },

  delete: async (req, res) => {
    const purchase = await Purchase.findByPk(req.params.id);
    purchase.updaterId = req.user.id;
    const isDeleted = await purchase.destroy();

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: isDeleted
        ? "Purchase deleted successfuly."
        : "Purchase not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    const purchase = await Purchase.findByPk(req.params.id, {
      paranoid: false,
    });
    if (!purchase) throw new Error("Purchase not Found.");
    purchase.updaterId = req.user.id;
    const isRestored = await purchase.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "Purchase restored successfuly."
        : "Purchase not found or something went wrong.",
    });
  },
};
