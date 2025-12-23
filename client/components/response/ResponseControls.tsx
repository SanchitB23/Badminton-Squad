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
    } catch (error) {
      console.error("Failed to update response:", error);
      // You might want to show a toast notification here
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
    <div className="flex gap-2 w-full">
      <Button
        variant={getButtonVariant("COMING")}
        size="sm"
        className="flex-1"
        onClick={() => handleResponseChange("COMING")}
        disabled={disabled || isLoading}
      >
        {showLoader("COMING") ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        <span className="ml-1">Coming</span>
      </Button>

      <Button
        variant={getButtonVariant("TENTATIVE")}
        size="sm"
        className="flex-1"
        onClick={() => handleResponseChange("TENTATIVE")}
        disabled={disabled || isLoading}
      >
        {showLoader("TENTATIVE") ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        <span className="ml-1">Maybe</span>
      </Button>

      <Button
        variant={getButtonVariant("NOT_COMING")}
        size="sm"
        className="flex-1"
        onClick={() => handleResponseChange("NOT_COMING")}
        disabled={disabled || isLoading}
      >
        {showLoader("NOT_COMING") ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
        <span className="ml-1">Can't make it</span>
      </Button>
    </div>
  );
}
