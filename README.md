# Background Remover (Credit-Based SaaS)

A full-stack application for removing image backgrounds using the ClipDrop API, with user authentication via Clerk, credit management, and payments via Razorpay.

## Features

- **User Authentication:** Clerk (supports social and email login)
- **Background Removal:** ClipDrop API integration
- **Credit System:** 5 free credits on signup, purchase more via Razorpay
- **Payments:** Razorpay integration for credit packs
- **Database:** MongoDB (Atlas)
- **Frontend:** React (Vite)
- **Backend:** Node.js, Express

## Environment Variables

### Server (`server/.env`)
```
MONGODB_URI=your_mongodb_uri
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
CLIPDROP_API=your_clipdrop_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CURRENCY=INR
PORT=4000
```

### Client (`client/.env`)
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BACKEND_URL=https://your-backend-url
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Folder Structure

```
bg-remover/
  client/         # React frontend
  server/         # Node.js backend
    controllers/
    middleware/
    models/
    routes/
    configs/
    .env          # Not committed (see .gitignore)
  README.md
  .gitignore
```

## Setup

### 1. Clone the repository

```sh
git clone https://github.com/yourusername/bg-remover.git
cd bg-remover
```

### 2. Install dependencies

- **Backend:**
  ```sh
  cd server
  npm install
  ```

- **Frontend:**
  ```sh
  cd ../client
  npm install
  ```

### 3. Configure Environment Variables

- Copy `.env.example` to `.env` in both `client` and `server` folders and fill in your keys.

### 4. Run Locally

- **Backend:**
  ```sh
  cd server
  npm run dev
  ```

- **Frontend:**
  ```sh
  cd client
  npm run dev
  ```

### 5. Deployment

- Deploy backend (e.g., Render, Vercel, Heroku).
- Deploy frontend (e.g., Vercel, Netlify).
- Update `VITE_BACKEND_URL` in client `.env` to point to your deployed backend.

## How to Contribute

- **Open an Issue:** If you find a bug or have a feature request, please open an issue using the GitHub "Issues" tab.
- **Fork and PR:** Fork the repository, create a new branch, and submit a pull request for your changes.
- **Discussions:** Use GitHub Discussions for questions or ideas.
- **Code Style:** Please try to follow the existing code style and structure.

## Open Issues / What Needs Solving

- **User Info Not Stored:** User info is sometimes not getting stored in the database when a user logs in using Clerk. Needs investigation and a robust fix.
- **Payment Issues:** Razorpay payment flow may fail or not update the transaction/payment status correctly.
- **Credits Update Issue:** User credits are not always updated correctly after payment or background removal.
- **Testing:** Add more unit and integration tests for both backend and frontend.
- **Error Handling:** Improve error messages and user feedback, especially for payment and background removal failures.
- **UI/UX:** Enhance the frontend user experience and responsiveness.
- **Security:** Review and improve authentication and validation logic.
- **Documentation:** Expand documentation for API endpoints and developer setup.
- **Performance:** Optimize image upload and processing speed.
- **Deployment:** Add guides for deploying on popular platforms (Vercel, Render, Netlify, etc.).
- **Accessibility:** Improve accessibility for all users.
- **Internationalization:** Add support for multiple languages.

If you want to help with any of these, please comment on the relevant issue or open a new one!

## API Endpoints

- `POST /api/user/login` — Upsert user info after Clerk login
- `GET /api/user/credits` — Get current user's credits (token required)
- `POST /api/image/remove-bg` — Remove background from image (token + file required)
- `POST /api/user/pay-razor` — Create Razorpay order (token required)
- `POST /api/user/verify-razor` — Verify Razorpay payment and add credits
- `POST /api/user/webhooks` — Clerk webhook endpoint (for user create/update/delete)

## License

MIT
