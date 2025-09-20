# Pocket Closet

A personal wardrobe and outfit planning web app built with **React** and **Remix**. The app allows users to upload, organize, and manage their clothing collection, plan outfits, and prepare for trips with an intuitive drag-and-drop interface.  


## 🚀 Getting Started  

### 1. Clone the repository  
```bash
git clone https://github.com/your-username/wardrobe-app.git
cd wardrobe-app

2. Install dependencies
npm install

3. Set up environment variables

Create a .env file in the project root with:

DATABASE_URL="file:./dev.db"   # or your Postgres URL
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

4. Run database migrations
npx prisma migrate dev

5. Start the development server
npm run dev


The app will be live at: http://localhost:5173

📂 Project Structure
/app
  /components       
  /routes           
  /utils           
prisma/schema.prisma  
public/              



### 🛠️ Tech Stack  

- **Frontend:** React, Remix, TypeScript, TailwindCSS  
- **Backend:** Remix loaders/actions, Prisma ORM  
- **Database:** SQLite / PostgreSQL (configurable)  
- **Storage:** Cloudinary (for images)  

---