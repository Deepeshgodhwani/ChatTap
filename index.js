const express = require("express");
const port = 7000;
const db = require("./config/mongoos");
const app = express();
const localPassport = require("./config/passport-Local");
const cookieParser = require("cookie-parser");
const passport = require("passport");
// USED FOR SESSION COOKIE //
const session = require("express-session");
const mongoStore = require("connect-mongodb-session")(session);

app.use(express.urlencoded());
app.use(cookieParser());

app.use(
  session({
    name: "chat app",
    // its incomplete now
    secret: "dishkyayu",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxage: 24 * 60 * 60 * 1000,
    },
    store: new mongoStore(
      {
        mongooseConnection: db,
        autoRemove: "disabled",
      },
      function (err) {
        console.log(err || "connect mongodb setup ok");
      }
    ),
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

app.use("/", require("./routes"));

app.listen(port, function (err) {
  if (err) {
    console.log("error in running server", port);
  } else {
    console.log("server is running succefully on port:", port);
  }
});
