import { Separator } from "@/components/ui/separator";

export default function SettingsProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Update your settings to better improve your experience.
        </p>
      </div>
      <Separator />
      <div>
        <p>Hello Settings</p>
      </div>
    </div>
  );
}
