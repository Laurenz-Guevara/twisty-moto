import { useRouteStore } from "@/app/stores/useRouteStore";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function DeleteWaypoint({ order }: { order: number }) {
  const routeJson = useRouteStore((s) => s.routeJson);
  const updateRouteState = useRouteStore((s) => s.updateRouteData);

  const handleDelete = () => {
    const filtered = routeJson
      .filter((item) => item.order !== order)
      .map((item, index) => ({
        ...item,
        order: index,
      }));

    updateRouteState({ routeJson: filtered });
  };

  return (
    <DropdownMenuItem onClick={handleDelete} variant="destructive">
      <button >
        Delete
      </button>
    </DropdownMenuItem>
  );
}

