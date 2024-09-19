module.exports = (err, req, res, next) => {
  console.log('error -->', err);
  return res.status(res?.errorStatusCode || 400).send({
    error: true,
    message: err.message,
    cause: err.cause,
    body: req.body,
  });
};
