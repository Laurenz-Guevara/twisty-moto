import { Separator } from "@/components/ui/separator";

export default function SettingsProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and payments.
        </p>
      </div>
      <Separator />
      <div>
        <p>Payments</p>
      </div>
    </div>
  );
}
