const Firm = require("./firm");
const User = require("./user");

// user - firm
User.hasMany(Firm, { foreignKey: "creatorId", as: "createdFirms" });
User.hasMany(Firm, { foreignKey: "updaterId", as: "updatedFirms" });
Firm.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Firm.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

module.exports = { User, Firm };
