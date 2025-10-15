# AI Wedding Planning Tools

This document describes the AI tools available in the chat backend for automated wedding planning actions.

## Overview

The chat backend (`supabase/functions/chat/index.ts`) includes four AI tools that enable automated action detection and execution:

1. **search_vendors** - Search for wedding vendors using OpenStreetMap
2. **record_payment** - Record vendor payments and update status
3. **mark_task_complete** - Mark checklist tasks as complete
4. **add_vendor_quick** - Quickly add vendors without searching

## Tool Descriptions

### 1. search_vendors

**Purpose**: Search for wedding vendors near the user's location using OpenStreetMap data.

**When to use**: When the user mentions a vendor name (e.g., "My photographer is Sarah's Studio", "We booked Elite Catering").

**Parameters**:
- `query` (required): Vendor name or search query
- `category` (required): Service type (Photography, Catering, Venue, etc.)
- `radius_km` (optional): Search radius in kilometers (default: 50)

**Behavior**:
- Searches OpenStreetMap for matching vendors
- Automatically adds found vendors to the user's vendor tracker
- Returns vendor details including name, address, phone, and website
- Provides friendly confirmation messages with emojis

**Example user input**: "I need to find a photographer in my area"

### 2. record_payment

**Purpose**: Record a payment made to a vendor and update their payment status.

**When to use**: When user mentions paying a vendor (e.g., "paid my florist the deposit", "sent $500 to the photographer").

**Parameters**:
- `vendor_name` (required): Name of the vendor
- `amount` (required): Payment amount in dollars
- `payment_type` (required): Type of payment (deposit, partial, full)

**Behavior**:
- Finds matching vendor in user's tracker (case-insensitive partial match)
- Updates vendor's paid amount
- Automatically marks vendor as fully paid if applicable
- Shows remaining balance
- Provides friendly confirmation with payment details

**Example user input**: "I paid my florist a $500 deposit"

**Confirmation message**:
```
💰 **Payment Recorded!**

✅ Added $500 deposit payment for **Florist**
💵 Total Paid: $500
📝 Remaining: $1500
```

### 3. mark_task_complete

**Purpose**: Mark a wedding planning task as complete or create and mark a new task.

**When to use**: When user mentions completing a task (e.g., "confirmed venue booking", "finished guest list", "sent invitations").

**Parameters**:
- `task_name` (required): Name of the completed task
- `category` (optional): Category of task (Venue, Catering, Invitations, etc.)

**Behavior**:
- Searches for matching incomplete task in user's checklist
- If found, marks it as complete
- If not found, creates new task and marks it as complete
- Provides encouraging confirmation message

**Example user input**: "I finished the guest list"

**Confirmation message**:
```
✅ **Task Complete!**

🎉 Marked "Guest List" as done!

Keep up the great work! 💪✨
```

### 4. add_vendor_quick

**Purpose**: Quickly add a vendor without searching when the user already knows their details.

**When to use**: When user mentions adding a specific vendor they already know (e.g., "Add photographer Sarah's Studio", "My DJ is Mike Jones").

**Parameters**:
- `vendor_name` (required): Name of the vendor
- `service_type` (required): Type of service (Photography, DJ, Catering, etc.)
- `amount` (optional): Total contract amount if mentioned
- `notes` (optional): Additional notes (contact info, details, etc.)

**Behavior**:
- Checks if vendor already exists in user's tracker
- If exists, notifies user
- If new, adds vendor with provided details
- Provides confirmation with vendor details

**Example user input**: "Add Sarah's Studio as my photographer for $3000"

**Confirmation message**:
```
✅ **Vendor Added!**

📸 **Sarah's Studio** - Photography
💰 Budget: $3000

You can view and edit in your Vendor Tracker! 💕
```

## Error Handling

All tools include comprehensive error handling with friendly, emoji-rich error messages:

- **Vendor not found**: "🤔 I couldn't find a vendor matching "{name}" in your tracker. Would you like to add them first?"
- **Database errors**: "⚠️ I had trouble recording that payment. Please try again!"
- **Location missing** (for search_vendors): "⚠️ I need your location to search for vendors nearby. Please enable location access in your profile settings."

## Implementation Details

### Tool Selection

The AI automatically selects appropriate tools based on user message content using the `tool_choice: "auto"` parameter in the AI API call.

### Tool Processing

Tools are processed sequentially in a loop, with each tool's response appended to the assistant message. This allows multiple actions to be taken from a single user message.

### Database Integration

All tools integrate with Supabase tables:
- `vendors`: For vendor tracking
- `checklist`: For task management
- User authentication ensures data isolation

### User Feedback

All confirmations follow a consistent pattern:
1. Emoji indicator (💰, ✅, 📸, etc.)
2. Bold header
3. Detailed information with emojis
4. Encouraging closing message

## Testing

To test the tools:

1. **Setup**: Ensure Supabase is running and user is authenticated
2. **Test record_payment**: Send message like "I paid my photographer $1000 deposit"
3. **Test mark_task_complete**: Send message like "I finished booking the venue"
4. **Test add_vendor_quick**: Send message like "Add John's Catering for $5000"
5. **Test search_vendors**: Send message like "Find photographers near me" (requires location)

## Future Enhancements

Possible improvements:
- Add undo functionality for tool actions
- Support for batch operations
- Enhanced vendor matching (fuzzy matching, multiple matches)
- Task dependency tracking
- Budget validation and warnings
