const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["cola", "juice", "energy-drink", "water", "soda", "tea", "other"],
      default: "other",
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    unit: {
      type: String,
      enum: ["bottle", "can", "crate", "pack", "carton"],
      default: "bottle",
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: 0,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
productSchema.index({ name: "text", brand: "text", sku: "text" });

module.exports = mongoose.model("Product", productSchema);
