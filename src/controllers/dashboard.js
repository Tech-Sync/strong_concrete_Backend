"use strict";

const e = require("express");
const Firm = require("../models/firm");
const Purchase = require("../models/purchase");
const Sale = require("../models/sale");
const sale = require("./sale");
const purchase = require("./purchase");
const { Op } = require("sequelize");
const moment = require("moment");


module.exports = {
    list: async (req, res) => {
        /* 
            #swagger.tags = ['Firm']
            #swagger.summary = 'List All Firms'
            #swagger.description = `You can send query with endpoint for search[], sort[], page and limit.
              <ul> Examples:
                  <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                  <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                  <li>URL/?<b>page=2&limit=1</b></li>
              </ul>
            `
            #swagger.parameters['showDeleted'] = {
            in: 'query',
            type: 'boolean',
            description:'Send true to show deleted data as well, default value is false'
          }
        */
        const endOfLastWeek = moment().subtract(1, 'weeks').endOf('isoWeek').toDate()


        /* SALE */
        const allSale = await Sale.findAndCountAll({ where: { status: 2, deletedAt: null } });

        const totalSaleAmount = allSale.rows.reduce((acc, sale) => {
            return acc + sale.totalPrice;
        }, 0)


        const salesUpToLastWeek = await Sale.findAll({
            where: {
                status: 2,
                deletedAt: null,
                orderDate: { [Op.lte]: endOfLastWeek }
            }
        })

        const totalSaleAmountUpToLastWeek = salesUpToLastWeek.reduce((acc, sale) => {
            return acc + sale.totalPrice;
        }, 0);


        /* PURCHASE */
        const allPurchase = await Purchase.findAndCountAll({ whewe: { deletedAt: null } });

        const totalPurchaseAmount = allPurchase.rows.reduce((acc, purchase) => {
            return acc + purchase.totalPrice;
        }, 0)

        const purchasesUpToLastWeek = await Purchase.findAll({
            where: {
                deletedAt: null,
                createdAt: { [Op.lte]: endOfLastWeek }
            }
        })

        const totalPurchasesAmountUpToLastWeek = purchasesUpToLastWeek.reduce((acc, purchase) => {
            return acc + purchase.totalPrice;
        }, 0);



        res.status(200).send({
            error: false,
            statistics: {
                stats: {
                    sale: {
                        // allSale,
                        totalSaleAmount,
                        totalNumberSale: allSale.count,
                        totalSaleAmountUpToLastWeek
                    },
                    purchase: {
                        // allPurchase,
                        totalPurchaseAmount,
                        totalNumberPurchase: allPurchase.count,
                        totalPurchasesAmountUpToLastWeek
                    },
                    totalProfit: totalSaleAmount - totalPurchaseAmount
                }
                
            }
        });
    },


};
