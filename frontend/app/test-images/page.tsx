"use client"

import { ArchitectureImage } from "@/components/architecture-image"

export default function ImageTestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Architecture Image Test</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
          <div key={id} className="h-48 bg-gray-100 rounded-lg overflow-hidden">
            <ArchitectureImage 
              blogId={id}
              category={`Category ${id}`}
              alt={`Test image ${id}`}
            />
          </div>
        ))}
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Direct Unsplash Test</h2>
      <div className="h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
        <img 
          src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop&auto=format&q=80"
          alt="Direct Unsplash test"
          className="w-full h-full object-cover"
          onLoad={() => console.log('Direct image loaded successfully')}
          onError={() => console.log('Direct image failed to load')}
        />
      </div>
    </div>
  )
}