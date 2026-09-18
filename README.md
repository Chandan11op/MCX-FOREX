# MCX-FOREX Terminal Web Application

A professional MCX commodity market-data web application monorepo prototype designed to process, display, analyze, and export MCX commodity data (Gold, Silver, Copper, Crude Oil, Natural Gas).

> [!IMPORTANT]
> **Data Mode Notice:**
> Currently configured for `DATA_PROVIDER=mcx-bhavcopy` (End-Of-Day / Bhavcopy data mode). Data presented is official MCX EOD / delayed prototype data and is explicitly labeled as `END OF DAY / BHAVCOPY`. It is **not** real-time feed data.

---

## 🛠 Tech Stack

- **Frontend (`apps/web`)**: React 18, Vite, TypeScript, Tailwind CSS, React Router, Recharts, Socket.IO Client.
- **Backend (`server`)**: Node.js, Express, TypeScript, Socket.IO, MongoDB, Mongoose, XLSX parser/exporter.

---

## 📁 Repository Structure

```
MCX-FOREX/
├── .agents/
│   └── mcp_config.json
├── apps/
│   └── web/            # React SPA frontend
├── server/             # Express + MongoDB + Socket.IO backend
├── data/
│   └── mcx/            # Local MCX Bhavcopy EOD CSV storage
├── docs/               # System documentation & architectural blueprints
├── .env.example        # Environment variable template
├── .gitignore
├── package.json        # Workspace manager
└── README.md
```

---

## 🚀 Quick Start

### 1. Requirements
- Node.js (v18+)
- MongoDB (running locally or remote URI)

### 2. Setup & Installation
```bash
# Clone repository and enter directory
cd MCX-FOREX

# Copy environment template
cp .env.example server/.env

# Install dependencies for all workspaces
npm install
```

### 3. Development Mode
```bash
# Start backend server
npm run dev:server

# Start frontend web app (in a separate terminal)
npm run dev:web
```

---

## 📚 Documentation

See the [`docs/`](./docs) folder for details:
- [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- [`DATA-SOURCES.md`](./docs/DATA-SOURCES.md)
- [`MCX-INTEGRATION.md`](./docs/MCX-INTEGRATION.md)
- [`API.md`](./docs/API.md)
- [`DEVELOPMENT.md`](./docs/DEVELOPMENT.md)
