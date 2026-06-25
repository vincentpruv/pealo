# Pealo 🦪

Pealo is an open-source, lightweight, and customizable customer feedback collection widget and dashboard. It allows you to gather user feedback on your website, track user ratings, and analyze comments.

Designed as an **Open-Core** project, Pealo provides a fully featured, self-hostable core dashboard and widget, while offering premium features like team collaboration and AI-powered insights for the cloud-hosted platform.

---

## ✨ Features

- 🎨 **Fully Customizable Widget**: Tweak color themes, placement, title text, and ratings styles.
- ⚡ **Smart Event Triggers**: Automatically pop up the widget based on user actions:
  - **Time Delay**: Show the widget after $X$ seconds.
  - **Scroll Depth**: Pop up the widget after the user scrolls a percentage of the page.
  - **Exit Intent**: Retrieve feedback just before the user leaves your website tab.
- 🌐 **Target Specific Pages**: Restrict popup triggers to specific page paths (e.g. `/pricing`, `/checkout`) or using wildcards (e.g. `/docs/*`).
- 🤖 **AI-Powered Feedback Insights (SaaS / Bring-Your-Own-Key)**: Summarize feedback, cluster issues, and identify product bugs automatically.
- 🛡️ **Self-Hostable**: Deploy easily using MongoDB and Node.js.

---

## 🚀 Getting Started (Self-Hosting)

### Prerequisites

You need the following installed:
- **Node.js** (v18.x or later)
- **MongoDB** (local database or MongoDB Atlas cluster)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/pealo.git
   cd pealo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment file and fill in your connection details (database, auth, email client, etc.):
   ```bash
   cp .env.example .env.local
   ```
   *Edit `.env.local` to add your keys.*

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to access your local dashboard.

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🔒 Security & Secrets

Never commit your `.env.local` file to source control. It is ignored by default in `.gitignore`. Make sure to generate a secure NextAuth secret using:
```bash
openssl rand -base64 32
```

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3 (AGPLv3)**. 

Pealo is free to self-host and modify. However, if you modify the code and offer it as a service over a network (SaaS), you **must make your modifications open-source** under the same license. This protects the open-source community and the business from proprietary clones.
