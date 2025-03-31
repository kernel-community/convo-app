---
title: March 2025 - Timezones, Reminders, and More
date: "2025-03-31T00:00:00-04:00"
description: A roundup of all the exciting new features and improvements we've added to Convo this month
author: Angela Gilhotra
authorWebsite: https://convo.cafe/people/angelagilhotra
---
This month's focus has been: a reminder system, timezone support, email functionality, `beta` mode, a 'Manage Event' section.

### Timezone-Aware Scheduling

The app now captures and respects the timezone in which events are created. This means:

- Event times are displayed in the original creation timezone
- SEO images show accurate time information
- The datetime picker is cleaner and more intuitive
![Timezone interface](/images/blog/timezone-interface.png)
![SEO image](/images/blog/SEO.png)
### Enhanced Reminder System

- A 72-hour reminder that goes out to proposer and the attendees to give you more advance notice + prompt to invite your friends

### `Beta` mode + enhanced Stewards' abilities
- Added a new messaging feature that allows hosts and/or stewards to send messages to all attendees
- Implemented intelligent batch email sending for better performance
- Improved RSVP email templates for clarity and consistency
- Beta access is now limited to users with @kernel.community email addresses
- Added a beta badge to clearly indicate beta features
- Introduced the `UNLISTED` event type for private conversations (open only for beta users right now)
- Introduced the `TEST` event type for beta users to test the app
![Beta mode](/images/blog/beta-badge.png)

### What's Next?

*Click the link below to view what's planned for Version 2.2 & April 2025:*

[View What's Planned for Version 2.2 & April 2025](https://github.com/kernel-community/convo-app/milestone/10)

### Detailed Technical Changes

*Click the link below to view the complete technical changelog for March 2025:*

[View Full Technical Changelog for the month of March 2025](https://github.com/kernel-community/convo-app/commits/main?since=2025-03-01&until=2025-03-31)

### Key Technical Highlights

#### Reminder System
- Replaced 24-hour reminder with 72-hour reminder
- Enhanced scheduling system with async operations and rate limiting
- Implemented comprehensive reminder email utilities

#### Timezone Support
- Added creationTimezone field to Event model
- Modified client-side code to capture user's timezone
- Enhanced OG image generation with timezone awareness

#### Email Enhancements
- Implemented batch email sending with intelligent chunking
- Added messaging functionality for hosts to communicate with attendees
- Improved RSVP system with better handling

#### Beta Mode & Event Types
- Restricted beta features to @kernel.community users
- Added UNLISTED event type for private conversations
- Enhanced event display with better attendance information

*For a complete list of all technical changes with commit references, please visit our [GitHub repository](https://github.com/kernel-community/convo-app/commits/main).*
