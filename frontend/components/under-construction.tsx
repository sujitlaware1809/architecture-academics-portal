import Link from "next/link"
import { Construction, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UnderConstructionProps {
  title: string
  description?: string
}

export default function UnderConstruction({ 
  title, 
  description = "We're working hard to bring you this feature. Please check back soon!" 
}: UnderConstructionProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-100">
        <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Construction className="h-10 w-10 text-yellow-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full mb-6"></div>
        
        <p className="text-gray-600 mb-8 text-lg">
          {description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Button 
            className="w-full sm:w-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
      
      <div className="mt-12 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Architecture Academics. All rights reserved.
      </div>
    </div>
  )
}
