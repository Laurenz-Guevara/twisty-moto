import { Separator } from "@/components/ui/separator";
import DeleteProfile from "@/components/delete-profile";

export default function SettingsProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
      </div>
      <Separator />
      <DeleteProfile />
    </div>
  );
}
