import { useRouteStore } from "@/app/stores/useRouteStore";
import { arrayMove } from "@dnd-kit/sortable";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";


export default function MoveRoute({
  direction,
  orderIndex,
}: {
  direction: "Up" | "Down";
  orderIndex: number;
}) {
  const updateRouteState = useRouteStore((s) => s.updateRouteData);
  const storedRouteJson = useRouteStore((s) => s.routeJson);
  const TOP_ROUTE = orderIndex === 0 && direction === "Up"
  const BOTTOM_ROUTE = orderIndex === storedRouteJson.length - 1 && direction === "Down"

  function moveRoute() {
    if (!storedRouteJson) return;

    const lastIndex = storedRouteJson.length - 1;
    const newIndex =
      direction === "Up"
        ? orderIndex - 1
        : orderIndex + 1;

    if (newIndex < 0 || newIndex > lastIndex) return;

    const reordered = arrayMove(
      storedRouteJson,
      orderIndex,
      newIndex
    ).map((item, index) => ({
      ...item,
      order: index,
    }));

    updateRouteState({ routeJson: reordered });
  }

  return (
    <DropdownMenuItem disabled={TOP_ROUTE || BOTTOM_ROUTE} onClick={moveRoute} className="cursor-pointer px-2 py-1 hover:bg-muted">
      Move {direction}
    </DropdownMenuItem>
  );
}

