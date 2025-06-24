# DR006: Community-Specific Profiles Testing Guide

**Date**: 2024-11-28

**Status**: Accepted

**Context**: The implementation of community-specific profiles required a comprehensive testing strategy covering automated tests, manual testing procedures, and API validation to ensure the feature works correctly across different communities.

**Decision**: Create a structured testing guide that covers automated testing scripts, manual testing procedures, and troubleshooting steps for community-specific profile functionality.

**Consequences**:
- Systematic approach to testing complex multi-tenant profile features
- Reduced risk of bugs in production through comprehensive test coverage
- Clear documentation for developers to validate their changes
- Maintenance overhead for keeping test procedures up to date
- Additional complexity in test environment setup

---

# Community-Specific Profiles Testing Guide

This guide explains how to test the new community-specific profile functionality.

## 🚀 Quick Start Testing

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Run Automated Tests
```bash
# Run the comprehensive test suite
node test-community-profiles.js
```

### 3. Set up Test Data (if needed)
```bash
# Create test user and communities
node setup-test-data.js
```

## 🧪 Manual Testing

### Test 1: Community Resolution
Test that different subdomains resolve to different communities:

```bash
# Test dev community
curl -s http://localhost:3000/api/query/community \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-subdomain: dev" \
  -d '{}' | jq '.data | {id, subdomain, displayName}'

# Test kernel community
curl -s http://localhost:3000/api/query/community \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-subdomain: kernel" \
  -d '{}' | jq '.data | {id, subdomain, displayName}'
```

### Test 2: Profile Creation in Different Communities
Create profiles for the same user in different communities:

```bash
# Create profile in dev community
curl -s http://localhost:3000/api/query/profile \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-subdomain: dev" \
  -d '{"userId": "test-user-123"}' | jq .

# Create profile in test community
curl -s http://localhost:3000/api/query/profile \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-subdomain: test" \
  -d '{"userId": "test-user-123"}' | jq .
```

### Test 3: Profile Updates
Update profiles separately for each community:

```bash
# Update profile in dev community
curl -s http://localhost:3000/api/update/profile \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-subdomain: dev" \
  -d '{
    "profile": {
      "userId": "test-user-123",
      "bio": "My bio in the dev community",
      "currentAffiliation": "Dev Team Lead"
    }
  }' | jq .

# Update profile in test community with different data
curl -s http://localhost:3000/api/update/profile \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-subdomain: test" \
  -d '{
    "profile": {
      "userId": "test-user-123",
      "bio": "My bio in the test community",
      "currentAffiliation": "Test Community Member"
    }
  }' | jq .
```

### Test 4: Profile Pre-population
Test that new community profiles are pre-populated with existing data:

```bash
# First, create and update a profile in one community
curl -s http://localhost:3000/api/update/profile \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-subdomain: dev" \
  -d '{
    "profile": {
      "userId": "test-user-123",
      "bio": "Original bio",
      "currentAffiliation": "Original Affiliation",
      "url": "https://example.com"
    }
  }' | jq .

# Then create a profile in a new community (should be pre-populated)
curl -s http://localhost:3000/api/query/profile \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-subdomain: newcommunity" \
  -d '{"userId": "test-user-123"}' | jq .
```

### Test 5: User Query with Community Context
Test that user queries return community-specific profiles:

```bash
# Get user data in dev community context
curl -s http://localhost:3000/api/query/user \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-subdomain: dev" \
  -d '{"userId": "test-user-123"}' | jq .

# Get user data in test community context
curl -s http://localhost:3000/api/query/user \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-subdomain: test" \
  -d '{"userId": "test-user-123"}' | jq .
```

## 🎯 Testing Scenarios

### Scenario 1: New User Joins Multiple Communities
1. User creates profile in Community A
2. User fills out bio, affiliation, etc.
3. User visits Community B subdomain
4. Profile is automatically created and pre-populated
5. User can customize profile for Community B

### Scenario 2: Profile Image Per Community
1. User uploads profile image in Community A
2. User visits Community B - no image (community-specific)
3. User can upload different image for Community B

### Scenario 3: Profile Migration
1. User has existing profile (not associated with any community)
2. User visits specific community subdomain
3. System creates community-specific profile pre-populated with existing data

## 🐛 Troubleshooting

### Server Not Responding
```bash
# Check if server is running
ps aux | grep "npm run dev"

# Restart server
pkill -f "npm run dev"
npm run dev
```

### Database Issues
```bash
# Check database connection
npx prisma db push

# View database in Prisma Studio
npx prisma studio
```

### Community Resolution Issues
Check middleware and community resolution logic:
- Verify communities exist in database
- Check subdomain header is being set correctly
- Review fallback logic in `getCommunityFromSubdomain`

## ✅ Expected Behavior

### Profile Creation
- ✅ Creates profile with `communityId` set to current community
- ✅ Pre-populates with data from other communities if available
- ✅ Returns appropriate error if user doesn't exist

### Profile Updates
- ✅ Updates only the profile for the current community
- ✅ Maintains separate profiles per community
- ✅ Preserves data across different communities

### Community Resolution
- ✅ Resolves correct community from subdomain
- ✅ Falls back to default community when needed
- ✅ Handles localhost development correctly

## 📊 Verification Checklist

- [ ] Profiles are created with correct `communityId`
- [ ] Profiles are separate between communities
- [ ] Profile updates only affect current community
- [ ] Pre-population works from existing profiles
- [ ] Community resolution works for all subdomains
- [ ] User queries return community-specific profiles
- [ ] Profile images are community-specific
- [ ] Error handling works correctly
- [ ] Database constraints are enforced
- [ ] API responses include community data

## 🔧 Development Tools

### Database Queries
```bash
# Check profiles for a user
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.profile.findMany({
  where: { userId: 'test-user-123' },
  include: { community: true }
}).then(console.log).finally(() => prisma.\$disconnect());
"

# Check all communities
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.community.findMany().then(console.log).finally(() => prisma.\$disconnect());
"
```

### API Testing with Different Tools
```bash
# Using httpie (if installed)
http POST localhost:3000/api/query/profile x-subdomain:dev userId=test-user-123

# Using wget
wget -qO- --post-data='{"userId":"test-user-123"}' \
  --header='Content-Type: application/json' \
  --header='x-subdomain: dev' \
  http://localhost:3000/api/query/profile
```