const { Router } = require('express');
const adminRouter = Router();
const {
  adminModel,
  courseModel,
  adminZodSchema,
  courseZodSchema,
} = require('../db');
const { JWT_ADMIN_PASSWORD } = require('../config');
const adminMiddleware = require('../middleware/admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// JWT Based Authentication
/* adminRouter.post('/signup', async function (req, res) {
  const parseddatawithSuccess = adminZodSchema.safeParse(req.body);

  if (!parseddatawithSuccess.success) {
    const { errors } = parseddatawithSuccess.error;
    return res.status(400).json({
      message: 'Validation error',
      errors: errors,
    });
  }

  const { email, password, firstName, lastName } = parseddatawithSuccess.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await adminModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    return res.status(201).json({
      message: 'Signup successful on the Admin Point',
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Error during Admin User creation',
      error: err.message,
    });
  }
});

adminRouter.post('/signin', async function (req, res) {
  const { email, password } = req.body;

  try {
    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign({ _id: admin._id }, JWT_ADMIN_PASSWORD);

    return res.status(200).json({
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error during signin',
      error: error.message,
    });
  }
});

*/

// Cookie Based Authentication
adminRouter.post('/signup', async function (req, res) {
  const parseddatawithSuccess = adminZodSchema.safeParse(req.body);

  if (!parseddatawithSuccess.success) {
    const { errors } = parseddatawithSuccess.error;
    return res.status(400).json({
      message: 'Validation error',
      errors: errors,
    });
  }

  const { email, password, firstName, lastName } = parseddatawithSuccess.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await adminModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    req.session.adminId = admin._id;

    return res.status(201).json({
      message: 'Signup successful on the Admin Point',
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Error during Admin User creation',
      error: err.message,
    });
  }
});

adminRouter.post('/signin', async function (req, res) {
  const { email, password } = req.body;

  try {
    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    req.session.adminId = admin._id;

    return res.status(200).json({
      message: 'Admin signed in successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error during signin',
      error: error.message,
    });
  }
});

adminRouter.post('/signout', adminMiddleware, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        message: 'Error signing out',
        error: err.message,
      });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({
      message: 'Admin signed out successfully',
    });
  });
});
adminRouter.post('/course', adminMiddleware, async function (req, res) {
  const adminId = req.userId;
  const courseData = courseZodSchema.safeParse(req.body);

  if (!courseData.success) {
    return res.status(400).json({
      message: 'Validation error',
      errors: courseData.error.errors,
    });
  }

  try {
    const course = await courseModel.create({
      ...courseData.data,
      creatorId: adminId,
    });

    res.status(201).json({
      message: 'Course created successfully',
      courseId: course._id,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      message: 'Error creating course',
      error: error.message,
    });
  }
});

adminRouter.put(
  '/course/:courseId',
  adminMiddleware,
  async function (req, res) {
    const adminId = req.userId;
    const { courseId } = req.params;
    const courseData = courseZodSchema.safeParse(req.body);

    if (!courseData.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: courseData.error.errors,
      });
    }

    try {
      const result = await courseModel.updateOne(
        {
          _id: courseId,
          creatorId: adminId,
        },
        courseData.data
      );

      if (result.matchedCount === 0) {
        return res
          .status(404)
          .json({ message: 'Course not found or not authorized' });
      }

      res.status(200).json({
        message: 'Course updated successfully',
        courseId: courseId,
      });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({
        message: 'Error updating course',
        error: error.message,
      });
    }
  }
);

adminRouter.get('/course/bulk', adminMiddleware, async function (req, res) {
  const adminId = req.userId;

  if (!adminId) {
    return res.status(400).json({
      message: 'Admin ID is required',
    });
  }

  try {
    const courses = await courseModel.find({
      creatorId: adminId,
    });

    res.status(200).json({
      message: 'Courses retrieved successfully',
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({
      message: 'Error getting courses',
      error: error.message,
    });
  }
});

adminRouter.post('/courses', adminMiddleware, async function (req, res) {
  const courseData = courseZodSchema.safeParse(req.body);

  if (!courseData.success) {
    return res.status(400).json({
      message: 'Validation error',
      errors: courseData.error.errors,
    });
  }

  try {
    const newCourse = await courseModel.create(courseData.data);
    res.status(201).json({
      message: 'Course created successfully',
      courseId: newCourse._id,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating course',
      error: error.message,
    });
  }
});

// Cookie Based Authentication

module.exports = adminRouter;
