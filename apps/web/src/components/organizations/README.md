# Organizations Component

A dynamic, flexible organization showcase system with tab-based navigation and animated transitions.

## Features

### 🎨 Dynamic Theming
- **Background color transitions** - Page background smoothly transitions based on active organization
- **Tab styling** - Active tab automatically uses organization's primary color
- **Content containers** - Each organization's content has a subtle gradient using their brand colors

### 🧩 Component Structure

```
organizations/
├── index.tsx                  # Main component with tabs and page layout
├── OrganizationShowcase.tsx   # Individual organization display
├── MemberCard.tsx             # Team member card component
├── MemberModal.tsx            # Member detail modal (legacy)
├── organizationData.ts        # Organization data configuration
└── utils.ts                   # Utility functions for colors and gradients
```

### 📊 Data-Driven Design

All organizations are configured in `organizationData.ts`:

```typescript
{
  id: 'ict-sf',
  name: 'ICT-SF',
  color: {
    primary: '#6e29f6',    // Used for tabs, badges, buttons
    secondary: '#f629a8',  // Used for accents and gradients
    accent: '#29f6d2'      // Additional accent color
  },
  // ... other properties
}
```

### 🎯 Key Improvements

1. **Cleaner Code**
   - Removed hardcoded tab configurations
   - Centralized color logic in utilities
   - Eliminated redundant state management

2. **Better Performance**
   - Lazy-loaded organization content
   - Optimized image loading
   - Reduced re-renders

3. **Enhanced UX**
   - Smooth color transitions (700ms)
   - Dynamic background gradients
   - Accessible keyboard navigation
   - Proper contrast for light/dark colors

4. **Maintainability**
   - Single source of truth for organization data
   - Reusable utility functions
   - Type-safe with TypeScript
   - Easy to add new organizations

### 🚀 Adding a New Organization

1. Add organization data to `organizationData.ts`:
```typescript
{
  id: 'new-org',
  name: 'NEW',
  fullName: 'New Organization',
  color: {
    primary: '#your-color',
    secondary: '#your-secondary',
    accent: '#your-accent'
  },
  // ... other required fields
}
```

2. That's it! The tab and content will automatically appear.

### 🎨 Utility Functions

**`isLightColor(color: string)`**
- Determines if a color is light (for contrast)

**`createOrgGradient(primary, secondary, direction?)`**
- Creates gradient backgrounds for content sections

**`createPageGradient(primary, secondary)`**
- Creates subtle page background gradients

**`addOpacityToHex(hex, opacity)`**
- Adds transparency to hex colors

### 📱 Responsive Design

- Mobile: Single column layout, stacked tabs
- Tablet: 2-column member grid
- Desktop: 4-column member grid with centered leader

### ♿ Accessibility

- Keyboard navigation support
- ARIA labels and roles
- Focus indicators
- Semantic HTML structure
- Proper color contrast
