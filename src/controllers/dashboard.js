"use strict";

const e = require("express");
const Firm = require("../models/firm");
const Purchase = require("../models/purchase");
const Sale = require("../models/sale");
const sale = require("./sale");
const purchase = require("./purchase");
const { Op, fn, col } = require("sequelize");
const moment = require("moment");
const Product = require("../models/product");


async function getStatsData() {
    const endOfLastWeek = moment().subtract(1, 'weeks').endOf('isoWeek').toDate();

    // Helper function to calculate total price
    const calculateTotalPrice = (items) => items.reduce((acc, item) => acc + item.totalPrice, 0);

    // SALE
    const [allSale, salesUpToLastWeek] = await Promise.all([
        Sale.findAndCountAll({ where: { status: 2, deletedAt: null } }),
        Sale.findAll({
            where: {
                status: 2,
                deletedAt: null,
                orderDate: { [Op.lte]: endOfLastWeek }
            }
        })
    ]);

    const totalSale = calculateTotalPrice(allSale.rows);
    const totalSaleLastWeek = calculateTotalPrice(salesUpToLastWeek);
    const salePerChange = totalSaleLastWeek === 0
        ? (totalSale === 0 ? 0 : 100)
        : ((totalSale - totalSaleLastWeek) / totalSaleLastWeek) * 100;

    // PURCHASE
    const [allPurchase, purchasesUpToLastWeek] = await Promise.all([
        Purchase.findAndCountAll({ where: { deletedAt: null } }),
        Purchase.findAll({
            where: {
                deletedAt: null,
                createdAt: { [Op.lte]: endOfLastWeek }
            }
        })
    ]);

    const totalPurchase = calculateTotalPrice(allPurchase.rows);
    const totalPurchaseLastWeek = calculateTotalPrice(purchasesUpToLastWeek);
    const purchasePercChange = totalPurchaseLastWeek === 0
        ? (totalPurchase === 0 ? 0 : 100)
        : ((totalPurchase - totalPurchaseLastWeek) / totalPurchaseLastWeek) * 100;

    // PROFIT
    const totalProfit = totalSale - totalPurchase;
    const totalProfitLastWeek = totalSaleLastWeek - totalPurchaseLastWeek;
    const profitPercentageChange = totalProfitLastWeek === 0
        ? (totalProfit === 0 ? 0 : 100)
        : ((totalProfit - totalProfitLastWeek) / totalProfitLastWeek) * 100;

    return {
        sale: {
            totalSale,
            totalSaleLastWeek,
            salePerChange,
            SaleCount: allSale.count
        },
        purchase: {
            totalPurchase,
            totalPurchaseLastWeek,
            purchasePercChange,
            purchaseCount: allPurchase.count
        },
        profit: {
            totalProfit,
            totalProfitLastWeek,
            profitPercentageChange
        }
    };
}


async function getRevenueChartData() {
    const startOfYear = moment().startOf('year').toDate();
    const endOfYear = moment().endOf('year').toDate();
    const monthlySales = Array(12).fill(0);
    const monthlyPurchases = Array(12).fill(0);

    const sales = await Sale.findAll({
        where: {
            status: 2,
            deletedAt: null,
            orderDate: {
                [Op.gte]: startOfYear,
                [Op.lte]: endOfYear
            }
        }
    });

    const purchases = await Purchase.findAll({
        where: {
            deletedAt: null,
            createdAt: {
                [Op.gte]: startOfYear,
                [Op.lte]: endOfYear
            }
        }
    });

    sales.forEach(sale => {
        const month = moment(sale.orderDate).month();
        monthlySales[month] += sale.totalPrice;
    });

    purchases.forEach(purchase => {
        const month = moment(purchase.createdAt).month();
        monthlyPurchases[month] += purchase.totalPrice;
    });

    return { monthlySales, monthlyPurchases };
}

async function getSalesByCategoryData() {

    const sales = await Sale.findAll({
        where: {
            status: 2,
            deletedAt: null
        },
        attributes: [
            'ProductId',
            [fn('SUM', col('quantity')), 'totalQuantity']
        ],
        include: [
            {
                model: Product,
                attributes: ['name']
            }
        ],
        group: ['ProductId', 'Product.id'],
    });

    const productName = sales.map(sale => sale.Product.name)
    const productQuantity = sales.map(sale => sale.get('totalQuantity'))

    return { productName, productQuantity, }

}


module.exports = {
    list: async (req, res) => {


        const [stats, revenueChart, salesByCategory] = await Promise.all([
            getStatsData(),
            getRevenueChartData(),
            getSalesByCategoryData()
        ]);



        res.status(200).send({
            error: false,
            statistics: {
                stats,
                revenueChart,
                salesByCategory
            }
        });
    },


};
