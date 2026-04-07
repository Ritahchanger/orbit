const attachBusiness = (req, res, next) => {
  if (req.user) {
    req.businessId = req.user.businessId;
  }
  next();
};

module.exports = { attachBusiness };
