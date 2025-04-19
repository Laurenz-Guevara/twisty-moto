import { Separator } from "@/components/ui/separator";

export default function SettingsProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Manage your notifications.
        </p>
      </div>
      <Separator />
      <div>
        <p>Hello Notifications</p>
      </div>
    </div>
  );
}
