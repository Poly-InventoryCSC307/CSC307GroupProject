<p align="center"> 
  <img src="packages/react-frontend/src/assets/logo-and-text-white.svg" width="400" alt="Project Logo">
</p>

# Table of contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Demo / Live URL](#demo)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Running the Website](#running-the-website)
- [Contributors](#contributors)

## About

Welcome to our humble GitHub page! Poly+ inventory is an inventory management website created by a small group of Cal Poly engineers. Tasked with creating a website for an introductory software development class, our group decided to make a product focused on simplicity and affordability. From there, the idea of an inventory management website was born. Over the course of five weeks, our team was able to produce a fully functional website ready for small and large businesses alike to use...all at the cost of FREE! The entire team hopes that users love our product. Enjoy! 

## Features 

Our product includes the following features: 

- Custom login credentials with email verification
- Tracking of quantity on display as well as back stock
- Add/removal of products
- Searching by name or identification number
- Filtering using price and quantity 
- Editing of product information including name, identification number, quantity, and price 

## Tech Stack

The following tools were used: 

### Frontend

- Azure Static Web Apps
- Github Actions CI/CD
- ESLint + Prettier
- Firebase
- React
- Vite

### Backend

- Express.js / Node
- MongoDB Atlas

## Demo / Live URL 

Please click here to access our website: https://victorious-ocean-026f9ee1e.3.azurestaticapps.net

## Getting Started

### Installation 

Follow the steps bellow to set up the project locally: 

1. Clone the repository
```bash
git clone https://github.com/Poly-InventoryCSC307/CSC307GroupProject.git

cd CSC307GroupProject
```

2. Install dependencies 
```bash
cd packages/react-frontend 

npm install
```

```bash
cd ../express-backend
npm install
```

3. Configure environment variables
Create a .env file inside the backend folder with your personal settings. 
```bash
MONGO_URI=your-database-url
```

### Running the Website
1. Start backend
```bash
cd ../express-backend

npm start
```

2. Start frontend (in a separate terminal) 
```bash
cd ../react-frontend

npm run dev
```
3. Visit the website
Open your browser and navigate to the url displayed in terminal running frontend. The url will appear similar to the following: 
```bash
http://localhost:1111
```

## Contributors 

<div align="center">

| Name | Role | GitHub |
|------|------|--------|
| Alyssa Gerardo | UI/UX & Frontend Developer | [@alyssagerardo](https://github.com/alyssagerardo) |
| Edgard Aviles | Backend Developer | [@Edgarddragde](https://github.com/Edgarddragde) |
| Priscilla Garcia | Frontend Developer | [@pgarci40](https://github.com/pgarci40) |
| Troy Renner | Frontend/Backend Developer & Database Manager | [@legorockband](https://github.com/legorockband) |
| Valerie Lucatero | Backend Developer | [@valerieponce](https://github.com/valerieponce) |

</div>




