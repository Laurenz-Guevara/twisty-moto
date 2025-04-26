"use client";

import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/app/providers";
import { Notification as NotificationType } from "@/db/types";

export default function SettingsProfilePage() {
  const notifications = useStore((state) => state.userNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your notifications.
          </p>
        </div>
        <div className="flex items-center gap-2 mb-auto">
          <Button className="hover:cursor-pointer" variant="outline" size="sm">
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              {notifications
                .filter((n) => !n.read)
                .map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
            </TabsContent>

            <TabsContent value="read" className="space-y-4">
              {notifications
                .filter((n) => n.read)
                .map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function NotificationCard(
  { notification }: { notification: NotificationType },
) {
  return (
    <Card className="relative overflow-hidden">
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{notification.title}</CardTitle>
            <CardDescription className="text-xs">
              {notification.time.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </CardDescription>
          </div>
          <Badge variant={notification.read ? "outline" : "secondary"}>
            {notification.read ? "Read" : "Unread"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {notification.description}
        </p>
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant={notification.read ? "outline" : "default"}
          >
            {notification.read ? "Mark as unread" : "Mark as read"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
