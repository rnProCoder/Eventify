import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { Event } from "@shared/schema";

const categoryColors: Record<string, string> = {
  hackathon: "bg-amber-500 hover:bg-amber-600",
  workshop: "bg-emerald-500 hover:bg-emerald-600",
  seminar: "bg-indigo-400 hover:bg-indigo-500",
  conference: "bg-blue-500 hover:bg-blue-600",
  networking: "bg-purple-500 hover:bg-purple-600",
};

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const formattedDate = (date: Date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const dateRange = () => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    // Same day
    if (
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getDate() === endDate.getDate()
    ) {
      return formattedDate(startDate);
    }
    
    // Different days
    return `${formattedDate(startDate)} - ${formattedDate(endDate)}`;
  };
  
  return (
    <Card className="overflow-hidden transition duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative">
        <img 
          src={event.imageUrl || `https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge className={`${categoryColors[event.category] || 'bg-gray-500'} text-white font-bold`}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center text-sm mb-4 text-gray-600">
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {dateRange()}
          </span>
          <span className="mx-2">•</span>
          <span className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {event.location}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-primary">{event.capacity} Capacity</span>
          <Link href={`/events/${event.id}`} className="inline-flex items-center font-medium text-primary hover:text-primary-dark">
            View Details
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
