const { sequelize } = require("../configs/dbConnection");
const { Op } = require("sequelize");
const Firm = require("../models/firm");
const Material = require("../models/material");
const Product = require("../models/product");
const Purchase = require("../models/purchase");
const Sale = require("../models/sale");
const User = require("../models/user");
const crypto = require("crypto");
const moment = require("moment");
const Vehicle = require("../models/vehicle");
const models = sequelize.models;
const passwordEncrypt = require("./passEncrypt");
const Production = require("../models/production");
const SaleAccount = require("../models/saleAccount");
const Delivery = require("../models/delivery");


// common data and functions
const productNames = ["C20", "C25", "C30", "C35", "C40", "C45", "C50", "C55"];
const materialsData = [
    { STONE: 1.2, SAND: 1.3, CEMENT: 140 },
    { STONE: 1.3, SAND: 1.4, CEMENT: 150 },
    { STONE: 1.4, SAND: 1.5, CEMENT: 160 },
    { STONE: 1.5, SAND: 1.6, CEMENT: 170 },
    { STONE: 1.6, SAND: 1.7, CEMENT: 180 },
    { STONE: 1.7, SAND: 1.8, CEMENT: 190 },
    { STONE: 1.8, SAND: 1.9, CEMENT: 200 },
    { STONE: 1.9, SAND: 2.0, CEMENT: 210 },
];
function getRandomDateIn2024() {
    const start = new Date('2024-01-01T00:00:00Z').getTime();
    const end = new Date('2024-12-31T23:59:59Z').getTime();
    return new Date(start + Math.random() * (end - start)).toISOString()
}


async function deleteAllTablesData() {
    for (const modelName in models) {
        if (models.hasOwnProperty(modelName)) {
            await models[modelName].destroy({
                where: {},
                truncate: true,
                cascade: true
            });
        }
    }
    console.log("All tables' data deleted successfully!");
}

async function createUsers() {

    const zambianFirstNames = ["Chanda", "Mwansa", "Mutale", "Bwalya", "Kabwe"];
    const zambianLastNames = ["Mulenga", "Phiri", "Tembo", "Zimba", "Mumba"];

    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    const usersData = [
        {
            firstName: "Admin",
            lastName: "Admin",
            profilePic: "profilePic1.jpg",
            nrcNo: "1234567890123",
            phoneNo: "0971234567",
            address: "Lusaka, Zambia",
            role: 5,
            email: "admin@gmail.com",
            password: passwordEncrypt("Sconcrete2024.,?"),
            isActive: true,
            isVerified: true,
        },
        ...Array.from({ length: 5 }, (_, i) => {
            const firstName = getRandomElement(zambianFirstNames);
            const lastName = getRandomElement(zambianLastNames);
            return {
                firstName: firstName,
                lastName: lastName,
                profilePic: `profilePic${i + 2}.jpg`,
                nrcNo: `12345678901${i + 2}`,
                phoneNo: `097123456${i + 2}`,
                address: `Lusaka, Zambia`,
                role: 1,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@gmail.com`,
                password: passwordEncrypt("Sconcrete2024.,?"),
                isActive: true,
                isVerified: true,
            };
        }),
        // Two users for each of the other roles (2, 3, 4)
        ...[2, 3, 4].flatMap(role =>
            Array.from({ length: 2 }, (_, i) => {
                const firstName = getRandomElement(zambianFirstNames);
                const lastName = getRandomElement(zambianLastNames);
                return {
                    firstName: firstName,
                    lastName: lastName,
                    profilePic: `profilePic${role}${i + 1}.jpg`,
                    nrcNo: `1234567890${role}${i + 1}`,
                    phoneNo: `09712345${role}${i + 1}`,
                    address: `Lusaka, Zambia`,
                    role: role,
                    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${role}${i + 1}@gmail.com`,
                    password: passwordEncrypt("Sconcrete2024.,?"),
                    isActive: true,
                    isVerified: true,
                };
            })
        ),
    ];


    const res = await User.bulkCreate(usersData);

    if (res) console.log('Users createed successfully!');
    else console.log('Someting went wrong with Users creation!');

}

