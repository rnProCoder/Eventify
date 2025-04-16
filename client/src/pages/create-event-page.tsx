import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { InsertEvent, insertEventSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

// Extended schema with validations
const createEventSchema = insertEventSchema.extend({
  // Ensure dates are properly parsed and validated
  startDate: z.date({
    required_error: "Start date is required",
    invalid_type_error: "Start date must be a valid date",
  }),
  endDate: z.date({
    required_error: "End date is required",
    invalid_type_error: "End date must be a valid date",
  }),
}).refine(data => {
  return data.endDate >= data.startDate;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export default function CreateEventPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof createEventSchema>>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "hackathon",
      location: "",
      startDate: new Date(),
      endDate: new Date(),
      capacity: 100,
      imageUrl: "",
      organizerId: user?.id,
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: z.infer<typeof createEventSchema>) => {
      const res = await apiRequest("POST", "/api/events", eventData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event created",
        description: "Your event has been created successfully.",
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof createEventSchema>) => {
    // Set the organizer ID from the logged-in user
    values.organizerId = user?.id;
    createEventMutation.mutate(values);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Create a New Event</h1>
              <p className="text-gray-600 mb-8">
                Fill out the form below to create your event. All fields marked with * are required.
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a descriptive title for your event" {...field} />
                        </FormControl>
                        <FormDescription>
                          Make it clear and catchy
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your event, what attendees can expect, and any other relevant details"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Be detailed about what participants will experience
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select event category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hackathon">Hackathon</SelectItem>
                              <SelectItem value="workshop">Workshop</SelectItem>
                              <SelectItem value="seminar">Seminar</SelectItem>
                              <SelectItem value="conference">Conference</SelectItem>
                              <SelectItem value="networking">Networking</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
                          <FormControl>
                            <Input placeholder="City, State or Virtual" {...field} />
                          </FormControl>
                          <FormDescription>
                            Physical location or "Virtual" for online events
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Maximum number of attendees"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of attendees
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="URL for event image (optional)" {...field} />
                          </FormControl>
                          <FormDescription>
                            Provide a URL to an image for your event
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full md:w-auto"
                      disabled={createEventMutation.isPending}
                    >
                      {createEventMutation.isPending ? "Creating..." : "Create Event"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
