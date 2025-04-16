"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Input } from "@/components/ui/input";
import { getUsername } from "@/db/database";
import { useState } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  username: z.string()
    .min(2, { message: "Username must be at least 2 characters." })
    .refine((username) => {
      return !checkUsernameExists(username);
    }, {
      message: "Save name already exists.",
    }),
  firstName: z.string()
    .min(2, { message: "First name must be at least 1 characters." }),
  lastName: z.string()
    .min(2, { message: "First name must be at least 1 characters." }),
  email: z.string()
    .min(2, { message: "First name must be at least 1 characters." }),
});

function checkUsernameExists(username: string) {
  console.log(username);
  return false;
}

interface User {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function ProfileForm() {
  const { user } = useKindeBrowserClient();
  const [activeUser, setActiveUser] = useState<User>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  const { data } = useQuery({
    queryKey: ["user"],
    queryFn: async (): Promise<User> => {
      const response = await getUsername(user.id);
      console.log(response);
      setActiveUser(activeUser);
      return response;
    },
  });

  console.log(["data"], data);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                This is your real First Name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
