# Voice Cloning Frontend

This is the frontend application for the Voice Cloning project, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Modern, responsive user interface
- Real-time voice cloning capabilities
- Audio file upload and processing
- Integration with backend voice cloning services

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## Getting Started

1. Clone the repository:
```bash
git clone <your-frontend-repo-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
NEXT_PUBLIC_API_URL=your_backend_api_url
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
frontend/
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # Reusable UI components
│   ├── styles/       # Global styles and Tailwind config
│   └── utils/        # Utility functions
├── public/           # Static assets
└── ...
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- React
- Axios for API calls

## Deployment

The application can be deployed to various platforms:

- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Custom server

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
