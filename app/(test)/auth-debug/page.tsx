"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AuthDebugInfo {
  user: any;
  session: any;
  cookies: Record<string, string>;
  error?: string;
}

export default function AuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      
      // Get cookies
      const cookies: Record<string, string> = {};
      document.cookie.split(";").forEach((cookie) => {
        const [name, value] = cookie.trim().split("=");
        if (name) {
          cookies[name] = decodeURIComponent(value || "");
        }
      });

      setDebugInfo({
        user,
        session,
        cookies,
      });
    } catch (error) {
      setDebugInfo({
        user: null,
        session: null,
        cookies: {},
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Auth Debug</h1>
          <p className="text-muted-foreground">Check authentication state and cookies</p>
        </div>

        <Button onClick={checkAuth} disabled={loading}>
          {loading ? "Checking..." : "Refresh"}
        </Button>

        {debugInfo && (
          <div className="space-y-4">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle>Current User</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded overflow-auto max-h-64 text-sm">
                  {debugInfo.user ? JSON.stringify(debugInfo.user, null, 2) : "No user"}
                </pre>
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle>Auth Session</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded overflow-auto max-h-64 text-sm">
                  {debugInfo.session ? JSON.stringify(debugInfo.session, null, 2) : "No session"}
                </pre>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle>Cookies ({Object.keys(debugInfo.cookies).length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {Object.entries(debugInfo.cookies).length > 0 ? (
                    Object.entries(debugInfo.cookies).map(([name, value]) => (
                      <div key={name} className="border-b pb-2 last:border-b-0">
                        <div className="font-mono text-sm font-semibold text-primary">
                          {name}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground break-all">
                          {value.substring(0, 100)}
                          {value.length > 100 ? "..." : ""}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No cookies found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Error */}
            {debugInfo.error && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-900">Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-800">{debugInfo.error}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
