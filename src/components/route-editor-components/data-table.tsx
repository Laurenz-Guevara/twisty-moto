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
import { IconDotsVertical, IconGripVertical } from "@tabler/icons-react";
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
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useCallback, useEffect, useId, useMemo, useState } from "react";

import { useRouteStore } from "@/app/stores/useRouteStore";
import { useMapStore } from "@/app/stores/useMapStore";

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
      <DrawerTrigger asChild>
        <div className="w-50 overflow-ellipsis overflow-hidden hover:cursor-pointer">
          {item.streetName}
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.streetName}</DrawerTitle>
          <DrawerDescription>
            Directly update the route here.
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
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button
              onClick={() =>
                useMapStore.getState().setJumpToLocation({
                  latitude: item.latitude,
                  longitude: item.longitude,
                })}
              className="hover:cursor-pointer"
              variant="outline"
            >
              Jump To Location
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
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
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const getColumns = (
  handleDeleteWaypoint: (order: number) => void,
): ColumnDef<z.infer<typeof schema>>[] => [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.order} />,
    },
    {
      accessorKey: "header",
      header: "Header",
      cell: ({ row }) => <TableCellViewer item={row.original} />,
      enableHiding: false,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original.order;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem>Move Up</DropdownMenuItem>
              <DropdownMenuItem>Move Down</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteWaypoint(order)}
                variant="destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
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
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable() {
  const storedRouteJson: z.infer<typeof schema>[] = useRouteStore((s) =>
    s.routeJson
  );
  const [data, setRoute] = useState(() => storedRouteJson);
  const updateRouteState = useRouteStore((s) => s.updateRouteData);

  useEffect(() => {
    setRoute(storedRouteJson);
  }, [storedRouteJson]);

  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const sortableId = useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const handleDeleteWaypoint = useCallback((order: number) => {
    const updatedRoute = data.filter((waypoint) => waypoint.order !== order);
    updateRouteState({
      routeJson: updatedRoute,
    });
  }, [data, updateRouteState]);

  const columns = useMemo(() => getColumns(handleDeleteWaypoint), [
    handleDeleteWaypoint,
  ]);

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data?.map(({ order }) => order) || [],
    [data],
  );

  const table = useReactTable({
    data,
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
    if (active && over && active.id !== over.id) {
      setRoute((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
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
