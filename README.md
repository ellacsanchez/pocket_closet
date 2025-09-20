# Welcome!

- Hi! This is my wardrobe app :) The app lets users upload and organize clothing items, browse their wardrobe, plan outfits, and pack for trips.

1. Clone the repository
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


The app will be live at: http://localhost:3000

📂 Project Structure
/app
  /components       # React components (forms, inputs, gallery, planner)
  /routes           # Remix routes (wardrobe, upload, pack, plan, outfits)
  /utils            # Helper functions (Cloudinary, Prisma client)
prisma/schema.prisma  # Database schema
public/              # Static assets
