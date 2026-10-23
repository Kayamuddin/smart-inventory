const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "This resource is only available for " + roles.join(", "),
      });
    }
    next();
  };
};

export default authorize;
