// associations.js
const { Chat, Message, ChatUsers, ReadReceipts } = require('./chat&message');
const Delivery = require('./delivery');
const Firm = require('./firm');
const Material = require('./material');
const Product = require('./product');
const Production = require('./production');
const Purchase = require('./purchase');
const PurchaseAccount = require('./purchaseAccount');
const Sale = require('./sale');
const SaleAccount = require('./saleAccount');
const User = require('./user');
const Vehicle = require('./vehicle');


//! chat & Message & User & chatUsers & ReadReceipts
// CHAT - MESSAGE
Chat.hasMany(Message, { foreignKey: { name: 'chatId', allowNull: false } });
Message.belongsTo(Chat, { foreignKey: { name: 'chatId', allowNull: false } });

// USER - CHAT
User.hasMany(Chat, { foreignKey: 'groupAdminId', as: 'groupAdmin' });
Chat.belongsTo(User, { foreignKey: 'groupAdminId', as: 'groupAdmin' });

Chat.belongsToMany(User, { through: ChatUsers, as: 'chatUsers', foreignKey: 'chatId', otherKey: 'userId' });
User.belongsToMany(Chat, { through: ChatUsers, as: 'chatUsers', foreignKey: 'userId', otherKey: 'chatId' });

// MESSAGE - CHAT
Message.hasOne(Chat, { foreignKey: 'latestMessageId', as: 'latestMessage', constraints: false });
Chat.belongsTo(Message, { foreignKey: 'latestMessageId', as: 'latestMessage', constraints: false });

// USER - MESSAGE
User.belongsToMany(Message, { through: ReadReceipts });
Message.belongsToMany(User, { through: ReadReceipts });

// USER - MESSAGE
User.hasMany(Message, { foreignKey: { name: 'senderId', allowNull: false } });
Message.belongsTo(User, { foreignKey: { name: 'senderId', allowNull: false } });

// CHAT - CHAT_USERS
ChatUsers.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false } });
User.hasMany(ChatUsers, { foreignKey: { name: 'userId', allowNull: false } });


//!  vehicle & delivery & User
Vehicle.hasMany(Delivery);
Delivery.belongsTo(Vehicle);

// user - delivery
User.hasMany(Delivery, { foreignKey: "creatorId", as: "createdDeliveries" });
User.hasMany(Delivery, { foreignKey: "updaterId", as: "updatedDeliveries" });
Delivery.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Delivery.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

// user - vehicle
User.hasMany(Vehicle, { foreignKey: "DriverId", as: "driverVehicles" });
User.hasMany(Vehicle, { foreignKey: "creatorId", as: "createdVehicles" });
User.hasMany(Vehicle, { foreignKey: "updaterId", as: "updatedVehicles" });
Vehicle.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Vehicle.belongsTo(User, { foreignKey: "updaterId", as: "updater" });
Vehicle.belongsTo(User, { foreignKey: "DriverId", as: "driver" });

//! user - firm
User.hasMany(Firm, { foreignKey: "creatorId", as: "createdFirms" });
User.hasMany(Firm, { foreignKey: "updaterId", as: "updatedFirms" });
Firm.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Firm.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

//! user - material
User.hasMany(Material, { foreignKey: "creatorId", as: "createdMaterials" });
User.hasMany(Material, { foreignKey: "updaterId", as: "updatedMaterials" });
Material.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Material.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

//! user - account
User.hasMany(Product, { foreignKey: "creatorId", as: "createdProducts" });
User.hasMany(Product, { foreignKey: "updaterId", as: "updatedProducts" });
Product.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Product.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

//! Sale & Production & Delivery
// Sale - production
Sale.hasOne(Production);
Production.belongsTo(Sale);

Production.hasMany(Delivery);
Delivery.belongsTo(Production);

// user - production
User.hasMany(Production, { foreignKey: "creatorId", as: "createdProductions" });
User.hasMany(Production, { foreignKey: "updaterId", as: "updatedProductions" });
Production.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Production.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

//! User & Pyurchase & Material & Firm
// user - Purchase
User.hasMany(Purchase, { foreignKey: "creatorId", as: "createdPurchases" });
User.hasMany(Purchase, { foreignKey: "updaterId", as: "updatedPurchases" });
Purchase.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Purchase.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

// material - purchase
Material.hasMany(Purchase, { foreignKey: 'MaterialId' });
Purchase.belongsTo(Material, { foreignKey: 'MaterialId' });


// firm - purchase
Firm.hasMany(Purchase, { foreignKey: 'FirmId' });
Purchase.belongsTo(Firm, { foreignKey: 'FirmId' });

//! User & PurchaseAccount & Purchase & Firm 
// user - purchaseAccount
User.hasMany(PurchaseAccount, { foreignKey: "creatorId", as: "createdAccounts" });
User.hasMany(PurchaseAccount, { foreignKey: "updaterId", as: "updatedAccounts" });
PurchaseAccount.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
PurchaseAccount.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

// Purchase  - PurchaseAccount
Purchase.hasOne(PurchaseAccount, { foreignKey: 'PurchaseId' });
PurchaseAccount.belongsTo(Purchase, { foreignKey: 'PurchaseId' });

// Firm - PurchaseAccount
Firm.hasMany(PurchaseAccount, { foreignKey: 'FirmId' });
PurchaseAccount.belongsTo(Firm, { foreignKey: 'FirmId' });

//! User & Sale & Product & Firm
// Firm - sale
Firm.hasMany(Sale);
Sale.belongsTo(Firm);

// Product - sale
Product.hasMany(Sale);
Sale.belongsTo(Product);

// user - sale
User.hasMany(Sale, { foreignKey: "creatorId", as: "createdSales" });
User.hasMany(Sale, { foreignKey: "updaterId", as: "updatedSales" });
Sale.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Sale.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

//! User & SaleAccount & Sale & Firm 
// user - account
User.hasMany(SaleAccount, { foreignKey: "creatorId", as: "createdSaleAccounts", });
User.hasMany(SaleAccount, { foreignKey: "updaterId", as: "updatedSaleAccounts", });
SaleAccount.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
SaleAccount.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

// Sale  - SaleAccount
Sale.hasOne(SaleAccount);
SaleAccount.belongsTo(Sale);

// Firm - SaleAccount
Firm.hasMany(SaleAccount);
SaleAccount.belongsTo(Firm);

module.exports = {
    Chat,
    Message,
    ChatUsers,
    ReadReceipts,
    User,
    Vehicle,
    Delivery,
    Firm,
    Material,
    Product,
    Production,
    Purchase,
    PurchaseAccount,
    Sale,
    SaleAccount
};