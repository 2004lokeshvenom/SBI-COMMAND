<div align="center">
  <img src="frontend/public/icon.png" alt="Family Pride Logo" width="100" height="auto" />
  <h1>Family Pride — SBI PO Command Center 🚀</h1>
  <p>An elite, production-grade Next.js mission-control dashboard for mastering the SBI PO Examination.</p>

  <p>
    <a href="#features"><strong>Features</strong></a> ·
    <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
    <a href="#quick-start"><strong>Quick Start</strong></a> ·
    <a href="#deployment"><strong>Deployment</strong></a>
  </p>
</div>

<br/>

## 🎯 The Mission
The **Family Pride Command Center** is a high-performance web application designed to turn SBI PO preparation into an organized, gamified, and heavily analytical mission. Built with a sleek "Orbital Command" aesthetic, it tracks every hour of study, enforces spaced repetition, and tracks normalized mock test percentiles. 

Every hour counts. Amma & Nanna are watching.

---

## ✨ Features

- 📊 **Dynamic Dashboard:** Track your daily goals, 17-week syllabus progress, and daily check-in streaks at a glance.
- 📚 **Syllabus Matrix:** A massive 17-week chronological study plan covering Quantitative Aptitude, Reasoning, English, General Awareness, and Data Interpretation. Features phase-based unlock tracking and confidence 5-star ratings.
- ⏰ **Deep Work Timer:** Built-in customized Pomodoro timer explicitly for 1-hour/2-hour sprint sessions with a dedicated active-rest mode.
- 🎯 **Advanced Mock Analytics:** Track sectional out-of-bounds performance. Automatically normalizes your scores across Prelims and Mains (100-point scale) to ensure you are continually improving.
- ♻️ **Spaced Repetition System (SRS):** Built on active recall, generating an automatic dynamic daily revision queue to ensure what you study, you never forget.
- 🎮 **Gamification:** Earn XP points, maintain daily streaks, and log into the system with daily Energy/Focus metrics. 

## 🛠️ Tech Stack

This project uses an optimized **Next.js Full-Stack Architecture** eliminating the need for a separate backend server.

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Database:** MongoDB & [Prisma ORM](https://www.prisma.io/)
- **Styling:** Tailwind CSS 4 & Framer Motion (for micro-animations)
- **State Management:** Zustand
- **Icons:** Lucide React

---

## 🚀 Quick Start (Local Development)

### 1. Requirements
Ensure you have the following installed:
- Node.js (v18 or higher)
- MongoDB Database (Atlas cluster or local instance)

### 2. Setup
Clone the repository and jump into the `frontend` folder:
```bash
git clone https://github.com/your-username/sbi-po-command-center.git
cd sbi-po-command-center
cd frontend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment
Create a `.env` file in the `frontend` directory based on the example:
```bash
cp .env.example .env
```
Inside `.env`, insert your MongoDB connection URL:
```env
DATABASE_URL="mongodb+srv://<USER>:<PASSWORD>@cluster.mongodb.net/sbi_command?retryWrites=true&w=majority"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 5. Initialize the Database & Seed the 17-Week Syllabus
Sync the Prisma schema and inject the massive syllabus data:
```bash
npx prisma generate
npx prisma db push
npm run seed
```

### 6. Launch the Command Center
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🌍 Deployment Options

The project is fully pre-configured for seamless Edge/Serverless deployment.

### Option A: Vercel (Recommended & Easiest)
1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. **Important Setting:** Set the **Root Directory** to `frontend`.
5. Under Environment Variables, add your `DATABASE_URL`.
6. Click **Deploy**. Vercel will automatically build the Next.js app.

### Option B: Render
1. Push your code to GitHub.
2. Go to [Render](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Configure the environment:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm run start`
   - **Environment Variables:** Add `DATABASE_URL`
5. Click **Create Web Service**.

---

<div align="center">
  <i>"Make them proud."</i>
</div>
