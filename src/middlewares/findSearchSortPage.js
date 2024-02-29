const { Op } = require("sequelize");

module.exports = (req, res, next) => {
  let { search, startDate, endDate, sort, page, limit, offset, showDeleted } =
    req.query;

  //? Başlangıç olarak bir boş filtre nesnesi oluşturun
  //* ?search[status]=SALER
  //! SEARCHING: URL?search[key1]=value1&search[key2]=value2
  let whereClause = {};
  let include = null;

  for (const key in search) {
    const value = search[key];
    if (['model', 'DriverId', 'capacity', 'status', 'creatorId', 'role'].includes(key)) {
      whereClause[key] = value;
    } else {
      whereClause[key] = { [Op.like]: `%${value}%` };
    }
  }
  //!tarih filtresi URL?startDate=2023-07-13&endDate=2023-10-01  tarih yıl-ay-gün formatında olmalı
  if (startDate && endDate) {
    whereClause["createdAt"] = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
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

  limit = Number(req.query?.limit);
  limit = limit > 0 ? limit : Number(process.env?.PAGE_SIZE || 20);

  page = (page > 0 ? page : 1) - 1;

  offset = Number(req.query?.offset);
  offset = offset > 0 ? offset : page * limit;

  req.getModelList = async (Model, filters = {}, include = null) => {
    let paranoid = true;

    if (showDeleted === "true" && req.user.role === 5) paranoid = false;

    whereClause = { ...whereClause, ...filters };

    return await Model.findAll({
      where:
        Object.keys(whereClause).length > 0 ? { [Op.or]: [whereClause] } : {},
      include,
      order: orderClause,
      offset,
      limit,
      paranoid,
    });
  };

  req.getModelListDetails = async (Model, filters = {}) => {
    whereClause = { ...whereClause, ...filters };

    let paranoid = true;

    if (showDeleted === "true" && req.user.role === 5) paranoid = false;

    const data = await Model.findAll({
      where:
        Object.keys(whereClause).length > 0 ? { [Op.or]: [whereClause] } : {},
      include,
      order: orderClause,
      paranoid,
    });
    let details = {
      search,
      sort,
      offset,
      limit,
      page,
      pages: {
        previous: page > 0 ? page : false,
        current: page + 1,
        next: page + 2,
        total: Math.ceil(data.length / limit),
      },
      totalRecords: data.length,
      showDeleted: showDeleted === "true" && req.user.role === 5 ? true : false,
    };
    details.pages.next =
      details.pages.next > details.pages.total ? false : details.pages.next;
    if (details.totalRecords <= limit) details.pages = false;
    return details;
  };

  next();
};
