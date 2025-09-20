# Welcome!

- Hi! This is my wardrobe app :) The app lets users upload and organize clothing items, browse their wardrobe, plan outfits, and pack for trips.

## 🚀 Getting Started  

### 1. Clone the repository  
```bash
1. git clone https://github.com/your-username/pocket_closet.git
cd pocket_closet

### 2. Install dependencies
'''bash
Copy code
npm install

### 3. Set up environment variables
'''
Create a .env file in the project root with:

bash
Copy code
DATABASE_URL="file:./dev.db"   # or your Postgres URL
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

### 4. Run database migrations
'''bash

Copy code
npx prisma migrate dev

### 5. Start the development server
'''bash
Copy code
npm run dev
The app will be live at: http://localhost:5173

📂 Project Structure
''' bash
Copy code
/app
  /components       
  /routes           
  /utils            
prisma/schema.prisma 
public/              


## 🛠️ Tech Stack  

- **Frontend:** React, Remix, TypeScript, TailwindCSS  
- **Backend:** Remix loaders/actions, Prisma ORM  
- **Database:** SQLite / PostgreSQL (configurable)  
- **Storage:** Cloudinary (for images)  

---