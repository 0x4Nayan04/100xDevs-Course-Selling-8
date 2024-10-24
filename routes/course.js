const { Router } = require("express");
// const userMiddleware = require('../middleware/user');
const userMiddleware = require("../middleware/user");
const { purchaseModel, courseModel, purchaseZodSchema } = require("../db");
const courseRouter = Router();

courseRouter.post("/purchase", userMiddleware, async function (req, res) {
  const userId = req.userId;
  const purchaseData = purchaseZodSchema.safeParse({ userId, ...req.body });

  if (!purchaseData.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: purchaseData.error.errors,
    });
  }

  try {
    const course = await courseModel.findById(purchaseData.data.courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const existingPurchase = await purchaseModel.findOne({
      userId,
      courseId: purchaseData.data.courseId,
    });

    if (existingPurchase) {
      return res.status(409).json({
        message: "You have already purchased this course",
      });
    }

    await purchaseModel.create(purchaseData.data);

    res.status(201).json({
      message: "You have successfully purchased the course",
    });
  } catch (error) {
    console.error("Error creating purchase:", error);
    res.status(500).json({
      message: "Error processing purchase",
      error: error.message,
    });
  }
});

courseRouter.get("/preview", async function (req, res) {
  try {
    const courses = await courseModel.find(
      {},
      "title description price imageUrl"
    );
    res.status(200).json({
      courses: courses,
    });
  } catch (error) {
    console.error("Error retrieving courses:", error);
    res.status(500).json({
      message: "Error retrieving courses",
      error: error.message,
    });
  }
});

courseRouter.get("/:courseId", async function (req, res) {
  const { courseId } = req.params;

  try {
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.status(200).json({
      course: course,
    });
  } catch (error) {
    console.error("Error retrieving course:", error);
    res.status(500).json({
      message: "Error retrieving course",
      error: error.message,
    });
  }
});

module.exports = courseRouter;
