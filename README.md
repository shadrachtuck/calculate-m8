# Calculate M8

A mobile calculator app built with React, Capacitor, and Supabase.

Check it out here: https://shadrachtuck.github.io/calculate-m8/

Soon to be in available in ios and android app stores!

## Features

- Basic calculator operations (addition, subtraction, multiplication, division)
- Computation history
- Mobile-friendly UI
- Supabase integration for storing calculations

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/calculate-m8.git
cd calculate-m8
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Create the following table in your Supabase database:
```sql
create table computations (
  id uuid default uuid_generate_v4() primary key,
  computation text not null,
  result numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Development

1. Start the development server:
```bash
npm run dev
```

2. Build the app:
```bash
npm run build
```

## Mobile Development

### Android

1. Add Android platform:
```bash
npx cap add android
```

2. Open in Android Studio:
```bash
npx cap open android
```

### iOS

1. Add iOS platform:
```bash
npx cap add ios
```

2. Open in Xcode:
```bash
npx cap open ios
```

## Building for Production

1. Build the web app:
```bash
npm run build
```

2. Copy web assets to native projects:
```bash
npx cap copy
```

3. Update native projects:
```bash
npx cap update
```

4. Build and run on your device or emulator using Android Studio or Xcode.

## Deployment

This project is configured for deployment on Vercel.

### Deploying to Vercel

1. Install the Vercel CLI (optional):
```bash
npm i -g vercel
```

2. Deploy using one of these methods:
   - **Via Vercel Dashboard**: Connect your GitHub repository to Vercel at [vercel.com](https://vercel.com). Vercel will automatically detect the Vite configuration and deploy.
   - **Via CLI**: Run `vercel` in the project root and follow the prompts.

3. Configure environment variables in Vercel:
   - Go to your project settings in Vercel
   - Add the following environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

Vercel will automatically build and deploy your app on every push to your main branch.

## License

MIT # calculate-m8
