export const metadata = {
  title: 'Architecture Courses | Learn Architecture Online',
  description: 'Explore our comprehensive collection of architecture courses taught by industry experts. Learn architectural design, sustainability, digital modeling, and more.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="fixed top-4 left-4 z-50">
        <a 
          href="/" 
          className="flex items-center gap-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-blue-600 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </a>
      </div>
      {children}
    </div>
  );
}
