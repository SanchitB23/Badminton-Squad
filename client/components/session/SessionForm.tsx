"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateSession } from "@/lib/hooks/useSessions";
import { sessionSchema, type SessionFormData } from "@/lib/validations/session";
import { formatErrorMessage } from "@/lib/utils/errors";
import { Loader2, Calendar, Clock, MapPin, FileText } from "lucide-react";

interface SessionFormProps {
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  mode?: 'create' | 'edit';
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    location: string;
    start_time: string;
    end_time: string;
  };
}

export function SessionForm({ onSuccess, onLoadingChange, mode = 'create', initialData }: SessionFormProps) {
  const [generalError, setGeneralError] = useState("");
  const createSession = useCreateSession();

  // Convert datetime string to datetime-local format
  const formatDateTimeLocal = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      start_time: initialData?.start_time ? formatDateTimeLocal(initialData.start_time) : "",
      end_time: initialData?.end_time ? formatDateTimeLocal(initialData.end_time) : "",
    },
  });

  const handleSubmit = async (data: SessionFormData) => {
    setGeneralError("");
    onLoadingChange?.(true);

    try {
      if (mode === 'edit' && initialData?.id) {
        // Handle session update
        const response = await fetch(`/api/sessions/${initialData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to update session');
        }
      } else {
        // Handle session creation
        await createSession.mutateAsync(data);
      }
      
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = formatErrorMessage(error);
      setGeneralError(errorMessage);
    } finally {
      onLoadingChange?.(false);
    }
  };

  const isLoading = createSession.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* General Error Display */}
        {generalError && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error creating session
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{generalError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Title Field (Optional) */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Session Title (Optional)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Weekend Doubles, Morning Practice"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field (Optional) */}
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

        {/* Location Field (Required) */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Sports Complex Court 1, Community Center Hall"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date and Time Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Time */}
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start Date & Time *
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Time */}
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  End Date & Time *
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Timezone Notice */}
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <Calendar className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Timezone Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  All times are in Indian Standard Time (IST). The session must be scheduled for a future date,
                  and start/end times must be on the same day.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {mode === 'edit' ? 'Updating Session...' : 'Creating Session...'}
              </>
            ) : (
              mode === 'edit' ? 'Update Session' : 'Create Session'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}