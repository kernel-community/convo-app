# 🌐 Client-Side Testing Guide for Community-Specific Profiles

This guide explains how to test the community-specific profile functionality through the actual user interface in your browser.

## 🎯 **Overview**

The community-specific profiles feature allows users to have **different profiles in different communities** while automatically **pre-populating** new community profiles with existing data to minimize setup work.

## 🖥️ **Frontend User Flow**

### **1. Profile Pages That Use Community-Specific Data**

The following pages will show **different profile data** depending on the community subdomain:

- **`/profile`** - Your own profile editor (community-aware)
- **`/people/[nickname]`** - Public profile pages (community-aware)
- **`/nook`** - Social network view (shows community-specific profiles)

### **2. How Community Detection Works**

The frontend automatically detects communities through:
- **Subdomains**: `dev.convo.cafe`, `kernel.convo.cafe`, `test.convo.cafe`
- **Middleware**: Extracts community from subdomain and sets `x-subdomain` header
- **API calls**: All profile APIs use this header to fetch community-specific data

## 🧪 **Client-Side Testing Scenarios**

### **Scenario 1: Testing Your Own Profile**

**Step 1: Create/Edit Profile in First Community**
```
1. Visit: http://dev.localhost:3000/profile
2. Click "Edit Profile" or visit http://dev.localhost:3000/profile?edit=true
3. Fill out profile:
   - Bio: "I'm a developer working on cool projects"
   - Current Focus: "Building the future of web3"
   - Website: "https://mydevsite.com"
   - Add keywords: "React, TypeScript, Web3"
4. Upload a profile picture
5. Save changes
```

**Step 2: Check Profile in Different Community**
```
1. Visit: http://test.localhost:3000/profile
2. You should see:
   ✅ Bio pre-populated from dev community
   ✅ Current Focus pre-populated
   ✅ Website pre-populated
   ✅ Keywords pre-populated
   ❌ Profile picture NOT copied (community-specific)
```

**Step 3: Customize for New Community**
```
1. Click "Edit Profile"
2. Update profile for test community:
   - Bio: "Testing profiles in different communities"
   - Current Focus: "QA and Community Testing"
   - Upload different profile picture
3. Save changes
```

**Step 4: Verify Separation**
```
1. Go back to: http://dev.localhost:3000/profile
2. Should show original dev community profile
3. Go back to: http://test.localhost:3000/profile
4. Should show updated test community profile
```

### **Scenario 2: Testing Public Profile Pages**

**Step 1: View Public Profile in Different Communities**
```
1. Visit: http://dev.localhost:3000/people/TestUser
2. Note the profile data shown
3. Visit: http://test.localhost:3000/people/TestUser
4. Should show different profile data for same user
```

**Step 2: Profile Image Differences**
```
Expected behavior:
- Different communities can show different profile images
- Bio, affiliation, website may be different per community
- Keywords and interests may vary by community
```

### **Scenario 3: Testing Social Network View**

**Step 1: Check Nook/Network View**
```
1. Visit: http://dev.localhost:3000/nook
2. Click on user profiles in the network
3. Note the profile data shown in the popup
4. Visit: http://test.localhost:3000/nook
5. Same users should show different profile data
```

## 🔍 **What to Test in Each Page**

### **`/profile` Page (Your Profile)**

**Community-Aware Elements:**
- ✅ **Bio field** - should be different per community
- ✅ **Current Focus** - should be different per community
- ✅ **Website URL** - should be different per community
- ✅ **Profile image** - should be different per community
- ✅ **Keywords/Tags** - should be different per community
- ✅ **Pre-population** - new communities get existing data

**Testing Steps:**
```javascript
// Browser Console Test
fetch('/api/query/profile', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-subdomain': 'dev'
  },
  body: JSON.stringify({ userId: 'your-user-id' })
}).then(r => r.json()).then(console.log)
```

### **`/people/[nickname]` Page (Public Profiles)**

**Community-Aware Elements:**
- ✅ **Profile display** - shows community-specific data
- ✅ **Bio and affiliation** - community-specific
- ✅ **Profile images** - different per community
- ✅ **User events** - may be filtered by community

**Testing Steps:**
```
1. Create user with profiles in multiple communities
2. Visit their public profile on different subdomains
3. Verify different data is shown
4. Check that fallback works if no profile exists for current community
```

