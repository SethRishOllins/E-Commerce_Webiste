const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  description: { type: String, required: true, trim: true },
  tag: { type: String, trim: true },
  inventory: { type: Number, default: 0, min: 0 },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, name: String, price: Number, quantity: { type: Number, min: 1 } }],
  shippingAddress: { firstName: String, lastName: String, email: String, address: String, city: String, postalCode: String },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' }
}, { timestamps: true });

module.exports = { Product: mongoose.model('Product', productSchema), User: mongoose.model('User', userSchema), Order: mongoose.model('Order', orderSchema) };
