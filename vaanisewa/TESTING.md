# VaaniSewa Voice Authentication Testing Guide

## Phase 2B: Voice Authentication UI

### Prerequisites

1. **Backend Server Running**
   ```bash
   cd BookStore/Backend
   npm install
   npm start
   ```
   Backend should be running on http://localhost:4001

2. **Frontend Server Running**
   ```bash
   cd vaanisewa
   npm install
   npm run dev
   ```
   Frontend should be running on http://localhost:5173

3. **Browser Requirements**
   - Chrome, Edge, or Safari (Speech Recognition support required)
   - Microphone access permissions granted

### Testing Checklist

#### 1. Voice Signup Flow

**Step 1: Start Signup**
- Click the microphone button
- Say: **"Sign up"** or **"Create account"**
- System responds: "Let's create your account. Please tell me your full name."

**Step 2: Provide Name**
- Say your name: **"My name is John Doe"** or just **"John Doe"**
- System responds: "I heard your name as John Doe. Say correct to confirm, or repeat to say it again."
- Say: **"Correct"**
- ✅ **Pass if:** Name is confirmed and system asks for email

**Step 3: Provide Email**
- Say: **"john at example dot com"** or **"johndoe@example.com"**
- System responds: "I heard [email]. Say correct to confirm, or repeat to say it again."
- Say: **"Correct"**
- ✅ **Pass if:** Email is validated and confirmed

**Step 4: Provide Password**
- Say: **"password123"** (at least 6 characters)
- System responds: "Password received. Say correct to confirm, or repeat to say it again."
- Say: **"Correct"**
- System responds: "Creating account for [email]. Please wait."
- ✅ **Pass if:** Account is created successfully

**Expected Success Response:**
"Account created successfully! Welcome, John Doe. You are now logged in. Say browse books to continue."

**Testing Error Cases:**
- Invalid name (too short): Say **"A"**
  - Expected: "I need a valid name with at least two characters."
- Invalid email: Say **"notanemail"**
  - Expected: "That doesn't sound like a valid email address."
- Short password: Say **"123"**
  - Expected: "Password must be at least 6 characters long."
- Existing email: Try signing up with same email again
  - Expected: "This email already exists. Would you like to log in instead?"

#### 2. Voice Login Flow

**Step 1: Start Login**
- Say: **"Log in"** or **"Sign in"**
- System responds: "Let's log you in. Please tell me your email address."

**Step 2: Provide Email**
- Say: **"john at example dot com"**
- System responds: "I heard [email]. Say correct to confirm."
- Say: **"Correct"**

**Step 3: Provide Password**
- Say: **"password123"**
- System responds: "Password received. Say correct to confirm."
- Say: **"Correct"**
- System responds: "Logging in with [email]. Please wait."
- ✅ **Pass if:** Login succeeds

**Expected Success Response:**
"Login successful! Welcome back, John Doe. Say browse books to continue."

**Testing Error Cases:**
- Wrong password: Provide incorrect password
  - Expected: "Wrong email or password. Please try again."
- Non-existent email: Use email that doesn't exist
  - Expected: API error message

#### 3. Logout Functionality

**When logged in:**
- Say: **"Log out"** or **"Sign out"**
- Expected: "Goodbye, John Doe. You have been logged out."
- ✅ **Pass if:** User is logged out and welcome screen appears

#### 4. Confirmation System

**Testing "Repeat" Command:**
- During any confirmation step, say: **"Repeat"** or **"No"** or **"Wrong"**
- Expected: System asks for the input again
- ✅ **Pass if:** User can re-enter data

**Testing "Correct" Command:**
- During confirmation, say: **"Correct"** or **"Yes"** or **"Confirm"**
- Expected: System proceeds to next step
- ✅ **Pass if:** Flow continues

#### 5. Cancel Command

**At any step during signup/login:**
- Say: **"Cancel"** or **"Stop"** or **"Quit"**
- Expected: "signup cancelled. Say sign up, log in, or browse books." (or similar)
- ✅ **Pass if:** Flow is cancelled and returns to main menu

#### 6. Help Command

**At any time:**
- Say: **"Help"** or **"What can you do"**
- Expected: Context-appropriate help message
- ✅ **Pass if:** Relevant help is provided

#### 7. Voice Console Display

**Visual Feedback:**
- User messages appear in blue
- System messages appear in green
- Interim (listening) messages appear in gray
- ✅ **Pass if:** All messages display correctly with timestamps

#### 8. Authentication State Persistence

**After successful login:**
- Refresh the page
- Expected: User remains logged in (shows "Logged in as [name]")
- ✅ **Pass if:** Session persists across page refreshes

### Voice Recognition Tips

1. **Speak clearly** and at a normal pace
2. **Wait** for system to finish speaking before responding
3. **Use natural phrases**: "My email is" or just state the email
4. **For emails**: "john at example dot com" works better than reading out special characters

### Common Issues & Solutions

**Issue:** Microphone not working
- **Solution:** Check browser permissions (click lock icon in address bar)

**Issue:** Voice not recognized
- **Solution:** Check if using Chrome/Edge/Safari. Firefox has limited support.

**Issue:** Backend connection error
- **Solution:** Ensure BookStore backend is running on port 4001

**Issue:** Email format not recognized
- **Solution:** Say "at" for @ and "dot" for periods

**Issue:** Confirmation not working
- **Solution:** Say exactly "correct" or "yes", not "that's correct" or similar

### API Endpoints Used

- `POST /user/signup` - Create new account
  - Body: `{ fullname, email, password }`

- `POST /user/login` - Authenticate user
  - Body: `{ email, password }`

### Success Criteria

✅ Voice signup with valid data creates account
✅ Voice login after signup authenticates user
✅ Email validation catches invalid formats
✅ Password validation enforces 6+ characters
✅ API errors get user-friendly voice messages
✅ Cancel stops flow and returns to main menu
✅ VoiceDashboard shows appropriate commands for auth state
✅ Logout clears session and returns to welcome screen
✅ Confirmation system allows correction of misheard input
✅ Help command provides context-aware assistance

### Next Steps

After successful testing:
- ✅ Phase 2A: CommandParser & DialogueManager
- ✅ Phase 2B: Voice Authentication UI
- 🔄 Phase 3: Browse Books Voice Flow
- 🔄 Phase 4: Book Purchase Voice Flow
