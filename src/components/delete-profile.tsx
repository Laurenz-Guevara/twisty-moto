"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { deleteAccount } from "@/db/database";
import { getPrivateUserProfile } from "@/db/database";

const formSchema = z.object({
  email: z.string().min(2, {
    message:
      "Please enter your correct email address associated with this account.",
  }),
  confirmation: z.string().refine(
    (val) => val.toString() === "delete my account",
    {
      message: 'You must type "delete my account" to continue.',
    },
  ),
});

export default function DeleteProfile() {
  const { user } = useKindeBrowserClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      confirmation: "",
    },
  });

  const { data: userEmail } = useQuery({
    queryKey: ["email"],
    queryFn: async (): Promise<string> => {
      const response = await getPrivateUserProfile();
      return (response?.email || "");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submit", userEmail);
    try {
      deleteAccount(user.id, values.email);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Delete Account</h3>
        <p className="text-sm text-muted-foreground">
          This action will permanently delete your data, profile, uploaded
          images, routes, and all associated records. This cannot be undone.
        </p>
      </div>
      <Dialog onOpenChange={(isOpen) => isOpen && form.clearErrors()}>
        <DialogTrigger asChild>
          <Button className="hover:cursor-pointer" variant="destructive">
            Delete My Account
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Delete My Account</DialogTitle>
            <DialogDescription className="text-destructive">
              Final Warning: This action will permanently delete your data,
              profile, uploaded images, routes, and all associated records. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Enter your account&lsquo;s email address &apos;{user.email
                        ? user.email
                        : "email@domain.co.uk"}&apos; to continue:
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={user.email
                          ? user.email
                          : "email@domain.co.uk"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      To verify, type &apos;delete my account&apos; below:
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="delete my account" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="destructive" type="submit">
                  Delete Account
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
