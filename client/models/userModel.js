import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (v) => validator.isStrongPassword(v),
        message: "Password must be strong!",
      },
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: (v) => validator.isMobilePhone(v, "en-IN"),
        message: "Invalid phone number",
      },
    },
    address: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100,
    },
    answer: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("users", userSchema);
