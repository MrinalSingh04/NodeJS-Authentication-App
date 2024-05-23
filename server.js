import express from "express";
import mongoose from "mongoose";
import { User } from "./models/user.js";
import path from "path";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: "denp40rk8",
  api_key: "651914392457294",
  api_secret: "rky1FYJWVgR38wZxzDPoxFDnZOU",
});

const app = express();

app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

//show register page
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

//create user
app.post("/register", upload.single("file"), async (req, res) => {
  const file = req.file.path;
  const { name, email, password } = req.body;

  try {
    const cloudinaryRes = await cloudinary.uploader.upload(file, {
      folder: "Node_Authentication",
    });

    let user = await User.create({
      profileImg: cloudinaryRes.secure_url,
      name,
      email,
      password,
    });
    res.redirect("/");
    console.log(cloudinaryRes, name, email, password);
  } catch (error) {
    res.send("Error Occured");
  }
});

//login user
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    console.log("Getting User", user);
    if (!user) res.render("login.ejs", { msg: "User not found" });
    else if (user.password != password) {
      res.render("login.ejs", { msg: "Invalid Password" });
    } else {
      res.render("profile.ejs", { user });
    }
  } catch (error) {
    res.send("Error Occured");
  }
});

//all users
app.get("/users", async (req, res) => {
  let user = await User.find().sort({ createdAt: -1 });
  res.render("users.ejs", { user });
});

//show login page
app.get("/", (req, res) => {
  res.render("login.ejs");
});

const mongoURL = process.env.MONGODB_URL;
mongoose
  .connect(mongoURL, {
    dbName: "api_series_db",
  })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const port = 8000;
app.listen(port, () => console.log(`Server is running at port ${port}`));
