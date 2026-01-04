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
import { Notification as NotificationType } from "@/types/types";
import { updateUserNotification } from "@/db/notifications/notification.service";

async function UpdateNotification(updateType: string, notificationId: string) {
  await updateUserNotification(updateType, notificationId);
}

export default function SettingsProfilePage() {
  const notifications = useStore((state) => state.userNotifications);
  const updateNotificationStore = useStore((state) =>
    state.updateUserNotifications
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  function markReadNotification(notification: NotificationType) {
    const updatedNotifications = notifications.map((n: NotificationType) => {
      return {
        ...n,
        read: n.id === notification.id ? true : n.read,
      };
    });
    updateNotificationStore(updatedNotifications);
  }

  function markUnreadNotification(notification: NotificationType) {
    const updatedNotifications = notifications.map((n: NotificationType) => {
      return {
        ...n,
        read: n.id === notification.id ? false : n.read,
      };
    });
    updateNotificationStore(updatedNotifications);
  }

  function markAllAsReadNotification() {
    const updatedNotifications = notifications.map((n: NotificationType) => {
      return {
        ...n,
        read: true,
      };
    });
    updateNotificationStore(updatedNotifications);
    UpdateNotification("readall", "");
  }

  function deleteNotification(notification: NotificationType) {
    const updatedNotifications = notifications.filter((n) =>
      n.id !== notification.id
    );
    updateNotificationStore(updatedNotifications);
  }

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
          <Button
            disabled={notifications.length <= 0}
            className="hover:cursor-pointer"
            variant="outline"
            size="sm"
            onClick={() => markAllAsReadNotification()}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col md:flex-row gap-6">
        {notifications.length <= 0
          ? <div>You have no more notifications.</div>
          : (
            <div className="flex-1">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="read">Read</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {notifications.sort((a) => a.read ? 1 : -1).map((
                    notification,
                  ) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      markReadNotification={markReadNotification}
                      markUnreadNotification={markUnreadNotification}
                      deleteNotification={deleteNotification}
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
                        markReadNotification={markReadNotification}
                        markUnreadNotification={markUnreadNotification}
                        deleteNotification={deleteNotification}
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
                        markReadNotification={markReadNotification}
                        markUnreadNotification={markUnreadNotification}
                        deleteNotification={deleteNotification}
                      />
                    ))}
                </TabsContent>
              </Tabs>
            </div>
          )}
      </div>
    </div>
  );
}

function NotificationCard({
  notification,
  markReadNotification,
  markUnreadNotification,
  deleteNotification,
}: {
  notification: NotificationType;
  markReadNotification: (notification: NotificationType) => void;
  markUnreadNotification: (notification: NotificationType) => void;
  deleteNotification: (notification: NotificationType) => void;
}) {
  function handleUpdateNotification(
    notification: NotificationType,
    updateType: string,
  ) {
    switch (updateType) {
      case "read":
        notification.read = false;
        markReadNotification(notification);

        break;
      case "unread":
        notification.read = true;
        markUnreadNotification(notification);
        break;
      case "delete":
        deleteNotification(notification);
        break;
    }
    UpdateNotification(updateType, notification.id);
  }

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
        <div className="flex justify-between gap-2 mt-4">
          <Button
            size="sm"
            className="hover:cursor-pointer"
            variant={notification.read ? "outline" : "default"}
            onClick={() => (
              handleUpdateNotification(
                notification,
                notification.read ? "unread" : "read",
              )
            )}
          >
            {notification.read ? "Mark as unread" : "Mark as read"}
          </Button>
          <Button
            size="sm"
            className="hover:cursor-pointer"
            variant={"destructive"}
            onClick={() => handleUpdateNotification(notification, "delete")}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
