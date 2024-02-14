const jwt = require('jsonwebtoken')

module.exports = function(user, isRefresh = false){
    const {password, ...accessData} = user.dataValues
    const id = accessData.id
    const refreshData = { id, password}

    return {
        access: jwt.sign(accessData, process.env.ACCESS_KEY, {expiresIn: "30d"}),
        refresh: isRefresh ? null : jwt.sign(refreshData, process.env.REFRESH_KEY, {expiresIn: "90d"}) 
    }


}