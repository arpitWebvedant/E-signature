import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center ">
      {/* 404 Illustration */}
      <Image
        src="/assets/img/not-found.png"
        alt="Not Found Illustration"
        width={300}                     
        height={200}                    
        className="mb-6"
        priority
      />
      <h1 className="text-2xl text-black font-medium mb-4">Page Not Found !</h1>
      <h1 className="text-sm mb-3">The page you are looking for might have been removed, had its name changed, or is <br />temporarily unavailable.</h1>
      <Link
        href="/"
        className="inline-block px-6 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
      >
        Back to home
      </Link>
    </div>
  )
}
