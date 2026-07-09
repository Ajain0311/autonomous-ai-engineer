const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    const group = item[key];
    acc[group] = acc[group] || [];
    acc[group].push(item);
    return acc;
  }, {});

const flatten = (arr) => arr.reduce((acc, val) =>
  Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);

const unique = (arr) => [...new Set(arr)];

module.exports = { groupBy, flatten, unique };
