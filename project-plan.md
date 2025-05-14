# 404 Found Art Portfolio - Project Plan

## Project Overview
A portfolio website with flexible content types (standard posts, videos, GIFs, galleries) and customizable theming.

## Architecture
- **Frontend**: Next.js with Tailwind CSS
- **Backend**: Strapi headless CMS
- **Authentication**: JWT via Strapi + NextAuth.js
- **Storage**: Media files via Strapi Media Library
- **Deployment**: TBD (Vercel/Netlify for frontend, hosting service for Strapi)

## Development Phases

### Phase 1: Foundation (COMPLETED)
- [x] Set up Next.js frontend
- [x] Set up Strapi backend
- [x] Create content models in Strapi
- [x] Configure Git repository

### Phase 2: Core Functionality (IN PROGRESS)
- [x] Implement basic theme system
- [ ] Create homepage with masonry grid
- [ ] Set up API connection between Next.js and Strapi
- [ ] Implement basic layout components
- [ ] Create theme settings page

### Phase 3: Content Display
- [ ] Create dynamic post routing
- [ ] Implement standard post template
- [ ] Implement video post template with Vimeo integration
- [ ] Implement GIF post template with Imgur integration
- [ ] Implement gallery post template
- [ ] Add responsive image handling

### Phase 4: Admin Experience
- [ ] Create secured admin section
- [ ] Implement login/authentication
- [ ] Build content creation interface
- [ ] Set up media upload functionality
- [ ] Create post preview system

### Phase 5: Refinement & Polish
- [ ] Enhance animations and transitions
- [ ] Optimize performance
- [ ] Improve accessibility
- [ ] Add SEO optimization
- [ ] Implement dark/light mode toggle
- [ ] Add color customization features

### Phase 6: Testing & Deployment
- [ ] Perform cross-browser testing
- [ ] Implement error handling
- [ ] Set up monitoring
- [ ] Deploy to production
- [ ] Write documentation

## Current Sprint Tasks

### Sprint 1: Core Functionality (Target: [Insert Date])

#### Frontend Tasks
1. Create MasonryGrid component
   - File: src/components/grid/MasonryGrid.tsx
   - Dependencies: react-masonry-css
   - Features: responsive breakpoints, custom styling

2. Create PostCard component
   - File: src/components/posts/PostCard.tsx
   - Dependencies: next/image, framer-motion
   - Features: different displays per post type

3. Update homepage with masonry grid
   - File: src/app/page.tsx
   - Add mock data for testing
   - Implement grid layout

4. Configure Next.js for external images
   - File: next.config.js
   - Add domains for picsum.photos, localhost

5. Create API service for Strapi
   - File: src/lib/api/strapi.ts
   - Implement fetch wrapper with error handling
   - Add helper functions for media URLs

#### Backend Tasks
1. Test content creation in Strapi
   - Create sample posts of each type
   - Test media uploads
   - Verify API responses

2. Set up role-based permissions
   - Configure public read access
   - Restrict write access to authenticated users

## Development Standards
- Use TypeScript for all new components
- Add comments for complex logic
- Use 'use client' directive for client components
- Keep components small and focused
- Follow the BEM methodology for CSS classes
- Implement responsive design for all components