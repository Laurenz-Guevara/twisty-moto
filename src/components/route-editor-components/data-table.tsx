"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconDotsVertical, IconEdit, IconGripVertical } from "@tabler/icons-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useId, useMemo, useState } from "react";

import { useRouteStore } from "@/app/stores/useRouteStore";
import { useMapStore } from "@/app/stores/useMapStore";
import z from "zod";
import { MarkerProps } from "@/types/types";
import DeleteWaypoint from "@/components/route-editor-components/DeleteWaypoint";
import MoveRoute from "@/components/route-editor-components/MoveRoute";

export const schema = z.object({
  order: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  streetName: z.string(),
  type: z.string(),
});

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <div className="flex justify-between">
        <div className="overflow-ellipsis overflow-hidden hover:cursor-pointer h-full">
          <span onClick={() =>
            useMapStore.getState().setJumpToLocation({
              latitude: item.latitude,
              longitude: item.longitude,
            })}>
            {item.streetName}
          </span>
        </div>
        <DrawerTrigger className="cursor-pointer" asChild>
          <IconEdit className="size-5 text-muted-foreground" />
        </DrawerTrigger>
      </div>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.streetName}</DrawerTitle>
          <DrawerDescription>
            Waypoint number {item.order + 1}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 px-4 text-sm">
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="header">Location</Label>
              <Input
                className="overflow-ellipsis"
                id="header"
                defaultValue={item.streetName}
              />
            </div>
          </form>
          <div className="space-y-2">
            <Label htmlFor="status">Latitude</Label>
            <p>{item.latitude}</p>
            <Label htmlFor="status">Longitude</Label>
            <p>{item.longitude}</p>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button
              onClick={() =>
                useMapStore.getState().setJumpToLocation({
                  latitude: item.latitude,
                  longitude: item.longitude,
                })}
              className="hover:cursor-pointer"
            >
              Jump To Location
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button className="cursor-pointer" variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-6 hover:bg-transparent hover:cursor-pointer"
    >
      <IconGripVertical className="text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.order} />,
  },
  {
    accessorKey: "header",
    header: "Header",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8 cursor-pointer"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <MoveRoute direction={"Up"} orderIndex={row.original.order}></MoveRoute>
          <MoveRoute direction={"Down"} orderIndex={row.original.order}></MoveRoute>
          <DropdownMenuSeparator />
          <DeleteWaypoint order={row.original.order}></DeleteWaypoint>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];


function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, setNodeRef, isDragging } = useSortable({
    id: row.original.order,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: "none",
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell className="nth-[2]:w-full nth-[2]:pr-1 last:pl-0 last:py-0" key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

interface DataTableProps {
  storedRouteJson: MarkerProps[];
}

export function DataTable({ storedRouteJson }: DataTableProps) {
  const updateRouteState = useRouteStore((s) => s.updateRouteData);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const sortableId = useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => storedRouteJson?.map(({ order }) => order) || [],
    [storedRouteJson],
  );

  const table = useReactTable({
    data: storedRouteJson,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    getRowId: (row) => row.order.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = dataIds.indexOf(active.id);
    const newIndex = dataIds.indexOf(over.id);

    const reordered = arrayMove(storedRouteJson, oldIndex, newIndex)
      .map((item, index) => ({
        ...item,
        order: index,
      }));

    updateRouteState({ routeJson: reordered });
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length >= 2
                  ? (
                    <SortableContext
                      items={dataIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {table.getRowModel().rows.map((row) => (
                        <DraggableRow key={row.id} row={row} />
                      ))}
                    </SortableContext>
                  )
                  : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        Click on the map to start building a route.
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
        </div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
        </div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
        </div>
      </TabsContent>
    </Tabs>
  );
}
