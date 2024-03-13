const moment = require('moment');

module.exports = function (data, startDate, endDate) {
  const startOfWeek = startDate ? moment(startDate) : moment().startOf('isoWeek');
  const endOfWeek = endDate ? moment(endDate) : moment().endOf('isoWeek');

  // Filter data within the week range
  const filteredData = data.filter(item => {
    const itemDate = moment(item.orderDate);
    return itemDate.isBetween(startOfWeek, endOfWeek, null, '[]'); // '[]' includes start and end dates
  });

  // Create an array for each day of the week
  let weeklyData = [[], [], [], [], [], [], []];

  // Populate weeklyData with filtered items
  filteredData.forEach(item => {
    const itemDate = moment(item.orderDate);
    const dayIndex = itemDate.diff(startOfWeek, 'days'); // Get the index of the day in the week
    weeklyData[dayIndex].push(item);
  });

  return weeklyData;
}
