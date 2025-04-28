import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/app/providers";

export default function NotifcationBell() {
  const notifications = useStore((state) => state.userNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:cursor-pointer"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {notifications.filter((n) => !n.read).length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
        </div>
        <div className="max-h-96 overflow-auto">
          {notifications.filter((n) => !n.read).map((notification) => (
            <Card
              key={notification.id}
              className="rounded-none border-0 p-4"
            >
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 mt-2 rounded-full bg-red-500" />
                <div>
                  <p className="text-sm font-medium">
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Just now
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="p-2 border-t">
          <Link href="/account/notifications">
            <Button
              variant="ghost"
              size="sm"
              className="w-full hover:cursor-pointer"
            >
              View all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
