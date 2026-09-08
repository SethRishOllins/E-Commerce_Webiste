# Novea — Full-stack e-commerce application

## Features

- JWT registration and login with user/admin roles
- MongoDB product catalog with search, category filtering, and inventory
- Persistent server-side orders and client-side cart
- Authenticated checkout that validates and reduces stock
- Order history for customers
- Protected admin product CRUD, inventory, and order-status management

## Local setup

1. Copy `.env.example` to `.env` and set a MongoDB connection string and a strong `JWT_SECRET`.
2. Run `npm install`.
3. Run `npm run seed` to insert the sample catalog and development admin account.
4. Start the API with `npm run server` and the frontend with `npm run dev` in a second terminal.

Development admin: `admin@novea.store` / `Admin123!` — change or remove this account before a public deployment.

## Deployment

Deploy the API to Render or Railway with `npm run server`; configure `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN`. Deploy the Vite frontend to Vercel or Netlify with build command `npm run build` and publish directory `dist`.
