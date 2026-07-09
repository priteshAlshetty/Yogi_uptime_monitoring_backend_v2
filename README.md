# Web Dashboard Backend + API

This is a backend project for a web-based dashboard built using **Express** and **MySQL**. The project serves as an API backend for managing and visualizing data efficiently.

---

#
- **Project name** : Yogi Uptime Monitoring System
- **Project Descrption** : Node JS and Express based Backend For Machine status monitoring, Uptime and Downtime calculation
- **Integration Interface** : REST API (refer API Documentation)

## 🌟 Features

- **Data Analytics:** Backend services for querying and serving dashboard analytics.
- **Secure API:** Environment-based configurations for API security.
- **Database Integration:** MySQL support for data storage.
- **Real-time Updates:** API Endpoints for realtime data updates for dashboards.
- **Error Handling:** Robust error handling and logging.

---

## 🏗️ Project Structure

APP
->src
->->index.js
->public
->->index.html
->node_modules
->package.json
->README.md
->.gitignore
->.env

---

## 🚀 Installation of Project

### **1. Download and Install Node JS version NodeJ v22.XX.XX (LTS)**


### **2. Clone the Repository**

```bash
git clone "%URL%"
cd your-repo
```

### **3\. Install Dependencies**

```bash
npm install
```

## ** 4. Set Up Environment Variables**

```bash
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=dashboard_db
PORT=3000
```


### ** 5. Install MySQL (Oracle's Community server or wampserver)** 
 
 - Install Mysql Server v8.3 + and run on PORT same as in /src/db.js file, Set passwords as per Environment variables
 - Import Database structure using .sql file 

### **4. Run application **

```bash
npm run start
```

### ** 5.Development **

```bash
npm install -g nodemon
npm run dev
```


Required frontend to access dashboard on browser.