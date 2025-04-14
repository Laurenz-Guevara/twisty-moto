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
import { useEffect, useState } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

const formSchema = z.object({
  username: z.string()
    .min(2, { message: "Username must be at least 2 characters." })
    .refine((username) => {
      return checkUsernameExists(username);
    }, {
      message: "Save name already exists.",
    }),
});

function checkUsernameExists(username: string) {
  console.log(username);
  return false;
}

export default function ProfileForm() {
  const { user, isAuthenticated } = useKindeBrowserClient();
  // TODO: Use tanstack query for db request
  const [activeUser, setActiveUser] = useState<{ username: string | null }>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  async function getUserFromUsers() {
    const currentUser = await getUsername(user.id);
    if (currentUser) {
      setActiveUser(currentUser[0]);
    }
  }

  useEffect(() => {
    if (user?.id && isAuthenticated) {
      getUserFromUsers();
    }
  }, [user]);

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
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder={activeUser?.username!} {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
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
