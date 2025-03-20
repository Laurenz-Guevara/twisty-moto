"use client";

import { Bell, LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NavigationBar() {
  const { setTheme } = useTheme();

  return (
    <header className="border-b bg-background z-10">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2 mr-4">
          <Link href="/">
            <span className="text-xl font-bold hidden md:block">
              Twisty Moto
            </span>
          </Link>
        </div>

        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href={"/discover"}
            className={buttonVariants({
              size: "sm",
              variant: "ghost",
            })}
          >
            Discover
          </Link>
          <Link
            href={"/profile/my-routes"}
            className={buttonVariants({
              size: "sm",
              variant: "ghost",
            })}
          >
            My Routes
          </Link>
          <Link
            href={"/community"}
            className={buttonVariants({
              size: "sm",
              variant: "ghost",
            })}
          >
            Community
          </Link>
          <Link
            href={"/profile/trip-planner"}
            className={buttonVariants({
              size: "sm",
              variant: "ghost",
            })}
          >
            Trip Planner
          </Link>
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" className="hover:cursor-pointer" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="hover:cursor-pointer"
                variant="ghost"
                size="icon"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt="User Avatar"
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    john.doe@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Button variant="ghost" asChild>
                  <span>
                    <LogOut className="mr-2 h-4 w-4" />
                    <Link href="/api/auth/logout">Logout</Link>
                  </span>
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
