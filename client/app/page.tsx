import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-primary-700 mb-6">
          Badminton Squad
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Coordinate badminton sessions with your friends. Track availability,
          plan courts, and discuss sessions - all in one place.
        </p>
        <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
          <Button asChild size="lg" className="w-full md:w-auto">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full md:w-auto"
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
