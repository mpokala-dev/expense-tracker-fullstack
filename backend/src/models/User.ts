import mongoose, { type Document, type Model } from "mongoose";

// Document interface — the shape of a User document in the DB.
// We separate the interface from the schema so TypeScript can type
// model methods and virtuals correctly.
export interface IUser extends Document {
  email: string;
  password: string; // stored as bcrypt hash — never plaintext
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
  },
  {
    timestamps: true, // auto-manages createdAt and updatedAt
  }
);

// Never return the password field in query results.
// This runs before any toJSON/toObject call — good for API responses.
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
