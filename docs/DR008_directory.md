# DR008: Directory

**Context**: 
We need to implement a Directory feature that displays all user profiles for a specific community in a grid layout. This will be accessible at `/directory` and will show community-specific profiles to help users discover other members in their community.

**Problem Statement**:
- Users need a way to browse and discover other community members
- Current network visualization (`/nook`) is complex and may not be suitable for simple profile browsing
- Need a clean, accessible directory of all community members with their profiles

**Solution Design**:

## Frontend Implementation

### Route Structure
- **Path**: `/directory`
- **Component**: `src/app/directory/page.tsx`
- **Layout**: Grid-based responsive design

### Profile Display
Each profile card will show:
- Profile image (with fallback to deterministic default)
- User nickname
- Bio (truncated if long)
- Current affiliation
- Keywords/tags
- City (if available)
- Social handle (if available)
- Optional: project name and description

### UI Components
- **ProfileCard**: Individual profile display component
- **ProfileGrid**: Responsive grid container (3-4 columns desktop, 1-2 mobile)
- **Search/Filter**: Optional future enhancement for filtering by keywords or affiliation

## Backend Implementation

### API Endpoint
- **Path**: `src/app/api/query/directory/route.ts`
- **Method**: GET
- **Authentication**: Public (no sensitive data exposed)

### Data Query Strategy
```typescript
// Community resolution using existing utility
const community = await getCommunityFromSubdomain();

// Query all users with community-specific profiles
const users = await prisma.user.findMany({
  where: {
    profiles: {
      some: {
        communityId: community.id
      }
    }
  },
  select: {
    id: true,
    nickname: true,
    profiles: {
      where: {
        communityId: community.id,
      },
      take: 1,
      select: {
        bio: true,
        image: true,
        keywords: true,
        currentAffiliation: true,
        city: true,
        socialHandle: true,
        project: true,
        projectDescription: true,
        url: true,
      },
    },
  },
  orderBy: {
    nickname: "asc",
  },
});
```

### Security & Privacy
**No sensitive information will be exposed**:
- ❌ Email addresses
- ❌ Custom data fields
- ❌ Upload metadata
- ❌ Profile history
- ❌ Beta status
- ✅ Only public profile fields (bio, image, keywords, affiliation, city, social handle, project info)

### Data Transformation
- Flatten user + profile data for frontend consumption
- Apply default profile picture logic using `getDefaultProfilePicture(user.id)`
- Handle empty/null profile fields gracefully
- Ensure consistent data structure

## Integration Points

### Community Resolution
- Uses existing `getCommunityFromSubdomain()` utility
- Automatically scopes all profiles to current community subdomain
- Follows established pattern from `/api/query/users` and `/api/nook/network-data`

### Profile Image Handling
- Leverages existing profile image logic
- Supports both legacy S3 images and new Clerk-managed images
- Uses deterministic default images from `getDefaultProfilePicture()`

### Existing Code Reuse
- Follows patterns from `/api/query/users/route.ts` for user querying
- Reuses profile selection logic from `/api/nook/network-data/route.ts`
- Consistent with community-scoped API endpoints

## Future Enhancements
1. **Search/Filtering**: Add client-side or server-side filtering by keywords, affiliation, or city
2. **Pagination**: If communities grow large, implement pagination or virtual scrolling
3. **Profile Links**: Link profile cards to individual profile pages
4. **Export**: Allow downloading directory as CSV for community organizers

**Consequences**:

## Positive Impact
- **Community Discovery**: Members can easily find others with similar interests or backgrounds
- **Community Building**: Facilitates connections within the community
- **Profile Visibility**: Encourages users to complete their profiles
- **Simple Navigation**: Provides an easy alternative to the complex network visualization

## Technical Benefits
- **Reuses Existing Infrastructure**: Leverages established patterns and utilities
- **Community-Scoped**: Automatically respects community boundaries via subdomain
- **Privacy-Conscious**: Only exposes public profile information
- **Performance-Friendly**: Simple query with minimal data transfer

## Considerations
- **Profile Completeness**: Some users may have minimal profile data
- **Performance**: Large communities may need pagination in the future
- **Maintenance**: Must be kept in sync with profile schema changes

## Implementation Files
- `src/app/directory/page.tsx` - Frontend directory page
- `src/app/api/query/directory/route.ts` - Backend API endpoint
- Optional: `src/components/ProfileCard.tsx` - Reusable profile card component
