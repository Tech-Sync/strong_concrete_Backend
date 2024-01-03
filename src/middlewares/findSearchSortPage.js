
const { Op } = require('sequelize');

module.exports = (req, res, next) => {
  let { search, sort, page ,limit,offset } = req.query;

  //? Başlangıç olarak bir boş filtre nesnesi oluşturun
  //! SEARCHING: URL?search[key1]=value1&search[key2]=value2
  let whereClause = {};
  
    for (const key in search) {
        const value = search[key];
        whereClause[key] = { [Op.like]: `%${value}%` }; 
    }
  
//! SORTING: URL?sort[key1]=desc&sort[key2]=asc
  //? Sıralama ölçütleri varsa
  let orderClause = [];
    for (const key in sort) {
        const sortOrder = sort[key]; 
        orderClause.push([key, sortOrder.toUpperCase()]);
    }
  
//! PAGINATION: URL?page=1&limit=10&offset=10
 //* Sayfalama için limit ve offset değerleri(offset mongodb-sql deki skip anlamında )
//?url den gelen her değer string bu nedenle bu değerleri numberlaştırmam gerekiyor.page de yapmadım -1 zaten onu numberlaştırdı.backende page herzaman -1 dir.
 
 limit = Number(req.query?.limit)
 limit = limit > 0 ? limit : Number(process.env?.PAGE_SIZE || 20)


 page = (page > 0 ? page : 1) - 1 

 offset = Number(req.query?.offset)
 offset = offset > 0 ? offset : (page * limit)


   

  req.getModelList = async (Model) => {
    return await Model.findAll({where: Object.keys(whereClause).length > 0 ? { [Op.or]: [whereClause] } : {},
    order: orderClause,
    offset,
    limit})
    
  };

  next();
};


