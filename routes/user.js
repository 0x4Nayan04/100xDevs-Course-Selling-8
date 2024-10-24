const { Router } = require('express');
const userRouter = Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {
  userModel,
  purchaseModel,
  courseModel,
  userZodSchema,
} = require('../db');
const userMiddleware = require('../middleware/user');
const { JWT_USER_PASSWORD } = require('../config');
// JWT Based Authentication
/* userRouter.post('/signup', async function (req, res) {
  const parseddatawithSuccess = userZodSchema.safeParse(req.body);

  if (parseddatawithSuccess.success) {
    const { email, password, firstName, lastName } = parseddatawithSuccess.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await userModel.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      res.status(201).json({
        message: 'Signup successful',
      });
    } catch (err) {
      res.status(500).json({
        message: 'Error during user creation',
        error: err.message,
      });
    }
  } else {
    res.status(400).json({
      message: 'Signup endpoint validation error',
      error: parseddatawithSuccess.error,
    });
  }
});

userRouter.post('/signin', async function (req, res) {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found with this email id',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign({ _id: user._id }, JWT_USER_PASSWORD);

    return res.status(200).json({
      message: 'Signin successful',
      token: token,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Error during sign-in',
      error: err.message,
    });
  }
});
userRouter.get('/purchases', userMiddleware, async function (req, res) {
  const userId = req.userId;

  try {
    const purchases = await purchaseModel.find({ userId });

    if (!purchases.length) {
      return res.status(404).json({
        message: 'No purchases found for this user',
      });
    }

    //Extract course IDs from purchases
    const courseIds = purchases.map((purchase) => purchase.courseId);

    const coursedata = await courseModel.find({
      _id: { $in: courseIds },
    });

    return res.status(200).json({
      message: 'Purchases and course data retrieved successfully',
      purchases,
      coursedata,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error during purchase retrieval',
      error: error.message,
    });
  }
});
 */

// Cookie Based Authentication
userRouter.post('/signup', async function (req, res) {
  const parseddatawithSuccess = userZodSchema.safeParse(req.body);

  if (parseddatawithSuccess.success) {
    const { email, password, firstName, lastName } = parseddatawithSuccess.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await userModel.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      req.session.userId = user._id;

      res.status(201).json({
        message: 'Signup successful',
      });
    } catch (err) {
      res.status(500).json({
        message: 'Error during user creation',
        error: err.message,
      });
    }
  } else {
    res.status(400).json({
      message: 'Signup endpoint validation error',
      error: parseddatawithSuccess.error,
    });
  }
});

userRouter.post('/signin', async function (req, res) {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found with this email id',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    req.session.userId = user._id;

    return res.status(200).json({
      message: 'Signin successful',
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Error during sign-in',
      error: err.message,
    });
  }
});

userRouter.post('/signout', userMiddleware, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        message: 'Error signing out',
        error: err.message,
      });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({
      message: 'Signed out successfully',
    });
  });
});

userRouter.get('/purchases', userMiddleware, async function (req, res) {
  const userId = req.userId;

  try {
    const purchases = await purchaseModel.find({ userId });

    if (!purchases.length) {
      return res.status(404).json({
        message: 'No purchases found for this user',
      });
    }

    const courseIds = purchases.map((purchase) => purchase.courseId);

    const coursedata = await courseModel.find({
      _id: { $in: courseIds },
    });

    return res.status(200).json({
      message: 'Purchases and course data retrieved successfully',
      purchases,
      coursedata,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error during purchase retrieval',
      error: error.message,
    });
  }
});
module.exports = userRouter;
