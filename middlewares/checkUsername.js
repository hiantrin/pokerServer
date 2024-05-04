const checkUsername = (req, res, next) => {
    if (req.body?.username && req.body?.userType && req.body?.userType == "guest") {
        next()
    } else {
        res.status(400).send("informations required");
        return;
    }
};
export default checkUsername ;