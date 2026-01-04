import { SidebarMenu, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

import Link from "next/link";
import Image from "next/image";
import { IconLayoutSidebarLeftCollapse } from "@tabler/icons-react";
// TODO: Check if member from database

export function SidebarHeaderContent() {
  return (
    <SidebarMenu className="flex flex-row justify-between">
      <SidebarMenuItem className="flex space-x-2 p-2 items-center">
        <div className="size-12">
          <Link className="" href="/">
            <Image
              src={"/twisty-moto.png"}
              alt={"Twisty Moto Logo"}
              width={64}
              height={64}
              className="h-full w-full object-cover size-8 rounded-full overflow-hidden"
            />
          </Link>
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <Link href="/">
            <span className="truncate font-medium">Twisty Moto</span>
          </Link>
          <Link className="w-min" href="/membership">
            <span className="truncate text-xs text-blue-600 dark:text-blue-300">
              Free Tier
            </span>
          </Link>
        </div>
      </SidebarMenuItem>
      <CloseSidebar />
    </SidebarMenu>
  );
}

function CloseSidebar() {
  const { toggleSidebar } = useSidebar()

  return (
    <button className="sm:hidden mr-2" onClick={toggleSidebar}>
      <IconLayoutSidebarLeftCollapse size="24" />
    </button>
  )
}
