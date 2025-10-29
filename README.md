# CamJam Backend

The backend server for the CamJam video chat platform. Built with TypeScript and Express, it uses a layered architecture with separate routes, controllers, services, and types for each collection. WebRTC signaling is handled via Socket.IO for smooth peer connection negotiation.

## 🧠 Architecture

- **Express.js** with **TypeScript**
- **Socket.IO** for signaling and real-time chat
- Modular structure per entity (rooms, users, messages)

## 🛢️ Databases

- **PostgreSQL** — for structured data like users and rooms
- **MongoDB** — for flexible data like chat logs and messages
- **Redis** — used for fast user lookup and improving WebRTC session performance

## 🌐 Related Links

- 💻 **Frontend Repository**: [https://github.com/dorhakim100/CamJam---Front](https://github.com/dorhakim100/CamJam---Front)

## 📦 Installation

```bash
git clone https://github.com/dorhakim100/CamJam-Back
cd CamJam-Back
npm install
npm run dev
