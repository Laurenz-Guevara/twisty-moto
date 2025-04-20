"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ToastVariant } from "@/db/enums";

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
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  checkUsernameExists,
  getUsername,
  updateProfileInfo,
} from "@/db/database";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { User as UserType } from "@/db/types";
import { LoaderCircle } from "lucide-react";
import { useStore } from "@/app/providers";

const formSchema = z.object({
  username: z.string()
    .min(2, { message: "Username must be at least 2 characters." })
    .max(16, { message: "Username cannot exceed 16 characters." })
    .regex(/^\S+$/, { message: "Username cannot contain spaces." }),

  firstName: z.string()
    .min(1, { message: "First name must be at least 1 characters." })
    .max(32, { message: "First name cannot exceed 64 characters." })
    .optional()
    .or(z.literal("")),

  lastName: z.string()
    .min(1, { message: "First name must be at least 2 characters." })
    .max(32, { message: "Last name cannot exceed 64 characters." })
    .optional()
    .or(z.literal("")),
});

export default function ProfileForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateDisplayProfile = useStore((state) => state.updateDisplayProfile);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
    },
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["user"],
    queryFn: async (): Promise<UserType> => {
      const response = await getUsername();

      if (response) {
        return response;
      } else {
        return {
          username: "",
          firstName: "",
          lastName: "",
          avatarUrl: "",
        };
      }
    },
  });

  const hasPreloadedForm = useRef(false);

  useEffect(() => {
    if (!hasPreloadedForm.current && !isLoading && data) {
      form.setValue("username", data.username);
      form.setValue("firstName", data.firstName);
      form.setValue("lastName", data.lastName);
      hasPreloadedForm.current = true;
    }
  }, [isLoading, data]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      if (isLoading || !data) return;

      await refetch();

      const newUsername = values.username.toLowerCase();
      const currentUsername = data.username.toLowerCase();

      if (newUsername !== currentUsername) {
        const usernameExists = await checkUsernameExists(values.username);

        if (usernameExists) {
          form.setError("username", {
            type: "manual",
            message: "Username already exists. Please choose a different one.",
          });
          return;
        }
      }

      const request = await updateProfileInfo(values);

      if (request.variant === ToastVariant.Success) {
        toast.success(request.title, {
          description: request.description,
        });

        updateDisplayProfile({ username: values.username });
      } else {
        toast.error(request.title, {
          description: request.description,
        });
      }
    } catch (error) {
      toast.error("Something went wrong.", {
        description: `Please try again later. ${error}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {!isLoading
            ? (
              <>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Username*<span className="text-muted-foreground">
                          (required)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={"Username"}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        First Name
                        <span className="text-muted-foreground">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={"First Name"}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is your first name (this won’t be publicly shown)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Last Name
                        <span className="text-muted-foreground">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={"Last Name"}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is your last name (this won’t be publicly shown)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={isSubmitting}
                  className="hover:cursor-pointer min-w-[130px]"
                  type="submit"
                >
                  {isSubmitting
                    ? (
                      <span className="flex justify-center">
                        <LoaderCircle className="animate-spin" />
                      </span>
                    )
                    : <span>Update Profile</span>}
                </Button>
              </>
            )
            : (
              <>
                <SkeletonForm />
                <SkeletonForm />
                <SkeletonForm />
                <Skeleton className="w-full max-w-[80px] h-[38px] rounded-md" />
              </>
            )}
        </form>
      </Form>
    </>
  );
}

function SkeletonForm() {
  return (
    <div className="space-y-2">
      <Skeleton className="w-full max-w-[142px] h-[16px] rounded-md" />
      <Skeleton className="w-full h-[36px] rounded-md" />
      <Skeleton className="w-full max-w-[340px] h-[16px] rounded-md" />
    </div>
  );
}
