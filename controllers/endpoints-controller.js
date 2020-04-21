const { fetchEndpoints } = require("../models/endpoints-model");

const getEndpoints = (req, res, next) => {
  const endpoints = fetchEndpoints();
  res.status(200).send(endpoints);
};

module.exports = { getEndpoints };