### **`/nook` Page (Social Network)**

**Community-Aware Elements:**
- ✅ **Profile popups** - show community-specific data
- ✅ **User avatars** - different images per community
- ✅ **Connection data** - may vary by community

## 🎨 **Visual Testing Checklist**

### **Profile Image Testing**
```
☐ Upload different images in dev vs test communities
☐ Verify images don't cross-pollinate between communities
☐ Check default avatars work correctly
☐ Test image upload flow in different communities
```

### **Data Consistency Testing**
```
☐ Bio field shows correct community-specific content
☐ Affiliation field is community-aware
☐ Website URLs can be different per community
☐ Keywords/tags are community-specific
☐ Pre-population works when joining new community
```

### **Navigation Testing**
```
☐ Profile edits save to correct community
☐ URL parameters work correctly (?edit=true)
☐ Profile updates refresh properly
☐ Community switching maintains separate data
```

## 🌍 **Testing with Different Subdomains**

### **Local Development Setup**
Since you're testing locally, you can simulate different communities:

**Option 1: Hosts File (Recommended)**
```bash
# Add to /etc/hosts (Mac/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 dev.localhost
127.0.0.1 test.localhost
127.0.0.1 kernel.localhost
```

Then visit:
- `http://dev.localhost:3000/profile`
- `http://test.localhost:3000/profile`
- `http://kernel.localhost:3000/profile`

**Option 2: Browser Developer Tools**
```javascript
// Override subdomain header in Network tab
// Or use browser extensions to modify headers
```

**Option 3: API Testing (Verified Working)**
```bash
# Test different communities via API
curl -H "x-subdomain: dev" -H "Content-Type: application/json" \
  -d '{"userId":"test-user-123"}' \
  http://localhost:3000/api/query/profile

curl -H "x-subdomain: test" -H "Content-Type: application/json" \
  -d '{"userId":"test-user-123"}' \
  http://localhost:3000/api/query/profile
```

## 🎭 **User Experience Testing**

### **New User Journey**
```
1. User signs up on dev.convo.cafe
2. Creates complete profile with image, bio, etc.
3. Later visits test.convo.cafe
4. Profile form is pre-filled with existing data
5. User can customize for test community
6. Both profiles exist independently
```

### **Existing User Migration**
```
1. User has old profile (not community-specific)
2. Visits community-specific subdomain
3. System creates community profile pre-populated with existing data
4. User experience is seamless
```

### **Profile Editing Flow**
```
1. User clicks "Edit Profile"
2. Form shows current community's data
3. Changes only affect current community
4. Other communities remain unchanged
5. Pre-population happens automatically for new communities
```

## 🐛 **Common Issues to Check**

### **Data Leakage**
```
❌ Profile changes in one community affecting another
❌ Images showing up in wrong communities
❌ Cached data showing incorrect community info
```

### **Pre-population Problems**
```
❌ New community profiles not getting existing data
❌ Images being copied between communities (should not happen)
❌ Empty profiles when user has existing data
```

### **UI/UX Issues**
```
❌ Edit mode not saving to correct community
❌ Profile pictures not uploading to correct community
❌ Form state being lost when switching communities
❌ Loading states not showing properly
```

## ✅ **Success Criteria**

The community-specific profiles are working correctly when:

1. **✅ Separate Data**: Each community shows different profile data
2. **✅ Pre-population**: New communities get existing user data
3. **✅ Image Isolation**: Profile images are community-specific
4. **✅ Edit Isolation**: Profile edits only affect current community
5. **✅ Fallback Logic**: Missing profiles fall back gracefully
6. **✅ URL Consistency**: Community detection works via subdomains
7. **✅ Performance**: No noticeable delays in community switching

## 🎯 **Quick Test Commands**

```bash
# Test profile creation
open "http://dev.localhost:3000/profile?edit=true"

# Test different communities
open "http://dev.localhost:3000/profile"
open "http://test.localhost:3000/profile"
open "http://kernel.localhost:3000/profile"

# Test public profiles
open "http://dev.localhost:3000/people/TestUser"
open "http://test.localhost:3000/people/TestUser"

# Test social network
open "http://dev.localhost:3000/nook"
open "http://test.localhost:3000/nook"
```

The key is that **each subdomain should feel like a separate community** with its own profile data, while **minimizing user effort** through smart pre-population! 🚀