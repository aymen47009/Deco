#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting cleanup of dead files...${NC}\n"

# Change to repo directory if needed
# cd ~/path-to-your-repo

# Remove dead component files
echo -e "${YELLOW}Removing dead components...${NC}"
git rm -f src/components/AdminDashboard.tsx
git rm -f src/components/CustomerForm.tsx
git rm -f src/components/CustomerPortal.tsx
git rm -f src/components/CustomersView.tsx
git rm -f src/components/Header.tsx
git rm -f src/components/ImageUploader.tsx
git rm -f src/components/Lightbox.tsx
git rm -f src/components/LoginScreen.tsx
git rm -f src/components/MaterialsInventory.tsx
git rm -f src/components/Modal.tsx
git rm -f src/components/ProjectCard.tsx
git rm -f src/components/ProjectForm.tsx
git rm -f src/components/ProjectsView.tsx
git rm -f src/components/Spinner.tsx
git rm -f src/components/States.tsx
git rm -f src/components/WorkerDashboard.tsx

# Remove dead lib files
echo -e "${YELLOW}Removing dead lib files...${NC}"
git rm -f src/lib/api.ts
git rm -f src/lib/auth.tsx
git rm -f src/lib/pricing.ts
git rm -f src/lib/router.ts
git rm -f src/lib/storage.ts
git rm -f src/lib/toast.tsx

# Remove other dead files
echo -e "${YELLOW}Removing other dead files...${NC}"
git rm -f src/types.ts
git rm -f postcss.config.js
git rm -f tailwind.config.js
git rm -f tsconfig.tsbuildinfo
git rm -f vite.config.ts.timestamp-1784538938455-2cfcc247e41c78.mjs
git rm -f vite.config.ts.timestamp-1785010259484-7c1ffd72fd1438.mjs

# Commit changes
echo -e "\n${YELLOW}Committing changes...${NC}"
git commit -m "Remove dead code files - keep only live components and utilities

- Removed dead components: AdminDashboard, CustomerForm, CustomerPortal, etc.
- Removed dead lib utilities: api.ts, auth.tsx, pricing.ts, router.ts, storage.ts, toast.tsx
- Removed config files: postcss.config.js, tailwind.config.js, tsconfig.tsbuildinfo
- Kept live files: App.tsx, Hero.tsx, OrderForm.tsx, ProjectsList.tsx, supabase.ts"

# Push to main
echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push origin main

echo -e "\n${GREEN}✓ Cleanup completed successfully!${NC}"
echo -e "${GREEN}✓ All dead files have been removed from main branch${NC}\n"
