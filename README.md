# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# 🛍️ BargainBay  – Frontend (React + Vite)

This repository contains the frontend of the BargainBay e-commerce web application.  
It is built using **React + Vite** for fast performance, responsive UI, and modern shopping experience.

## 🌟 Main Features
- Fully responsive UI (Laptop / Tablet / Mobile)
- Login & Signup with JWT authentication
- Product listing with categories, search & filters
- Shopping cart & wishlist
- Place order with success page
- Admin panel to add / delete products
- Dynamic navbar based on user login status

## 🧰 Tech Stack
| Technology | Purpose |
|----------|---------|
| React (Vite) | Frontend framework |
| JavaScript | Functionality & logic |
| HTML, CSS | UI & styling |
| Axios | REST API calls |
| React Hooks & Context | State management |

## 🔗 Communication With Backend
- Sends API requests to Spring Boot backend using Axios
- Stores JWT in local storage and attaches it in Authorization header
- Protects private pages using token validation

This frontend provides a smooth and modern shopping experience for the BargainBay platform.
