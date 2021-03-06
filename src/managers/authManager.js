const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const User = require('../models/User.model.js');
const authHelpers = require('../helpers/auth_helpers');
const redisHelpers = require('../helpers/redis_helpers');
const passwordHashRounds = 10;

const createNewUser = (email, username, password) => {
  const user = new User({
    email,
    username,
    password,
  });
  return user;
};

const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, passwordHashRounds);
  return hashedPassword;
};

const comparePasswords = async (credentialsPassword, dbUserPassword) => {
  const result = await bcrypt.compare(credentialsPassword, dbUserPassword);
  return result;
};

const login = async (req, res) => {
  const credentials = req.body;
  const dbUser = await User.findOne({ email: credentials.email });
  if (!dbUser) {
    return res.status(httpStatus.NOT_FOUND).json({
      data: null,
      errors: ['User not found!'],
    });
  }
  const isPasswordsMatch = await comparePasswords(credentials.password, dbUser.password);
  if (isPasswordsMatch) {
    const accessToken = authHelpers.createToken();
    await redisHelpers.writeToken(accessToken, dbUser);
    return res.status(httpStatus.OK).json({
      data: { accessToken },
      errors: [],
    });
  }
  return res.status(httpStatus.UNAUTHORIZED).json({
    data: null,
    errors: ['Password doesnt match!'],
  });
};

const register = async (req, res) => {
  const credentials = req.body;
  const dbUser = await User.findOne({ email: credentials.email });
  if (dbUser) {
    return res.status(httpStatus.CONFLICT).json({
      data: null,
      errors: ['Email address is already in use!'],
    });
  }
  const hashedPassword = await hashPassword(credentials.password);
  const newUser = createNewUser(credentials.email, credentials.username, hashedPassword)
    .save()
    .then(() => res.status(httpStatus.CREATED).json({
      data: null,
      errors: ['User created!'],
    }));
};

const logout = (req, res) => {
  redisHelpers.deleteToken(res.locals.accessToken);
  return res.status(httpStatus.OK).json({
    data: null,
    errors: [],
  });
};

const getUserProfile = (req, res) => {
  const userData = res.locals.userData;
  return res.status(httpStatus.OK).json({
    data: { userData },
    errors: [],
  });
};

module.exports = {
  createNewUser,
  hashPassword,
  comparePasswords,
  login,
  register,
  logout,
  getUserProfile,
};
