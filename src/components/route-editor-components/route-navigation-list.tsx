import { useRouteStore } from "@/app/stores/useRouteStore";
import { DataTable } from "@/components/route-editor-components/data-table";

export default function RouteNavigationList() {
  const storedRouteJson = useRouteStore((s) =>
    s.routeJson
  );

  return (
    <div>
      <DataTable storedRouteJson={storedRouteJson} />
    </div>
  );
}
