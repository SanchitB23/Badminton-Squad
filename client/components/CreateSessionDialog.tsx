"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateSession } from "@/lib/hooks/useSessions";
import {
  createSessionSchema,
  type CreateSessionInput,
} from "@/lib/validations/session";
import { Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface CreateSessionDialogProps {
  children?: React.ReactNode;
}

export function CreateSessionDialog({ children }: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const createSession = useCreateSession();

  const form = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      start_time: "",
      end_time: "",
    },
  });

  const onSubmit = async (data: CreateSessionInput) => {
    try {
      await createSession.mutateAsync(data);
      form.reset();
      setOpen(false);
    } catch (error) {
      // Error is handled by the mutation
      console.error("Failed to create session:", error);
    }
  };

  // Helper function to get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    return format(new Date(), "yyyy-MM-dd");
  };

  // Helper function to get current time in HH:MM format
  const getCurrentTime = () => {
    return format(new Date(), "HH:mm");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Schedule a new badminton session for your group.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Session Title (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Weekly Badminton Match"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Sports Complex, Court 1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        min={
                          form.watch("start_time") ||
                          format(new Date(), "yyyy-MM-dd'T'HH:mm")
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Add any additional details about the session..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {createSession.error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">
                  {createSession.error instanceof Error
                    ? createSession.error.message
                    : "Failed to create session. Please try again."}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createSession.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createSession.isPending}>
                {createSession.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Session
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
