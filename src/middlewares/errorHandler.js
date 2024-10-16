module.exports = (err, req, res, next) => {
  console.log('error -->', err);
  return res.status(err.statusCode || res?.errorStatusCode || 500).send({
    isError: true,
    message: err.message,
    cause: err.cause,
    body: req.body,
  });
};
