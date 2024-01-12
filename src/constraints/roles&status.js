module.exports = {
  userRoles: {
    ADMIN: 5,
    SALER: 4,
    ACCOUNTANT: 3,
    PRODUCER: 2,
    DRIVER: 1,
  },
  deliveryStatuses: {
    CANCELLED: 4,
    DELIVERIED: 3,
    "ON THE WAY": 2,
    LOADING: 1,
  },
  firmStatuses: {
    SUPPLIER: 2,
    CONSUMER: 1,
  },
  productionStatuses: {
    CANCELLED: 6,
    DONE: 5,
    PRODUCED: 4,
    "VEHICLE WAITING": 3,
    "BEING PRODUCED": 2,
    PLANNED: 1,
  },
  saleStatuses: {
    REJECTED: 3,
    APPROVED: 2,
    PENDING: 1,
  },
  vehicleStatuses: {
    HOME: 1,
    LOADING: 2,
    "IN TRANSIT": 3,
    UNLOADING: 4,
    "VEHICLE IN RETURN": 5,
  },
};
