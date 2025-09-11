# ALX Polly: A Modern Polling Application

Welcome to ALX Polly, a full-stack polling application built with Next.js, TypeScript, and Supabase. This project demonstrates modern web development concepts while focusing on secure authentication, real-time polling, and user experience best practices.

## 📋 Project Overview

ALX Polly is a comprehensive polling platform that enables users to:
- Create and manage custom polls with multiple choice options
- Vote on polls from other users
- View real-time poll results and statistics
- Manage their polls through a personalized dashboard
- Secure authentication and authorization

### Key Features
- **User Authentication**: Secure sign-up, login, and logout with email verification
- **Poll Creation**: Create polls with custom questions and multiple options
- **Voting System**: Real-time voting with result visualization
- **Dashboard**: Personal dashboard to manage created polls
- **Responsive Design**: Mobile-first responsive UI
- **Security**: Implements security best practices and server-side validation

## 🛠 Tech Stack

- **Frontend Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety
- **Backend & Database**: [Supabase](https://supabase.io/) for authentication and PostgreSQL database
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for responsive design
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) for consistent component library
- **Authentication**: Supabase Auth with server-side rendering (SSR)
- **State Management**: React Server Components and Client Components
- **Deployment**: Optimized for Vercel deployment

## 🚀 Getting Started

### Prerequisites

Before setting up ALX Polly, ensure you have the following installed:

