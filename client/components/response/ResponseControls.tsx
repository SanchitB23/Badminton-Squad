"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Loader2 } from "lucide-react";
import { useUpdateSessionResponse } from "@/lib/hooks/useSessions";

interface ResponseControlsProps {
  sessionId: string;
  currentResponse?: "COMING" | "NOT_COMING" | "TENTATIVE" | null;
  disabled?: boolean;
}

export function ResponseControls({
  sessionId,
  currentResponse,
  disabled = false,
}: ResponseControlsProps) {
  const [pendingResponse, setPendingResponse] = useState<string | null>(null);
  const updateResponse = useUpdateSessionResponse();

  const handleResponseChange = async (
    status: "COMING" | "NOT_COMING" | "TENTATIVE"
  ) => {
    if (disabled || currentResponse === status) return;

    setPendingResponse(status);

    try {
      await updateResponse.mutateAsync({
        sessionId,
        status,
      });
    } catch (error: any) {
      console.error('Failed to update response:', error);
      
      // Show user-friendly error message
      const errorMessage = error?.message || 'Failed to update response. Please try again.';
      
      // You can replace this with a proper toast notification system
      alert(`Error: ${errorMessage}`);
      
      // If it's an auth error, the user might need to refresh/login
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('sign in')) {
        window.location.reload();
      }
    } finally {
      setPendingResponse(null);
    }
  };

  const getButtonVariant = (status: string) => {
    if (currentResponse === status) {
      return status === "COMING"
        ? "default"
        : status === "TENTATIVE"
        ? "secondary"
        : "destructive";
    }
    return "outline";
  };

  const isLoading = updateResponse.isPending;
  const showLoader = (status: string) =>
    isLoading && pendingResponse === status;

  return (
    <div className="flex gap-1 sm:gap-2 w-full">
      <Button
        variant={getButtonVariant("COMING")}
        size="sm"
        className="flex-1 min-h-[44px] touch-manipulation"
        onClick={() => handleResponseChange("COMING")}
        disabled={disabled || isLoading}
      >
        {showLoader("COMING") ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        <span className="ml-1 text-xs sm:text-sm">Coming</span>
      </Button>

      <Button
        variant={getButtonVariant("TENTATIVE")}
        size="sm"
        className="flex-1 min-h-[44px] touch-manipulation"
        onClick={() => handleResponseChange("TENTATIVE")}
        disabled={disabled || isLoading}
      >
        {showLoader("TENTATIVE") ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        <span className="ml-1 text-xs sm:text-sm">Maybe</span>
      </Button>

      <Button
        variant={getButtonVariant("NOT_COMING")}
        size="sm"
        className="flex-1 min-h-[44px] touch-manipulation"
        onClick={() => handleResponseChange("NOT_COMING")}
        disabled={disabled || isLoading}
      >
        {showLoader("NOT_COMING") ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
        <span className="ml-1 text-xs sm:text-sm hidden xs:inline">Can't make it</span>
        <span className="ml-1 text-xs sm:text-sm inline xs:hidden">No</span>
      </Button>
    </div>
  );
}
