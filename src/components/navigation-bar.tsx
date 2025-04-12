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
import { Skeleton } from "@/components/ui/skeleton";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NavigationBar() {
  const { setTheme } = useTheme();

  const { user, error } = useKindeBrowserClient();
  if (error) return <div>{error}</div>;

  return (
    <header className="border-b bg-background z-10 w-full">
      <div className="container mx-auto flex h-16 items-center px-4">
        <nav className="flex items-center space-x-4 lg:space-x-6 mr-6">
          <Link
            href={"/"}
            className={buttonVariants({
              size: "sm",
              variant: "ghost",
            })}
          >
            Twisty Moto
          </Link>
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
            href={"/my-routes"}
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
            href={"/route-editor"}
            className={buttonVariants({
              size: "sm",
              variant: "ghost",
            })}
          >
            Route Editor
          </Link>
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {user &&
            (
              <Button
                variant="ghost"
                className="hover:cursor-pointer"
                size="icon"
              >
                <Bell className="h-5 w-5" />
              </Button>
            )}
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
          {user
            ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full hover:cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="/placeholder.svg?height=32&width=32"
                        alt="User Avatar"
                      />
                      <AvatarFallback>
                        {user
                          ? (
                            <img
                              src={user.picture as string}
                              alt={user.given_name as string}
                            />
                          )
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      {user
                        ? (
                          <p className="text-sm font-medium leading-none">
                            {user.given_name}
                          </p>
                        )
                        : (
                          <Skeleton className="w-[100px] h-[20px] rounded-full" />
                        )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="account/profile">
                    <DropdownMenuItem className="hover:cursor-pointer">
                      <User className="mr-2 h-4 w-4" />Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/setting">
                    <DropdownMenuItem className="hover:cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Link href="/api/auth/logout">
                    <DropdownMenuItem className="hover:cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            )
            : (
              <>
                <Link
                  href={"/api/auth/login"}
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Login
                </Link>

                <Link
                  href={"/api/auth/sign-up"}
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Sign Up
                </Link>
              </>
            )}
        </div>
      </div>
    </header>
  );
}
