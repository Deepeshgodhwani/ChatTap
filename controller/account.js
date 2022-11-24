const User = require("../models/user");

module.exports.create = async function (req, res) {
  try {
    User.uploadedAvtar(req, res, async function (err) {
      console.log(req.file);
      console.log(req.body);
      let userr = await User.findOne({ email: req.body.email });

      if (!userr) {
        if (req.file) {
          let user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            avtar: User.path + "/" + req.file.filname,
          });
        } else {
          let user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
          });
        }

        return res.send({
          error: false,
          message: "user is created",
        });
      } else {
        return res.send({
          error: true,
          message: "username is already exists",
        });
      }
    });
  } catch (err) {
    console.log("error in verifying and creating user", err);
  }
};

module.exports.createSession = async (req, res) => {
  return res.send({
    user: req.user,
  });
};

module.exports.destroySession = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.send({
      success: true,
    });
  });
};
