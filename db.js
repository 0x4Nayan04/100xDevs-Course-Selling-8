const mongoose = require("mongoose");
const { z } = require("zod");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

// Zod Validation
const userZodSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(30),
  firstName: z.string().min(3).max(100),
  lastName: z.string().min(3).max(100),
});

const adminZodSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(30),
  firstName: z.string().min(3).max(100),
  lastName: z.string().min(3).max(100),
});

const courseZodSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(3),
  price: z.number().min(0).positive(),
  imageUrl: z.string().url(),
});

const purchaseZodSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
  courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
});

const userSchema = new Schema({
  email: { type: String, unique: true },
  password: String,
  firstName: String,
  lastName: String,
});

const adminSchema = new Schema({
  email: { type: String, unique: true },
  password: String,
  firstName: String,
  lastName: String,
});

const courseSchema = new Schema({
  title: String,
  description: String,
  price: Number,
  imageUrl: String,
  creatorId: ObjectId,
});
const purchaseSchema = new Schema({
  userId: ObjectId,
  courseId: ObjectId,
});

const userModel = mongoose.model("user", userSchema);
const adminModel = mongoose.model("admin", adminSchema);
const courseModel = mongoose.model("course", courseSchema);
const purchaseModel = mongoose.model("purchase", purchaseSchema);

module.exports = {
  userModel,
  adminModel,
  courseModel,
  purchaseModel,
  userZodSchema,
  adminZodSchema,
  courseZodSchema,
  purchaseZodSchema,
};
