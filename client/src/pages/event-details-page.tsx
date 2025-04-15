import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Event, EventRegistration } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  ArrowLeft,
  CalendarPlus,
  CalendarMinus,
  User
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const categoryColors: Record<string, string> = {
  hackathon: "bg-amber-500 hover:bg-amber-600",
  workshop: "bg-emerald-500 hover:bg-emerald-600",
  seminar: "bg-indigo-400 hover:bg-indigo-500",
  conference: "bg-blue-500 hover:bg-blue-600",
  networking: "bg-purple-500 hover:bg-purple-600",
};

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>();
  const eventId = parseInt(params.id);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch event details
  const { data: event, isLoading: isEventLoading, error: eventError } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !isNaN(eventId)
  });
  
  // Check if user is registered
  const { data: registrationStatus, isLoading: isRegistrationLoading } = useQuery<{ isRegistered: boolean }>({
    queryKey: [`/api/events/${eventId}/is-registered`],
    enabled: !isNaN(eventId) && !!user
  });
  
  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/events/${eventId}/register`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/is-registered`] });
      toast({
        title: "Registration successful",
        description: "You have successfully registered for this event.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Cancel registration mutation
  const cancelRegistrationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/events/${eventId}/register`, {});
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/is-registered`] });
      toast({
        title: "Registration cancelled",
        description: "Your registration has been cancelled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Format dates
  const formatDate = (date: Date | string) => {
    const dateObj = new Date(date);
    return format(dateObj, "EEEE, MMMM d, yyyy");
  };
  
  // Handle registration
  const handleRegister = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in or sign up to register for events.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    registerMutation.mutate();
  };
  
  // Handle cancellation
  const handleCancelRegistration = () => {
    cancelRegistrationMutation.mutate();
  };
  
  // Handle share event
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: `Check out this event: ${event?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied to clipboard",
        description: "You can now share it with others.",
      });
    }
  };
  
  if (isEventLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (eventError || !event) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 md:px-6 py-12">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
            <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/events")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4 md:px-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/events")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative">
              <img 
                src={event.imageUrl || `https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80`}
                alt={event.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge className={`${categoryColors[event.category] || 'bg-gray-500'} text-white font-bold px-3 py-1`}>
                  {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                </Badge>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="mb-6 md:mb-0 md:pr-8 flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 mb-6 space-y-2 sm:space-y-0 sm:space-x-6">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-primary" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-8">
                    <Button 
                      className="flex-1 sm:flex-none"
                      onClick={handleShare}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Event
                    </Button>
                    
                    {!isRegistrationLoading && user && (
                      registrationStatus?.isRegistered ? (
                        <Button 
                          variant="destructive"
                          className="flex-1 sm:flex-none"
                          onClick={handleCancelRegistration}
                          disabled={cancelRegistrationMutation.isPending}
                        >
                          <CalendarMinus className="mr-2 h-4 w-4" />
                          {cancelRegistrationMutation.isPending ? "Cancelling..." : "Cancel Registration"}
                        </Button>
                      ) : (
                        <Button 
                          variant="default"
                          className="flex-1 sm:flex-none"
                          onClick={handleRegister}
                          disabled={registerMutation.isPending}
                        >
                          <CalendarPlus className="mr-2 h-4 w-4" />
                          {registerMutation.isPending ? "Registering..." : "Register Now"}
                        </Button>
                      )
                    )}
                    
                    {!user && (
                      <Button 
                        variant="default"
                        className="flex-1 sm:flex-none"
                        onClick={handleRegister}
                      >
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Register Now
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 md:w-64 lg:w-80">
                  <h3 className="font-semibold text-gray-900 mb-4">Event Details</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Date & Time</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(event.startDate)}
                          {event.startDate !== event.endDate && ` to ${formatDate(event.endDate)}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Location</p>
                        <p className="text-sm text-gray-600">{event.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Users className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Capacity</p>
                        <p className="text-sm text-gray-600">{event.capacity} attendees</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <User className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Organizer</p>
                        <p className="text-sm text-gray-600">ID: {event.organizerId}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <Tabs defaultValue="about">
              <TabsList className="w-full sm:w-auto grid sm:inline-grid grid-cols-2 sm:grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
                <TabsTrigger value="speakers">Speakers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Event</CardTitle>
                    <CardDescription>Detailed information about the event</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-line">{event.description}</p>
                      
                      <h3 className="text-xl font-semibold mt-8 mb-4">What to expect</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Networking opportunities with industry professionals</li>
                        <li>Hands-on workshops and learning sessions</li>
                        <li>Q&A sessions with experienced mentors</li>
                        <li>Potential collaborations with like-minded individuals</li>
                      </ul>
                      
                      <h3 className="text-xl font-semibold mt-8 mb-4">Who should attend</h3>
                      <p>This event is perfect for students, professionals, and enthusiasts interested in {event.category}s. Whether you're a beginner or an expert, there's something for everyone!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="agenda" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Agenda</CardTitle>
                    <CardDescription>Schedule and timeline for the event</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Day 1 - {formatDate(event.startDate)}</h3>
                        <div className="border-l-2 border-primary pl-4 space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">9:00 AM - 10:00 AM</p>
                            <p className="font-medium">Registration & Welcome Coffee</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">10:00 AM - 11:30 AM</p>
                            <p className="font-medium">Opening Keynote</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">11:45 AM - 1:00 PM</p>
                            <p className="font-medium">Workshop Session I</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">1:00 PM - 2:00 PM</p>
                            <p className="font-medium">Lunch Break & Networking</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">2:00 PM - 4:00 PM</p>
                            <p className="font-medium">Workshop Session II</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">4:15 PM - 5:30 PM</p>
                            <p className="font-medium">Panel Discussion</p>
                          </div>
                        </div>
                      </div>
                      
                      {event.startDate !== event.endDate && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Day 2 - {formatDate(event.endDate)}</h3>
                          <div className="border-l-2 border-primary pl-4 space-y-4">
                            <div>
                              <p className="text-sm text-gray-500">9:30 AM - 10:30 AM</p>
                              <p className="font-medium">Recap & Morning Session</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">10:45 AM - 12:30 PM</p>
                              <p className="font-medium">Advanced Workshop</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">12:30 PM - 1:30 PM</p>
                              <p className="font-medium">Lunch Break</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">1:30 PM - 3:30 PM</p>
                              <p className="font-medium">Hands-on Session</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">3:45 PM - 5:00 PM</p>
                              <p className="font-medium">Closing Remarks & Networking</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-6">
                      * The agenda is subject to change. Attendees will be notified of any updates.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="speakers" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Speakers & Presenters</CardTitle>
                    <CardDescription>Learn about the experts at this event</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex space-x-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <User className="h-8 w-8" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold">TBD</h4>
                          <p className="text-sm text-gray-600">Speaker information will be updated soon</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600">
                        Speaker information will be announced closer to the event date. Check back later for updates.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
