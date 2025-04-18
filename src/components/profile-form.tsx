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
import { useEffect, useState } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { User as UserType } from "@/db/types";

const formSchema = z.object({
  username: z.string()
    .min(2, { message: "Username must be at least 2 characters." })
    .max(32, { message: "Username cannot exceed 32 characters." })
    .regex(/^\S+$/, { message: "Username cannot contain spaces." }),

  firstName: z.string()
    .min(2, { message: "First name must be at least 1 characters." })
    .max(32, { message: "First name cannot exceed 64 characters." })
    .optional()
    .or(z.literal("")),

  lastName: z.string()
    .min(2, { message: "First name must be at least 1 characters." })
    .max(32, { message: "Last name cannot exceed 64 characters." })
    .optional()
    .or(z.literal("")),
});

export default function ProfileForm() {
  const { user } = useKindeBrowserClient();
  const [activeUser, setActiveUser] = useState<UserType>({
    username: "",
    firstName: "",
    lastName: "",
    avatarUrl: "",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async (): Promise<UserType> => {
      const response = await getUsername(user.id);
      setActiveUser(activeUser);
      return response;
    },
  });

  useEffect(() => {
    if (!isLoading && data) {
      form.setValue("username", data.username);
      form.setValue("firstName", data.firstName);
      form.setValue("lastName", data.lastName);
    }
  }, [data]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading || !data) return;

    if (data.username.toLowerCase() !== values.username.toLowerCase()) {
      const usernameExists = await checkUsernameExists(values.username)
        .then(
          (exists) => {
            return exists;
          },
        );

      if (usernameExists) {
        form.setError("username", {
          type: "manual",
          message: "Username already exists. Please choose a different one.",
        });
        return;
      }
    }

    const request = await updateProfileInfo(user.id, values);

    switch (request.variant) {
      case ToastVariant.Success:
        toast.success(
          request.title,
          {
            description: request.description,
          },
        );
        break;
      default:
        toast.error(
          request.title,
          {
            description: request.description,
          },
        );
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
                <Button className="hover:cursor-pointer" type="submit">
                  Submit
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
