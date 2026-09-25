require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const { Product, User, Order } = require('./models');
const catalog = require('./catalog');
const { protect, adminOnly, makeToken } = require('./auth');
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true }));
app.use(express.json()); app.use(morgan('dev'));
const sendUser = (res, user) => res.status(200).json({ token: makeToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));
app.post('/api/auth/register', async (req, res, next) => { try { const { name, email, password } = req.body; if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' }); if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists.' }); const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) }); sendUser(res, user); } catch (e) { next(e); } });
app.post('/api/auth/login', async (req, res, next) => { try { const user = await User.findOne({ email: req.body.email?.toLowerCase() }); if (!user || !await bcrypt.compare(req.body.password || '', user.password)) return res.status(401).json({ message: 'Incorrect email or password.' }); sendUser(res, user); } catch (e) { next(e); } });
app.get('/api/auth/me', protect, (req, res) => res.json({ user: req.user }));

app.get('/api/products', async (req, res, next) => { try { const { search = '', category } = req.query; const query = { name: { $regex: search, $options: 'i' } }; if (category && category !== 'All') query.category = category; res.json(await Product.find(query).sort({ featured: -1, createdAt: -1 })); } catch (e) { next(e); } });
app.post('/api/products', protect, adminOnly, async (req, res, next) => { try { res.status(201).json(await Product.create(req.body)); } catch (e) { next(e); } });
app.put('/api/products/:id', protect, adminOnly, async (req, res, next) => { try { const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!product) return res.status(404).json({ message: 'Product not found.' }); res.json(product); } catch (e) { next(e); } });
app.delete('/api/products/:id', protect, adminOnly, async (req, res, next) => { try { const product = await Product.findByIdAndDelete(req.params.id); if (!product) return res.status(404).json({ message: 'Product not found.' }); res.status(204).end(); } catch (e) { next(e); } });

app.post('/api/orders', protect, async (req, res, next) => { try { const { items, shippingAddress } = req.body; if (!items?.length || !shippingAddress?.address) return res.status(400).json({ message: 'Your cart and delivery address are required.' }); const ids = items.map(i => i.product); const products = await Product.find({ _id: { $in: ids } }); if (products.length !== items.length) return res.status(400).json({ message: 'One or more products are unavailable.' }); let total = 0; const lineItems = items.map(i => { const p = products.find(x => x.id === i.product); if (!p || p.inventory < i.quantity) throw new Error(`Insufficient inventory for ${p?.name || 'a product'}.`); total += p.price * i.quantity; return { product: p._id, name: p.name, price: p.price, quantity: i.quantity }; }); await Promise.all(lineItems.map(i => Product.findByIdAndUpdate(i.product, { $inc: { inventory: -i.quantity } }))); res.status(201).json(await Order.create({ user: req.user._id, items: lineItems, shippingAddress, total })); } catch (e) { next(e); } });
app.get('/api/orders/my', protect, async (req, res, next) => { try { res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); } catch (e) { next(e); } });
app.get('/api/orders', protect, adminOnly, async (req, res, next) => { try { res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 })); } catch (e) { next(e); } });
app.patch('/api/orders/:id/status', protect, adminOnly, async (req, res, next) => { try { const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }); if (!order) return res.status(404).json({ message: 'Order not found.' }); res.json(order); } catch (e) { next(e); } });
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get(/^(?!\/api).*/, (_, res) => res.sendFile(path.join(__dirname, '..', 'dist', 'index.html')));
app.use((err, _, res, __) => { console.error(err); res.status(500).json({ message: err.message || 'Unexpected server error.' }); });
mongoose.connect(process.env.MONGODB_URI).then(async () => { if (await Product.countDocuments() === 0) { await Product.insertMany(catalog); console.log('Created the Novea demo catalog.'); } app.listen(process.env.PORT || 5000, () => console.log(`API listening on ${process.env.PORT || 5000}`)); }).catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
