const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "This resource is restricted to " + roles.join(", ") + " only"
            });
        }
        next();
    };
};

export default authorize;