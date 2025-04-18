import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/ui/event-card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Event } from "@shared/schema";
import { Calendar, Users, Shield, PieChart, Smartphone, Brain } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Get just 3 featured events
  const featuredEvents = events?.slice(0, 3) || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="md:flex md:items-center md:space-x-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Host, Discover & Join Amazing Events
              </h1>
              <p className="text-lg md:text-xl mb-6 text-indigo-100">
                Make your events stand out with our powerful platform. Perfect for hackathons, seminars, workshops and more.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href={user ? "/create-event" : "/auth"}>
                  <Button size="lg" className="bg-white text-primary font-medium hover:bg-gray-100 shadow-md hover:shadow-lg transition">
                    Create an Event
                  </Button>
                </Link>
                <Link href="/events">
                  <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary transition">
                    Browse Events
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://i.pinimg.com/736x/c9/88/0a/c9880a8abf25f389be7154e8fee18270.jpg" 
                alt="Events conference" 
                className="rounded-lg shadow-xl h-auto max-w-full object-cover"
                style={{ minHeight: "350px", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Events Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Events</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover upcoming hackathons, workshops, seminars and more events happening around you
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No events found. Be the first to create one!</p>
              <Link href={user ? "/create-event" : "/auth"}>
                <Button className="mt-4">Create Event</Button>
              </Link>
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link href="/events">
              <Button size="lg" variant="outline" className="font-medium">
                View All Events
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose EventHub?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform offers everything you need to create, manage and discover amazing events
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary mb-4">
                <Calendar className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Event Management</h3>
              <p className="text-gray-600">Create, edit, and manage your events with our intuitive dashboard. Track registrations, send updates, and more.</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary mb-4">
                <Users className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Built-in Networking</h3>
              <p className="text-gray-600">Engage attendees before, during, and after your event with our integrated networking features and discussion forums.</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary mb-4">
                <Shield className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Registration</h3>
              <p className="text-gray-600">Our platform ensures secure attendee registration with data encryption, verification, and privacy protection.</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary mb-4">
                <PieChart className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Powerful Analytics</h3>
              <p className="text-gray-600">Gain insights with detailed analytics on registrations, attendee engagement, and event performance metrics.</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary mb-4">
                <Smartphone className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Friendly</h3>
              <p className="text-gray-600">Access and manage your events on the go with our fully responsive design that works on all devices.</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-primary mb-4">
                <Brain className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Assistant</h3>
              <p className="text-gray-600">Get instant help with our AI chatbot that can answer questions, provide recommendations, and assist attendees.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Host Your Next Event?</h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who trust EventHub to create memorable experiences
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href={user ? "/create-event" : "/auth"}>
              <Button size="lg" className="bg-white text-primary font-medium hover:bg-gray-100 shadow-md hover:shadow-lg transition">
                Get Started for Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary transition">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
