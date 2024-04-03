const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const ejs = require("ejs");
const path = require("path");
const cookieSession = require("cookie-session");

const app = express();

const cookieEncryptionKey = "superKey";

app.use(
  cookieSession({
    name: "cookie-session",
    keys: [cookieEncryptionKey],
  })
);

// register regenerate & save after the cookieSession middleware initialization
app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/static", express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

mongoose
  .connect(
    `mongodb+srv://cmg981548:EgfYi5otBNhqK0Xy@cluster0.fifhkgv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    console.log("mognodb connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

// /login미들웨어 안에 authenticate 미들웨어가 또 있다.
// 그래서 authenticate 미들웨어로 가기 위해서는
// 66번째줄에 즉시 함수 실행을 해주면 된다.
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    // passport.js에서 done
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.json({ msg: info });
    }

    // passport에서 제공하는 함수 logIn
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  })(req, res, next);
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

const User = require("./models/user.model");

app.post("/signup", async (req, res) => {
  // user 객체 생성
  const user = new User(req.body);

  // db에 user 저장
  try {
    await user.save();
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
  }
});

app.listen("3000", (req, res) => {
  console.log("listening 3000");
});
