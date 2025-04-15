import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Event } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  CalendarDays,
  Ticket,
  PenSquare,
  ListChecks
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch user's registered events
  const { data: registeredEvents, isLoading: isRegisteredLoading } = useQuery<Event[]>({
    queryKey: ["/api/user/events"],
  });
  
  // Fetch events organized by the user
  const { data: organizedEvents, isLoading: isOrganizedLoading } = useQuery<Event[]>({
    queryKey: ["/api/user/organized-events"],
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return await apiRequest("DELETE", `/api/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/organized-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
      });
      
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete event",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Cancel registration mutation
  const cancelRegistrationMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return await apiRequest("DELETE", `/api/events/${eventId}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/events"] });
      toast({
        title: "Registration cancelled",
        description: "Your registration has been cancelled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel registration",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Format date
  const formatDate = (date: Date | string) => {
    return format(new Date(date), "MMM d, yyyy");
  };
  
  // Handle delete confirmation
  const confirmDelete = (eventId: number) => {
    setDeleteEventId(eventId);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle delete event
  const handleDeleteEvent = () => {
    if (deleteEventId) {
      deleteEventMutation.mutate(deleteEventId);
    }
  };
  
  // Handle cancel registration
  const handleCancelRegistration = (eventId: number) => {
    cancelRegistrationMutation.mutate(eventId);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="bg-gray-50 py-8 flex-grow">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your events and registrations</p>
            </div>
            
            <Button className="mt-4 md:mt-0" onClick={() => navigate("/create-event")}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Event
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Ticket className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registered Events</p>
                    <p className="text-2xl font-bold">{registeredEvents?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <PenSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Organized Events</p>
                    <p className="text-2xl font-bold">{organizedEvents?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <ListChecks className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User Role</p>
                    <p className="text-2xl font-bold capitalize">{user?.role || 'attendee'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="registered">
            <TabsList className="mb-6">
              <TabsTrigger value="registered" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Registered Events
              </TabsTrigger>
              <TabsTrigger value="organized" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Organized Events
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="registered">
              <Card>
                <CardHeader>
                  <CardTitle>My Registered Events</CardTitle>
                  <CardDescription>
                    Events you have registered to attend
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isRegisteredLoading ? (
                    <div className="py-8 flex justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : registeredEvents && registeredEvents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registeredEvents.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">
                              <Link href={`/events/${event.id}`} className="hover:text-primary">
                                {event.title}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
                                {event.category}
                              </span>
                            </TableCell>
                            <TableCell>{formatDate(event.startDate)}</TableCell>
                            <TableCell>{event.location}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/events/${event.id}`)}
                                >
                                  View
                                </Button>
                                <Button 
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelRegistration(event.id)}
                                  disabled={cancelRegistrationMutation.isPending}
                                >
                                  {cancelRegistrationMutation.isPending ? "Cancelling..." : "Cancel"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No registered events</h3>
                      <p className="text-gray-500 mb-4">You haven't registered for any events yet.</p>
                      <Button onClick={() => navigate("/events")}>
                        Browse Events
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="organized">
              <Card>
                <CardHeader>
                  <CardTitle>Events I'm Organizing</CardTitle>
                  <CardDescription>
                    Events you've created and are managing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isOrganizedLoading ? (
                    <div className="py-8 flex justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : organizedEvents && organizedEvents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Capacity</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {organizedEvents.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">
                              <Link href={`/events/${event.id}`} className="hover:text-primary">
                                {event.title}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
                                {event.category}
                              </span>
                            </TableCell>
                            <TableCell>{formatDate(event.startDate)}</TableCell>
                            <TableCell>{event.capacity}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => navigate(`/events/${event.id}`)}>
                                    View Event
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate(`/edit-event/${event.id}`)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Event
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => confirmDelete(event.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Event
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No events created</h3>
                      <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
                      <Button onClick={() => navigate("/create-event")}>
                        Create Event
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteEvent}
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? "Deleting..." : "Delete Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
