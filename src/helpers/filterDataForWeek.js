const moment = require('moment');
const { saleStatuses } = require('../constraints/roles&status');

module.exports = function (data, startDate, endDate) {
  const startOfWeek = startDate ? moment(startDate) : moment().startOf('isoWeek');
  const endOfWeek = endDate ? moment(endDate) : moment().endOf('isoWeek');

  const dayTitles = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let weeklySchedule = dayTitles.map((title, index) => ({
    id: index + 1,
    title: title,
    date: startOfWeek.clone().add(index, 'days').format('YYYY-MM-DD'),
    orders: [] // Siparişlerin ekleneceği yer
  }));

  // Filter data within the week range
  const filteredData = data.filter(item => {
    const itemDate = moment(item.orderDate);
    return itemDate.isBetween(startOfWeek, endOfWeek, null, '[]'); // '[]' includes start and end dates
  });
  // Create an array for each day of the week
  let weeklyData = [[], [], [], [], [], []];

  // Populate weeklyData with filtered items
  filteredData.forEach(item => {
    const itemDate = moment(item.orderDate);
    const dayIndex = itemDate.diff(startOfWeek, 'days'); // Get the index of the day in the week
    weeklyData[dayIndex].push(item);
  });

  weeklyData.forEach((dayArray, index) => {
    dayArray.forEach(order => {
      const orderDate = moment(order.orderDate);
      const dayIndex = orderDate.diff(startOfWeek, 'days');

      if (dayIndex >= 0 && dayIndex < weeklySchedule.length) {
        const orderStructure = {
          projectId: index + 1,
          id: order.id,
          title: order.Firm.name, // veya başka bir alan
          description: `Product: ${order.Product.name}, Quantity: ${order.quantity}, Unit Price: ${order.unitPrice}, Location: ${order.location}`,
          date: order.orderDate,
          tags: saleStatuses[order.status]
        };

        weeklySchedule[dayIndex].orders.push(orderStructure);
      }
    });
  });

  return weeklySchedule;
}
