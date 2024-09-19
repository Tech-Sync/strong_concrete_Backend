const { sequelize } = require("../configs/dbConnection");
const Firm = require("../models/firm");
const Material = require("../models/material");
const Purchase = require("../models/purchase");
const User = require("../models/user");
const crypto = require("crypto");
const moment = require("moment");
const models = sequelize.models;

const usersData = [
    {
        firstName: "Chipo",
        lastName: "Mwanza",
        profilePic: "https://example.com/pic1.jpg",
        nrcNo: "1234567890",
        phoneNo: "0971234567",
        address: "Plot 12, Lusaka",
        role: 1,
        email: "chipo.mwanza@gmail.com",
        password: "Sconcrete2024.,?",
        isActive: true,
        isVerified: true,
        emailToken: crypto.randomBytes(64).toString("hex"),
    },
    {
        firstName: "Mulenga",
        lastName: "Banda",
        profilePic: "https://example.com/pic2.jpg",
        nrcNo: "1234567891",
        phoneNo: "0961234567",
        address: "Plot 45, Kitwe",
        role: 2,
        email: "mulenga.banda@gmail.com",
        password: "Sconcrete2024.,?",
        isActive: true,
        isVerified: true,
        emailToken: crypto.randomBytes(64).toString("hex"),
    },
    {
        firstName: "Mwansa",
        lastName: "Kalunga",
        profilePic: "https://example.com/pic3.jpg",
        nrcNo: "1234567892",
        phoneNo: "0951234567",
        address: "Plot 32, Ndola",
        role: 3,
        email: "mwansa.kalunga@gmail.com",
        password: "Sconcrete2024.,?",
        isActive: true,
        isVerified: true,
        emailToken: crypto.randomBytes(64).toString("hex"),
    },
    {
        firstName: "Tafadzwa",
        lastName: "Phiri",
        profilePic: "https://example.com/pic4.jpg",
        nrcNo: "1234567893",
        phoneNo: "0972234567",
        address: "Plot 21, Chingola",
        role: 4,
        email: "tafadzwa.phiri@gmail.com",
        password: "Sconcrete2024.,?",
        isActive: true,
        isVerified: true,
        emailToken: crypto.randomBytes(64).toString("hex"),
    },
    {
        firstName: "Zanele",
        lastName: "Ngoma",
        profilePic: "https://example.com/pic5.jpg",
        nrcNo: "1234567894",
        phoneNo: "0963234567",
        address: "Plot 8, Livingstone",
        role: 1,
        email: "zanele.ngoma@gmail.com",
        password: "Sconcrete2024.,?",
        isActive: true,
        isVerified: true,
        emailToken: crypto.randomBytes(64).toString("hex"),
    },
    {
        firstName: "Kabaso",
        lastName: "Tembo",
        profilePic: "https://example.com/pic6.jpg",
        nrcNo: "1234567895",
        phoneNo: "0954234567",
        address: "Plot 55, Mufulira",
        role: 1,
        email: "kabaso.tembo@gmail.com",
        password: "Sconcrete2024.,?",
        isActive: true,
        isVerified: true,
        emailToken: crypto.randomBytes(64).toString("hex"),
    },
    {
        firstName: "Chanda",
        lastName: "Nkandu",
        profilePic: "https://example.com/pic7.jpg",
        nrcNo: "1234567896",
        phoneNo: "0975234567",
        address: "Plot 14, Solwezi",
        role: 2,
        email: "chanda.nkandu@gmail.com",
        password: "Sconcrete2024.,?",
        isActive: true,
        isVerified: true,
        emailToken: crypto.randomBytes(64).toString("hex"),
    },
    {
        firstName: "Mable",
        lastName: "Zimba",
        profilePic: "https://example.com/pic8.jpg",
        nrcNo: "1234567897",
        phoneNo: "0966234567",
        address: "Plot 23, Kasama",
        role: 1,
        email: "mable.zimba@gmail.com",
        password: "Sconcrete2024.,?",
        isActive: true,
        isVerified: true,
        emailToken: crypto.randomBytes(64).toString("hex"),
    },
    {
        firstName: "Kasonde",
        lastName: "Musonda",
        profilePic: "https://example.com/pic9.jpg",
        nrcNo: "1234567898",
        phoneNo: "0957234567",
        address: "Plot 89, Chipata",
        role: 4,
        email: "kasonde.musonda@gmail.com",
        password: "Sconcrete2024.,?",
        isActive: true,
        isVerified: true,
        emailToken: crypto.randomBytes(64).toString("hex"),
    },
    {
        firstName: "Bwalya",
        lastName: "Mukuka",
        profilePic: "https://example.com/pic10.jpg",
        nrcNo: "1234567899",
        phoneNo: "0978234567",
        address: "Plot 67, Mongu",
        role: 4,
        email: "bwalya.mukuka@gmail.com",
        password: "Sconcrete2024.,?",
        isActive: true,
        isVerified: true,
        emailToken: crypto.randomBytes(64).toString("hex"),
    },
];

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

const materialsData = [
    { name: "cement", unitType: "kg", creatorId: 1 },
    { name: "stone", unitType: "tone", creatorId: 1 },
    { name: "sand", unitType: "tone", creatorId: 1 },
];

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

    const res = await User.bulkCreate(usersData);

    if (res) console.log('Users createed successfully!');
    else console.log('Someting went wrong with Users creation!');

}

async function createFirms() {
    const res = await Firm.bulkCreate(firmsData)

    if (res) console.log('Firms createed successfully!');
    else console.log('Someting went wrong with Firms creation!');
}

async function createMaterials() {
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

    const firmIds = [2, 5, 7, 9];
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
        return (Math.random() * (max - min) + min).toFixed(2);
    }

    function getRandomDateIn2024() {
        const start = new Date('2024-01-01T00:00:00Z').getTime();
        const end = new Date('2024-12-31T23:59:59Z').getTime();
        return new Date(start + Math.random() * (end - start)).toISOString();
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
        purchasesData.push({
            FirmId: firmId,
            MaterialId: materialIds.sand,
            quantity: sandQuantities[index],
            unitPrice: getRandomUnitPrice(unitPriceRanges.sand.min, unitPriceRanges.sand.max),
            createdAt: getRandomDateIn2024(),
        });

        purchasesData.push({
            FirmId: firmId,
            MaterialId: materialIds.stone,
            quantity: stoneQuantities[index],
            unitPrice: getRandomUnitPrice(unitPriceRanges.stone.min, unitPriceRanges.stone.max),
            createdAt: getRandomDateIn2024(),
        });

        purchasesData.push({
            FirmId: firmId,
            MaterialId: materialIds.cement,
            quantity: cementQuantities[index],
            unitPrice: getRandomUnitPrice(unitPriceRanges.cement.min, unitPriceRanges.cement.max),
            createdAt: getRandomDateIn2024(),
        });
    });


    const res = await Purchase.bulkCreate(purchasesData)

    if (res) console.log('Purchases createed successfully!');
    else console.log('Someting went wrong with Purchases creation!');

}




module.exports = async function createDatabases() {
    // await createUsers()
    // await createFirms()
    // await createMaterials()
    // await createPurchases()


    // deleteAllTablesData()
}

