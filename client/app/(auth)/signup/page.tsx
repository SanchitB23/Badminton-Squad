"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { signUp } from "@/lib/auth";
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const handleSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    setGeneralError("");

    try {
      await signUp(data);
      setSuccess(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create account";
      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Account Created!
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Your account has been created successfully. Please wait for
                    admin approval before you can access the app.
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/login">Go to Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Join Badminton Squad
            </CardTitle>
            <CardDescription>
              Or{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/90"
              >
                sign in to your account
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                {generalError && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-700">{generalError}</p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          autoComplete="name"
                          placeholder="Enter your full name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          autoComplete="tel"
                          placeholder="+91-9876543210"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          placeholder="Choose a strong password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-primary hover:text-primary/90"
              >
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
