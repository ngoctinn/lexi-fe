"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function FeedbackShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback (Alerts & Toasts)</CardTitle>
        <CardDescription>System notifications following the flat-depth inverted contrast principles.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold opacity-70 uppercase tracking-wider">Inline Alerts</p>
          <div className="flex flex-col gap-4 mt-2">
            <Alert variant="default">
              <AlertTitle>Default Alert</AlertTitle>
              <AlertDescription>
                This is a standard default message with solid shadow depth.
              </AlertDescription>
            </Alert>
            <Alert variant="info">
              <AlertTitle>Info</AlertTitle>
              <AlertDescription>
                System update is available. Please restart your application.
              </AlertDescription>
            </Alert>
            <Alert variant="success">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your changes have been saved successfully to the database.
              </AlertDescription>
            </Alert>
            <Alert variant="warning">
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Your subscription is expiring in 3 days. Please renew soon.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                We could not process your payment at this time.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold opacity-70 uppercase tracking-wider">Sonner Toasts</p>
          <div className="flex flex-wrap gap-3 mt-2">
            <Button variant="outline" onClick={() => toast("Event has been created", { description: "Sunday, December 03, 2023 at 9:00 AM" })}>
              Default
            </Button>
            <Button variant="outline" onClick={() => toast.info("New update available", { description: "A new software version is ready to be installed." })}>
              Info
            </Button>
            <Button variant="outline" onClick={() => toast.success("Payment successful", { description: "Your transaction has been processed." })}>
              Success
            </Button>
            <Button variant="outline" onClick={() => toast.warning("Low disk space", { description: "You are running out of storage space on your device." })}>
              Warning
            </Button>
            <Button variant="outline" onClick={() => toast.error("Error saving data", { description: "Please try again later or contact support." })}>
              Error
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
