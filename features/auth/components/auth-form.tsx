import * as React from "react"
import { Mail } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AuthForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome to Lexi</CardTitle>
          <CardDescription>
            Join our community and start your learning journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form>
                <div className="grid gap-6">
                  <div className="flex flex-col gap-4">
                    <Button variant="outline" className="w-full">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 mr-2">
                        <path
                          d="M12.48 10.92V14.5H18.42C18.18 15.65 17.13 18.06 14.48 19.89L14.45 19.92L17.21 22.06L17.4 22.2C19.16 21.05 23.01 18.12 23.01 12.18C23.01 11.39 22.92 10.66 22.81 9.94H12.48V10.92Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12.48 10.92V14.5H18.42C18.18 15.65 17.13 18.06 14.48 19.89L14.45 19.92L17.21 22.06L17.4 22.2C19.16 21.05 23.01 18.12 23.01 12.18C23.01 11.39 22.92 10.66 22.81 9.94H12.48V10.92Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M11.85 24C14.75 24 17.16 23.01 18.91 21.36L15.35 18.25C14.36 18.99 12.98 19.43 11.48 19.43C8.5 19.43 5.92 17.43 5.02 14.7L4.93 14.7L1.93 17.06L1.89 17.15C3.76 21.23 7.8 24 12.48 24H11.85V24Z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.02 14.7C4.77 13.9 4.63 13.04 4.63 12.18C4.63 11.32 4.77 10.46 5.02 9.66V9.66L2.1 7.39L2.01 7.47C1.16 9.17 0.67 11.09 0.67 13.12C0.67 15.15 1.16 17.07 2.01 18.77L5.02 14.7V14.7Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M11.85 4.75C13.88 4.75 15.53 5.62 16.32 6.38L19.78 3.12C17.65 1.16 14.75 0 11.85 0C7.17 0 3.13 2.77 1.25 6.85L5.02 9.66C5.92 6.93 8.5 4.93 11.48 4.93H11.85V4.75Z"
                          fill="#EA4335"
                        />
                      </svg>
                      Login with Google
                    </Button>
                  </div>
                  <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="email-login">Email</FieldLabel>
                      <Input
                        id="email-login"
                        type="email"
                        placeholder="m@example.com"
                        required
                      />
                    </Field>
                    <Field>
                      <div className="flex items-center">
                        <FieldLabel htmlFor="password-login">Password</FieldLabel>
                        <a
                          href="#"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
                      <Input id="password-login" type="password" required />
                    </Field>
                    <Button type="submit" className="w-full">
                      Login
                    </Button>
                  </FieldGroup>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form>
                <div className="grid gap-6">
                  <div className="flex flex-col gap-4">
                    <Button variant="outline" className="w-full">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 mr-2">
                        <path
                          d="M12.48 10.92V14.5H18.42C18.18 15.65 17.13 18.06 14.48 19.89L14.45 19.92L17.21 22.06L17.4 22.2C19.16 21.05 23.01 18.12 23.01 12.18C23.01 11.39 22.92 10.66 22.81 9.94H12.48V10.92Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M11.85 24C14.75 24 17.16 23.01 18.91 21.36L15.35 18.25C14.36 18.99 12.98 19.43 11.48 19.43C8.5 19.43 5.92 17.43 5.02 14.7L4.93 14.7L1.93 17.06L1.89 17.15C3.76 21.23 7.8 24 12.48 24H11.85V24Z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.02 14.7C4.77 13.9 4.63 13.04 4.63 12.18C4.63 11.32 4.77 10.46 5.02 9.66V9.66L2.1 7.39L2.01 7.47C1.16 9.17 0.67 11.09 0.67 13.12C0.67 15.15 1.16 17.07 2.01 18.77L5.02 14.7V14.7Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M11.85 4.75C13.88 4.75 15.53 5.62 16.32 6.38L19.78 3.12C17.65 1.16 14.75 0 11.85 0C7.17 0 3.13 2.77 1.25 6.85L5.02 9.66C5.92 6.93 8.5 4.93 11.48 4.93H11.85V4.75Z"
                          fill="#EA4335"
                        />
                      </svg>
                      Sign up with Google
                    </Button>
                  </div>
                  <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="email-signup">Email</FieldLabel>
                      <Input
                        id="email-signup"
                        type="email"
                        placeholder="m@example.com"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="password-signup">Password</FieldLabel>
                      <Input id="password-signup" type="password" required />
                    </Field>
                    <Button type="submit" className="w-full">
                      Create Account
                    </Button>
                  </FieldGroup>
                </div>
              </form>
            </TabsContent>
          </Tabs>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
