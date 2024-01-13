module.exports = {
  userRoles: {
    DRIVER: 1,
    PRODUCER: 2,
    ACCOUNTANT: 3,
    SALER: 4,
    ADMIN: 5,
  },
  deliveryStatuses: {
    LOADING: 1,
    "ON THE WAY": 2,
    DELIVERIED: 3,
    DONE: 4,
    CANCELLED: 5,
  },
  vehicleStatuses: {
    HOME: 1,
    LOADING: 2,
    "ON THE WAY": 3,
    ARRIVED: 4,
    "VEHICLE IN RETURN": 5,
  },
  firmStatuses: {
    CONSUMER: 1,
    SUPPLIER: 2,
  },
  productionStatuses: {
    PLANNED: 1,
    "BEING PRODUCED": 2,
    "WAITING VEHICLE": 3,
    PRODUCED: 4,
    CANCELLED: 5,
    "INSUFFICIENT MATERIAL": 6,
  },
  saleStatuses: {
    PENDING: 1,
    APPROVED: 2,
    REJECTED: 3,
  },
};
