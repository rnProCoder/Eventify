import { Link } from "wouter";
import { Calendar, Facebook, Twitter, Instagram, GitPullRequest } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">EventHub</span>
            </div>
            <p className="text-gray-400 mb-4">
              The modern platform for event management, discovery, and networking. Create and join amazing events with ease.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <GitPullRequest className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li><Link href="/"><a className="text-gray-400 hover:text-white">Home</a></Link></li>
              <li><Link href="/events"><a className="text-gray-400 hover:text-white">Events</a></Link></li>
              <li><Link href="/create-event"><a className="text-gray-400 hover:text-white">Create Event</a></Link></li>
              <li><Link href="/dashboard"><a className="text-gray-400 hover:text-white">Dashboard</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h2 className="font-semibold text-lg mb-4">Event Types</h2>
            <ul className="space-y-2">
              <li><Link href="/events?category=hackathon"><a className="text-gray-400 hover:text-white">Hackathons</a></Link></li>
              <li><Link href="/events?category=workshop"><a className="text-gray-400 hover:text-white">Workshops</a></Link></li>
              <li><Link href="/events?category=seminar"><a className="text-gray-400 hover:text-white">Seminars</a></Link></li>
              <li><Link href="/events?category=conference"><a className="text-gray-400 hover:text-white">Conferences</a></Link></li>
              <li><Link href="/events?category=networking"><a className="text-gray-400 hover:text-white">Networking</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h2 className="font-semibold text-lg mb-4">Support</h2>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} EventHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
