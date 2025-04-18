import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { EventCard } from "@/components/ui/event-card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Event } from "@shared/schema";
import { Search, Grid2X2, List } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function EventsPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [date, setDate] = useState(searchParams.get("date") || "all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const eventsPerPage = 6;

  // Prepare API query parameters
  const queryParams: Record<string, string> = {};
  if (searchTerm) queryParams.search = searchTerm;
  if (category && category !== "all") queryParams.category = category;
  if (date && date !== "all") queryParams.date = date;
  
  console.log("Query params:", queryParams);
  
  // Fetch events with filters
  // Create a URL with query params for the API call
  const createUrl = () => {
    const url = new URL("/api/events", window.location.origin);
    if (category && category !== "all") url.searchParams.set("category", category);
    if (searchTerm) url.searchParams.set("search", searchTerm);
    if (date && date !== "all") url.searchParams.set("date", date);
    return url.toString();
  };
  
  const { data: events, isLoading, refetch } = useQuery<Event[]>({
    queryKey: ["/api/events", queryParams],
    queryFn: async () => {
      console.log("Fetching events with URL:", createUrl());
      const response = await fetch(createUrl());
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      return response.json();
    }
  });

  // Sort events
  let sortedEvents = events ? [...events] : [];
  
  if (sortBy === "newest") {
    sortedEvents.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  } else if (sortBy === "oldest") {
    sortedEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  } else if (sortBy === "alphabetical") {
    sortedEvents.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "popularity") {
    // For now, sort by capacity as a proxy for popularity
    sortedEvents.sort((a, b) => b.capacity - a.capacity);
  }
  
  // Pagination logic
  const totalEvents = sortedEvents.length;
  const totalPages = Math.ceil(totalEvents / eventsPerPage);
  
  const paginatedEvents = sortedEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update the URL with the search parameters
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (category && category !== "all") params.set("category", category);
    if (date && date !== "all") params.set("date", date);
    
    console.log("Searching with params:", {
      search: searchTerm,
      category: category,
      date: date
    });
    
    window.history.pushState({}, "", `/events?${params.toString()}`);
    setCurrentPage(1);
    
    // Force refetch with current filter params
    refetch();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Your Next Event</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover hackathons, workshops, seminars and more events happening around you
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Events</Label>
                <div className="relative">
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by keyword..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-3 px-4 bg-gray-50"
                  />
                  <span className="absolute right-3 top-3 text-gray-400">
                    <Search className="w-5 h-5" />
                  </span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</Label>
                <Select 
                  value={category} 
                  onValueChange={(value) => {
                    console.log("Selected category:", value);
                    setCategory(value);
                    // Immediately update the URL and refetch when category changes
                    const params = new URLSearchParams(window.location.search);
                    if (value && value !== "all") {
                      params.set("category", value);
                    } else {
                      params.delete("category");
                    }
                    window.history.pushState({}, "", `/events?${params.toString()}`);
                    // Trigger refetch after state update
                    setTimeout(() => refetch(), 0);
                  }}
                >
                  <SelectTrigger id="category" className="w-full py-6 bg-gray-50">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="hackathon">Hackathons</SelectItem>
                    <SelectItem value="workshop">Workshops</SelectItem>
                    <SelectItem value="seminar">Seminars</SelectItem>
                    <SelectItem value="conference">Conferences</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</Label>
                <Select value={date} onValueChange={setDate}>
                  <SelectTrigger id="date" className="w-full py-6 bg-gray-50">
                    <SelectValue placeholder="Any Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Date</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-weekend">This Weekend</SelectItem>
                    <SelectItem value="next-week">Next Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
          
          <div className="flex flex-col md:flex-row mb-6 justify-between items-center">
            <div className="flex-1 mb-4 md:mb-0">
              <span className="text-gray-700 font-medium">
                {isLoading ? (
                  "Loading events..."
                ) : totalEvents > 0 ? (
                  `Showing ${(currentPage - 1) * eventsPerPage + 1}-${Math.min(currentPage * eventsPerPage, totalEvents)} of ${totalEvents} events`
                ) : (
                  "No events found"
                )}
              </span>
            </div>
            <div className="flex space-x-4">
              <span className="text-gray-700">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-transparent border-none text-gray-700 w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Date (Newest)</SelectItem>
                  <SelectItem value="oldest">Date (Oldest)</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical (A-Z)</SelectItem>
                </SelectContent>
              </Select>
              <div className="hidden md:flex space-x-2">
                <button
                  className={`p-2 rounded-md text-gray-700 ${viewMode === 'list' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-primary text-white'}`}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid2X2 className="w-5 h-5" />
                </button>
                <button
                  className={`p-2 rounded-md text-gray-700 ${viewMode === 'grid' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-primary text-white'}`}
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : paginatedEvents.length > 0 ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
              {paginatedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
            </div>
          )}
          
          {totalPages > 1 && (
            <Pagination className="mt-12">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