- **Node.js**: Version 20.x or higher ([Download here](https://nodejs.org/))
- **npm** or **yarn**: Package manager (npm comes with Node.js)
- **Supabase Account**: Free account at [supabase.io](https://supabase.io/)
- **Git**: For cloning the repository

### 1. Clone the Repository

```bash
git clone https://github.com/GODSPE1/alx-polly.git
cd alx-polly
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Supabase Setup

1. **Create a new Supabase project**:
   - Go to [supabase.io](https://supabase.io/)
   - Click "New Project"
   - Choose your organization and provide project details

2. **Configure Database**:
   Run the following SQL in your Supabase SQL editor to create the required tables:

   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE,
     email TEXT,
     name TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
     PRIMARY KEY (id)
   );

   -- Create polls table
   CREATE TABLE polls (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
   );

   -- Create poll_options table
   CREATE TABLE poll_options (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
     option_text TEXT NOT NULL,
     vote_count INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
   );

   -- Create votes table
   CREATE TABLE votes (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
     option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
     user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
     UNIQUE(poll_id, user_id)
   );

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
   ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
   ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

   -- Create policies for profiles
   CREATE POLICY "Public profiles are viewable by everyone" ON profiles
     FOR SELECT USING (true);
   CREATE POLICY "Users can insert their own profile" ON profiles
     FOR INSERT WITH CHECK (auth.uid() = id);
   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);

   -- Create policies for polls
   CREATE POLICY "Polls are viewable by everyone" ON polls
     FOR SELECT USING (true);
   CREATE POLICY "Users can create polls" ON polls
     FOR INSERT WITH CHECK (auth.uid() = created_by);
   CREATE POLICY "Users can update own polls" ON polls
     FOR UPDATE USING (auth.uid() = created_by);
   CREATE POLICY "Users can delete own polls" ON polls
     FOR DELETE USING (auth.uid() = created_by);

   -- Create policies for poll_options
   CREATE POLICY "Poll options are viewable by everyone" ON poll_options
     FOR SELECT USING (true);
   CREATE POLICY "Poll creators can insert options" ON poll_options
     FOR INSERT WITH CHECK (
       auth.uid() = (SELECT created_by FROM polls WHERE id = poll_id)
     );

   -- Create policies for votes
   CREATE POLICY "Votes are viewable by everyone" ON votes
     FOR SELECT USING (true);
   CREATE POLICY "Users can vote" ON votes
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

3. **Get your Supabase credentials**:
   - Go to Project Settings → API
   - Copy your `Project URL` and `anon public` key

### 4. Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important**: Never commit your `.env.local` file to version control. It's already included in `.gitignore`.

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 6. Build for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 📱 Usage Examples

### Creating Your First Poll

1. **Sign Up/Login**: Visit the application and create an account or log in
2. **Navigate to Create Poll**: Click on "Create Poll" in the navigation
3. **Fill Poll Details**:
   ```
   Title: "What's your favorite programming language?"
   Options:
   - JavaScript
   - Python
   - TypeScript
   - Go
   ```
4. **Submit**: Click "Create Poll" to publish your poll

### Voting on Polls

1. **Browse Polls**: Visit the polls page to see all available polls
2. **Select a Poll**: Click on any poll to view details and voting options
3. **Cast Your Vote**: Select your preferred option and click "Vote"
4. **View Results**: See real-time results immediately after voting

### Managing Your Polls

1. **Dashboard Access**: Navigate to your dashboard to see polls you've created
2. **Edit Polls**: Click "Edit" on any of your polls to modify details
3. **Delete Polls**: Click "Delete" to remove polls (with confirmation)
4. **View Analytics**: See vote counts and participation metrics

### Example API Usage

The application provides server actions for poll management:

```typescript
// Creating a poll
const pollData = {
  title: "Sample Poll",
  options: ["Option 1", "Option 2", "Option 3"]
};
await createPoll(pollData);

// Voting on a poll
await vote(pollId, optionId);

// Fetching poll results
const results = await getPollResults(pollId);
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Manual Testing Checklist

- [ ] User registration with email verification
- [ ] User login and logout functionality
- [ ] Poll creation with multiple options
- [ ] Voting mechanism (one vote per user per poll)
- [ ] Poll editing and deletion (only by creator)
- [ ] Dashboard poll management
- [ ] Responsive design on mobile devices
- [ ] Error handling for invalid inputs

### Testing Different Scenarios

1. **Authentication Flow**:
   - Register with valid/invalid email formats
   - Login with correct/incorrect credentials
   - Test password reset functionality

2. **Poll Creation**:
   - Create polls with 2-10 options
   - Test with empty fields and validation
   - Create polls with special characters

3. **Voting System**:
   - Vote on different polls
   - Attempt to vote multiple times (should be prevented)
   - Vote as different users

## 🛡️ Security Features

ALX Polly implements several security best practices:

- **Authentication**: Secure email-based authentication with Supabase Auth
- **Authorization**: Row-level security (RLS) policies in database
- **Input Validation**: Server-side validation for all user inputs
- **CSRF Protection**: Built-in Next.js CSRF protection
- **SQL Injection Prevention**: Parameterized queries via Supabase client
- **XSS Protection**: Input sanitization and output encoding

## 📁 Project Structure

```
alx-polly/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── admin/              # Admin panel
│   │   ├── create/             # Poll creation
│   │   └── polls/              # Poll management
│   ├── auth/                    # Auth API routes
│   ├── components/              # Shared components
│   └── lib/                     # Utilities and actions
│       ├── actions/            # Server actions
│       ├── supabase/           # Supabase configuration
│       └── types/              # TypeScript types
├── components/                  # shadcn/ui components
├── lib/                        # Utility functions
├── public/                     # Static assets
└── README.md                   # Project documentation
```

## 📚 Code Documentation

ALX Polly features comprehensive inline documentation and docstrings throughout the codebase to ensure maintainability and security awareness.

### 🔐 Authentication System Documentation

**Location**: `app/lib/actions/auth-actions.ts`

**Documented Functions**:
- **`login()`** - Email/password authentication with security considerations
- **`register()`** - User registration with validation and email verification
- **`logout()`** - Secure session termination and cleanup
- **`getCurrentUser()`** - Server-side user retrieval for auth checks
- **`getSession()`** - Full session data access with token information

**Security Features Documented**:
- Server-side credential processing prevents client-side exposure
- HttpOnly cookies for secure session management
- Input validation and sanitization
- Protection against common authentication vulnerabilities
- Email verification workflow

### 📊 Poll Management Documentation

**Location**: `app/lib/actions/poll-actions.ts`

**Documented Functions**:
- **`createPoll()`** - Poll creation with transaction handling and ownership
- **`getUserPolls()`** - User-specific poll retrieval with authorization
- **`getPollById()`** - Public poll access for voting and viewing
- **`submitVote()`** - Secure voting with duplicate prevention
- **`deletePoll()`** - Poll deletion with cascading cleanup
- **`updatePoll()`** - Poll modification with ownership verification

**Key Features Documented**:
- Row-level security (RLS) policy enforcement
- Database transaction consistency
- Input validation and business rule enforcement
- Authorization checks for poll ownership
- Vote integrity and duplicate prevention

### 🗳️ Voting Interface Documentation

**Location**: `app/(dashboard)/polls/PollActions.tsx`

**Documented Components**:
- Poll card rendering with interactive elements
- Ownership-based action visibility
- Delete confirmation workflow
- Navigation to poll details and editing

**Security Measures Documented**:
- Client-side ownership verification
- Server-side validation for all actions
- User confirmation for destructive operations
- Secure poll management interfaces

### 🏠 Dashboard Layout Documentation

**Location**: `app/(dashboard)/layout.tsx`

**Documented Features**:
- Authentication state verification
- Responsive navigation structure
- User menu and profile management
- Secure logout functionality
- Error handling for auth failures

**Layout Components Documented**:
- Header with brand and navigation
- User dropdown menu with actions
- Content area with responsive design
- Authentication guard implementation

### ➕ Poll Creation Form Documentation

**Location**: `app/(dashboard)/create/PollCreateForm.tsx`

**Documented Functionality**:
- Dynamic option management (add/remove)
- Real-time form validation
- Error and success state handling
- Server action integration
- User experience optimizations

**Form Features Documented**:
- Minimum option requirements (2+)
- Client-side state management
- Server-side validation integration
- Success feedback and auto-navigation
- Accessibility considerations

### 📖 Documentation Standards

The codebase follows consistent documentation patterns:

**Function Documentation**:
```typescript
/**
 * Brief description of function purpose
 * 
 * @param paramName - Description of parameter
 * @returns Description of return value
 * 
 * @security Security considerations and measures
 * @validation Input validation rules
 * @example Usage example with code snippet
 */
```

**Component Documentation**:
```typescript
/**
 * @fileoverview Component purpose and features
 * 
 * Features:
 * - List of key features
 * 
 * Security:
 * - Security measures implemented
 * 
 * @example Usage example
 */
```

**Inline Comments**:
- Business logic explanations
- Security considerations
- TODO items and improvement suggestions
- Error handling rationale
- UX decision documentation

### 🔍 Documentation Benefits

The comprehensive documentation provides:

1. **Security Awareness** - Clear security measure documentation
2. **Code Understanding** - Detailed logic and business rule explanations
3. **Maintenance Support** - Future improvement guidance
4. **API Documentation** - Clear usage examples and parameter descriptions
5. **Error Handling** - Documented error scenarios and validation rules
6. **UX Guidelines** - User experience decisions and interaction patterns

This documentation ensures that developers can:
- Understand security implications of code changes
- Maintain consistent coding standards
- Extend functionality safely
- Debug issues effectively
- Follow established patterns

