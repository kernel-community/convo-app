# DR007: Clerk Profile Integration

**Context**: Users needed a unified, polished interface to manage their community-specific profiles. The existing custom profile management UI required significant maintenance and lacked the polish of established authentication providers.

**Consequences**:
- Improved user experience with professional, mobile-responsive UI
- Reduced maintenance overhead for custom profile management components
- Better integration with authentication flow
- Simplified image management through Clerk's built-in system
- Dependency on Clerk's component structure and limitations
- Profile images now shared across communities instead of community-specific

---

## Overview

This integration merges your custom community-specific profile fields with Clerk's user profile management system. Users can now edit their profile information directly from Clerk's user profile modal while maintaining the community-specific profile functionality.

## Key Features

### 🏘️ Community-Specific Profiles
- Each user has a unique profile for each community subdomain
- Profile data is automatically scoped to the current community
- When a user first visits a new community, their profile is pre-populated with data from their other communities

### 🎛️ Integrated Profile Editing
- Custom "Community Profile" page within Clerk's UserProfile modal
- All your custom fields are editable: bio, current focus, website, keywords
- Real-time nickname uniqueness checking
- **Profile images are managed through Clerk's built-in account settings**
- Keyword management with add/remove functionality

### 🔄 Seamless UX
- Users can access profile editing from multiple entry points:
  - Clicking the UserButton in the navbar
  - "Quick Edit" button on the profile page
  - Direct navigation to `/profile` page
- Auto-save functionality with success/error feedback
- Form validation and error handling

## How to Use

### For Users

1. **Access Profile Editing:**
   - Click your avatar in the top navigation
   - Select "Community Profile" from the menu
   - OR click "Quick Edit" on your profile page

2. **Edit Your Profile:**
   - Update your nickname, bio, current focus, and website
   - **To change your profile image: Go to "Account" tab in the user menu**
   - Add/remove keywords to describe your interests
   - Click "Save Profile" to persist changes

3. **Community Context:**
   - Your profile is specific to the current community
   - Changes made in one community don't affect your profiles in other communities
   - The community name is clearly displayed at the top of the profile editor
   - **Your profile image from Clerk is shared across all communities**

### For Developers

#### Custom Profile Fields Available:
- `nickname` (User table) - Unique across all communities
- `bio` (Profile table) - Community-specific
- `currentAffiliation` (Profile table) - Community-specific
- `url` (Profile table) - Community-specific
- `keywords` (Profile table) - Community-specific array
- **Profile image is handled by Clerk (`clerkUser.imageUrl`) - shared across communities**

#### API Integration:
- All profile updates go through existing API endpoints:
  - `/api/update/user` for nickname changes
  - `/api/update/profile` for profile-specific fields
  - **Image management is handled entirely by Clerk**
- Community context is automatically resolved from subdomain
- Profile data is scoped to current community via `getCommunityFromSubdomain()`

#### Component Structure:
```
src/components/
├── Navbar/
│   └── ConnectButton.tsx          # Updated with custom UserProfile pages
└── Profile/
    └── CommunityProfilePage.tsx   # New custom profile editing component
```

## Technical Implementation

### Clerk Integration
- Uses `<UserButton.UserProfilePage>` to add custom pages to Clerk's modal
- Reorders default pages to put "Community Profile" first
- Maintains Clerk's existing authentication and security features
- **Leverages Clerk's built-in image management system**

### State Management
- Integrates with existing `UserContext` for app-wide user state
- Uses React Query for profile data fetching and caching
- Form state management with real-time validation
- **Profile image state is handled by Clerk's `useUser()` hook**

### Community Awareness
- Leverages existing `useCommunity()` hook for community context
- Profile operations are automatically scoped to current community
- Pre-population logic when user creates profile in new community

### Image Handling
- **Simplified: Uses Clerk's built-in profile image system**
- **Users update their image through Clerk's "Account" settings**
- **Profile image is shared across all communities (not community-specific)**
- **Removed custom S3 integration complexity**

## Migration Notes

This integration maintains backward compatibility with your existing profile system:

- ✅ All existing profile data remains accessible
- ✅ Community-specific profiles continue to work as before
- ✅ Your standalone `/profile` page still functions
- ✅ All existing API endpoints remain unchanged
- ✅ Multi-tenant architecture is preserved
- ✅ **Image management is now simpler and more reliable**

## Benefits Achieved

1. **Simplified UX**: Users have a single, consistent place to manage their profile
2. **Reduced Complexity**: Less custom UI to maintain - leverages Clerk's polished components
3. **Better Integration**: Profile management feels native to the authentication flow
4. **Enhanced Security**: Benefits from Clerk's security best practices
5. **Mobile Responsive**: Clerk's components are mobile-optimized out of the box
6. **Accessibility**: Clerk's components follow accessibility standards
7. **Simplified Image Management**: No more custom S3 upload logic to maintain

## Future Enhancements

Potential improvements for the future:
- Deep linking to specific profile sections
- Bulk profile updates across communities
- Profile import/export functionality
- Advanced profile privacy controls per community
- Integration with Clerk's organization features for community management
- **Community-specific profile images (if needed, can be implemented as additional fields)**