async function createFirms() {

    const firmsData = [
        {
            name: "Lusaka Cement",
            address: "Plot 23, Great East Road, Lusaka",
            phoneNo: "+260972222111",
            tpinNo: "123456789",
            email: "info@lusakacement.com",
            status: 1,
            creatorId: 1,
        },
        {
            name: "Copperbelt Construction",
            address: "Plot 45, Ndola Industrial Area, Ndola",
            phoneNo: "+260973333222",
            tpinNo: "234567890",
            email: "contact@copperbeltconstruct.com",
            status: 2,
            creatorId: 1,
        },
        {
            name: "Choma Builders",
            address: "Plot 19, Independence Avenue, Choma",
            phoneNo: "+260974444333",
            tpinNo: "345678901",
            email: "sales@chomabuilders.com",
            status: 1,
            creatorId: 1,
        },
        {
            name: "Kitwe Steel",
            address: "Plot 67, Freedom Park, Kitwe",
            phoneNo: "+260975555444",
            tpinNo: "456789012",
            email: "kitwesteel@zambia.com",
            status: 1,
            creatorId: 1,
        },
        {
            name: "Solwezi Mining Supplies",
            address: "Plot 34, Lumwana Road, Solwezi",
            phoneNo: "+260976666555",
            tpinNo: "567890123",
            email: "mining@solwezisupplies.com",
            status: 2,
            creatorId: 1,
        },
        {
            name: "Mongu Lumber",
            address: "Plot 78, Kalabo Road, Mongu",
            phoneNo: "+260977777666",
            tpinNo: "678901234",
            email: "info@mongulumber.com",
            status: 1,
            creatorId: 1,
        },
        {
            name: "Livingstone Quarries",
            address: "Plot 56, Mosi-Oa-Tunya Road, Livingstone",
            phoneNo: "+260978888777",
            tpinNo: "789012345",
            email: "contact@livingstonequarries.com",
            status: 2,
            creatorId: 1,
        },
        {
            name: "Chipata Cement",
            address: "Plot 32, Chipata Main Road, Chipata",
            phoneNo: "+260979999888",
            tpinNo: "890123456",
            email: "chipatacement@zambia.com",
            status: 1,
            creatorId: 1,
        },
        {
            name: "Kasama Bricks",
            address: "Plot 44, Kasama Industrial, Kasama",
            phoneNo: "+260971111222",
            tpinNo: "901234567",
            email: "kasamabricks@zambia.com",
            status: 2,
            creatorId: 1,
        },
        {
            name: "Mbala Hardware",
            address: "Plot 21, Lake Tanganyika Road, Mbala",
            phoneNo: "+260972222333",
            tpinNo: "012345678",
            email: "info@mbalahardware.com",
            status: 1,
            creatorId: 1,
        }
    ];

    const res = await Firm.bulkCreate(firmsData)

    if (res) console.log('Firms createed successfully!');
    else console.log('Someting went wrong with Firms creation!');
}

async function createMaterials() {

    const materialsData = [
        { name: "cement", unitType: "kg", creatorId: 1 },
        { name: "stone", unitType: "tone", creatorId: 1 },
        { name: "sand", unitType: "tone", creatorId: 1 },
    ];

    const res = await Material.bulkCreate(materialsData)

    if (res) console.log('Materials createed successfully!');
    else console.log('Someting went wrong with Materials creation!');
}

async function createPurchases() {
    const purchasesData = [];

    const totalQuantities = {
        sand: 900,
        stone: 900,
        cement: 2000,
    };

    const firms = await Firm.findAll({ where: { status: 2 } });
    const firmIds = firms.map(firm => firm.id);

    const materialIds = {
        sand: 3,
        stone: 2,
        cement: 1,
    };

    const unitPriceRanges = {
        sand: { min: 100, max: 220 },
        stone: { min: 110, max: 240 },
        cement: { min: 200, max: 270 },
    };

    function getRandomUnitPrice(min, max) {
        return parseFloat((Math.random() * (max - min) + min).toFixed(2));
    }

    function calculateTotalPrice(quantity, unitPrice) {
        return parseFloat((quantity * unitPrice).toFixed(2));
    }

    function distributeQuantities(total, firms) {
        const quantities = [];
        let remaining = total;
        for (let i = 0; i < firms.length - 1; i++) {
            const quantity = Math.floor(Math.random() * (remaining / (firms.length - i)));
            quantities.push(quantity);
            remaining -= quantity;
        }
        quantities.push(remaining);
        return quantities;
    }

    const sandQuantities = distributeQuantities(totalQuantities.sand, firmIds);
    const stoneQuantities = distributeQuantities(totalQuantities.stone, firmIds);
    const cementQuantities = distributeQuantities(totalQuantities.cement, firmIds);

    firmIds.forEach((firmId, index) => {
        const sandUnitPrice = getRandomUnitPrice(unitPriceRanges.sand.min, unitPriceRanges.sand.max);
        const stoneUnitPrice = getRandomUnitPrice(unitPriceRanges.stone.min, unitPriceRanges.stone.max);
        const cementUnitPrice = getRandomUnitPrice(unitPriceRanges.cement.min, unitPriceRanges.cement.max);

        purchasesData.push({
            FirmId: firmId,
            MaterialId: materialIds.sand,
            quantity: sandQuantities[index],
            unitPrice: sandUnitPrice,
            totalPrice: calculateTotalPrice(sandQuantities[index], sandUnitPrice),
            createdAt: getRandomDateIn2024(),
        });

        purchasesData.push({
            FirmId: firmId,
            MaterialId: materialIds.stone,
            quantity: stoneQuantities[index],
            unitPrice: stoneUnitPrice,
            totalPrice: calculateTotalPrice(stoneQuantities[index], stoneUnitPrice),
            createdAt: getRandomDateIn2024(),
        });

        purchasesData.push({
            FirmId: firmId,
            MaterialId: materialIds.cement,
            quantity: cementQuantities[index],
            unitPrice: cementUnitPrice,
            totalPrice: calculateTotalPrice(cementQuantities[index], cementUnitPrice),
            createdAt: getRandomDateIn2024(),
        });
    });

    const res = await Purchase.bulkCreate(purchasesData);

    if (res) console.log('Purchases created successfully!');
    else console.log('Something went wrong with Purchases creation!');
}

