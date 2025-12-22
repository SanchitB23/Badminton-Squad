"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

import { signIn } from "@/lib/auth";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setGeneralError("");

    try {
      await signIn(data);
      router.push("/dashboard/sessions");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign in";
      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Sign in to Badminton Squad
            </CardTitle>
            <CardDescription>
              Or{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:text-primary/90"
              >
                create a new account
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
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
