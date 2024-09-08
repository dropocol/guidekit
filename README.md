# GuideKit - Knowledge Base Platform

GuideKit is a powerful knowledge base platform that allows users to create, manage, and share knowledge bases with ease. It's built using Next.js, Prisma, and integrates with Notion for content management.

## Features

- Multi-tenant architecture
- Notion integration for content management
- Custom domain support
- User authentication and authorization
- Responsive design for various devices
- Article management with nested collections and subcollections
- Rich text editor for content creation
- File upload functionality
- API routes for data fetching and manipulation

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or later)
- Yarn package manager
- PostgreSQL database

## Getting Started

1. Clone the repository:

   ```
   git clone https://github.com/your-username/guidekit.git
   cd guidekit
   ```

2. Install dependencies:

   ```
   yarn install
   ```

3. Set up environment variables: Create a `.env` file in the root directory and add the following variables:

   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/guidekit
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXT_PUBLIC_ROOT_DOMAIN=your-root-domain.com
   NOTION_API_KEY=your-notion-api-key
   ```

4. Set up the database:

   ```
   npx prisma migrate dev
   ```

5. Run the development server:

   ```
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project follows a monorepo structure using Yarn workspaces:

- `apps/web`: Main Next.js application
- `apps/marketing`: Marketing website (if applicable)
- `packages/ui`: Shared UI components

## Key Components

1. Authentication:

   - Implemented using NextAuth.js
   - See `apps/web/auth/index.ts` for configuration

2. API Routes:

   - Located in `apps/web/app/api`
   - Handles data fetching and manipulation

3. Database:

   - Uses Prisma ORM
   - Schema defined in `apps/web/prisma/schema.prisma`

4. UI Components:

   - Shared components in `packages/ui/src`
   - App-specific components in `apps/web/ui`

5. Notion Integration:
   - Implemented in `apps/web/lib/notion.ts`

## Deployment

The project is designed to be deployed on Vercel. Follow these steps:

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Set up the environment variables in the Vercel dashboard
4. Deploy the project

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