async function createProducts() {

    const productsData = [];

    function calculatePrice(materials) {
        return (materials.STONE * 100 + materials.SAND * 100 + materials.CEMENT).toFixed(2);
    }

    productNames.forEach((name, index) => {
        const materials = materialsData[index];
        const price = calculatePrice(materials);
        productsData.push({
            name,
            price,
            materials,
        });
    });

    const res = await Product.bulkCreate(productsData)

    if (res) console.log('Products createed successfully!');
    else console.log('Someting went wrong with Products creation!');
}

async function createSales() {


    const salesData = [];

    const firms = await Firm.findAll({ where: { status: 1 } });
    const firmIds = firms.map(firm => firm.id);
    const products = await Product.findAll();
    const productIds = products.map(product => product.id);

    function getRandomDateIn2024() {
        const start = new Date('2024-01-01T00:00:00Z').getTime();
        const end = new Date('2024-12-31T23:59:59Z').getTime();
        return new Date(start + Math.random() * (end - start)).toISOString().split('T')[0];
    }

    function calculateTotalPrice(quantity, unitPrice, otherCharges, discount) {
        return (quantity * unitPrice + otherCharges - discount).toFixed(2);
    }

    for (let i = 0; i < 8; i++) {
        const FirmId = firmIds[Math.floor(Math.random() * firmIds.length)];
        const ProductId = productIds[Math.floor(Math.random() * productIds.length)];
        const quantity = Math.floor(Math.random() * 10) + 1;
        const otherCharges = Math.floor(Math.random() * 100);
        const discount = Math.floor(Math.random() * 50);
        const requestedDate = getRandomDateIn2024();
        const sideContact = `+097-088-229-549`;
        const status = 2;
        const location = "Makeni, Kasama Road";

        const existingOrders = await Sale.findAll({ where: { orderDate: requestedDate } });
        const orderNumber = existingOrders.length + 1;

        const product = await Product.findByPk(ProductId);
        const unitPrice = product.price;
        const totalPrice = calculateTotalPrice(quantity, unitPrice, otherCharges, discount);

        salesData.push({
            FirmId,
            ProductId,
            status,
            location,
            quantity,
            otherCharges,
            unitPrice,
            totalPrice,
            discount,
            requestedDate,
            orderDate: requestedDate,
            sideContact,
            orderNumber,
            creatorId: 1,
        });
    }

    const res = await Sale.bulkCreate(salesData)


    if (res) {
        console.log('line 407 res-->', res);
        for (const sale of res) {
            const prevOrderNumber = sale.dataValues.orderNumber;
            await Sale.update({ orderNumber: sequelize.literal('"orderNumber" - 1') }, {
                where: {
                    orderDate: sale.dataValues.orderDate,
                    orderNumber: { [Op.gt]: prevOrderNumber },
                }
            });
            // console.log('sale id ', sale.dataValues.id);
            // console.log('sale', sale);
            const productionData = {
                SaleId: sale.dataValues.id,
                creatorId: 1,
                status: 4
            };

            const createdProduction = await Production.create(productionData);
            // console.log(createdProduction);
            const vehicles = await Vehicle.findAll();
            const randomIndex = Math.floor(Math.random() * 5) + 1;
            const selectedVehicle = vehicles[randomIndex];
            // console.log('selectedVehicle', selectedVehicle);
            const vehicleId = selectedVehicle?.dataValues?.id;
            // console.log('vehicleId', vehicleId);

            await Delivery.create({
                ProductionId: createdProduction.id,
                VehicleId: vehicleId,
                creatorId: 1,
                status: 4
            });

            const saleAccData = {
                SaleId: sale.dataValues.id,
                creatorId: 1
            };

            const data = await SaleAccount.create(saleAccData);
            // console.log(data);

        }
        console.log('Sales, Production and Sale Account created successfully!');

    }
    else console.log('Someting went wrong with Sales creation!');

}

async function createVehicles() {
    const drivers = await User.findAll({ where: { role: 1 } });

    const vehiclesData = drivers.map((driver, index) => {
        return {
            DriverId: driver.id,
            plateNumber: `BAK0${index + 1}`,
            model: 2010 + index,
            capacity: Math.floor(Math.random() * (13 - 6 + 1)) + 6,
            status: 1,
        };
    });

    const res = await Vehicle.bulkCreate(vehiclesData);
    if (res) console.log('Vehicles created successfully!');
    else console.log('Something went wrong with Vehicles creation!');

}






module.exports = async function createDatabases() {


    await Promise.all([
        createUsers(),
        createFirms(),
        createMaterials(),
        createPurchases(),
        createProducts(),
        createSales(),
        createVehicles(),
        createSales()
    ]);

    // deleteAllTablesData()
}

