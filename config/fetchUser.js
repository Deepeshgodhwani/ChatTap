const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const fetchUser = (req, res, next) => {
  //get user from the jwt token  and add id to req object //

  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, jwtSecret);
    req.user = data.userId;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
};

module.exports = fetchUser;
