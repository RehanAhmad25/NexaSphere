# NexaSphere System Synchronization Guide

This guide explains how to link the three core modules of the NexaSphere project.

## 1. Environment Variables (.env)

Ensure both frontend applications have the correct backend URLs.

### Admin Dashboard (`/admin-dashboard/.env`)
```env
# URL of your running Java Backend
VITE_API_BASE=http://localhost:8080

# URL of your deployed Google Apps Script Web App
VITE_MEMBERSHIP_SCRIPT_URL=https://script.google.com/macros/s/.../exec
VITE_MEMBERSHIP_SECRET=NEXA_SECRET_2026
```

### Main Website (`/.env`)
```env
# URL of your running Java Backend
VITE_API_BASE=http://localhost:8080
```

## 2. Running the System

### Backend (Java Spring Boot)
```powershell
cd server-java
mvn spring-boot:run -Dmaven.test.skip=true
```
*Accessible at: http://localhost:8080*

### Admin Portal (Vite)
```powershell
cd admin-dashboard
npm run dev
```
*Accessible at: http://localhost:5174 (standard)*

### Main Website (Vite)
```powershell
npm run dev
```
*Accessible at: http://localhost:5173*

## 3. Data Flow
1. **Events**: Admin Dashboard (Writes to Java DB) -> Java Public API -> Main Website (Live Sync).
2. **Membership**: Membership Form (Submits to Google Sheets) -> Google Apps Script -> Admin Dashboard (Live View).
3. **Core Team**: All official profile photos are managed via `admin-dashboard/src/assets/images/team`.
