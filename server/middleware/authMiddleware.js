import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";
import Employee from "../models/providerModel.js";
import asyncHandler from 'express-async-handler';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    console.log(token, "--------------")
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded, '..............');
    console.log(token, "/////////////////////")
    let user;

    switch (decoded.role) {
      case 'user':
        user = await User.findById(decoded.user_id);
        break;
      case 'admin':
        user = await Admin.findById(decoded.admin_id);
        break;
      case 'employee':
        user = await Employee.findById(decoded.email_id);
        break;
      default:
        res.status(403);
        throw new Error("Not authorized, unknown role");
    }

    if (!user) {
      res.status(403);
      throw new Error("Not authorized, user not found");
    }

    req.user = user;
    console.log(user,'======++++++++=======')


    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});



