"use client";

// import { useUser } from "@auth0/nextjs-auth0/client";
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
import { Separator } from "@/components/ui/separator";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
// import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function NavigationBar() {
  const { setTheme } = useTheme();
  // const { user } = useUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // useEffect(() => {
  //   if (user) setIsLoggedIn(true);
  //   else setIsLoggedIn(false);
  // }, [user]);

  return (
    <header className="border-b bg-background z-10 w-full">
      <div className="flex h-16 items-center px-4">
        {/* <SidebarTrigger className="mr-4" /> */}
        {/* <Separator orientation="vertical" /> */}
        <nav className="flex items-center space-x-4 lg:space-x-6 mr-6">
          <Link
            href={"/discover"}
            className={buttonVariants({
              size: "sm",
              variant: "ghost",
            })}
          >
            Home
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
          {isLoggedIn &&
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
          {isLoggedIn
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
                      {/*   <AvatarFallback> */}
                      {/*     {user && user.name && user.name[0] !== undefined */}
                      {/*       ? user.name[0] */}
                      {/*       : "?"} */}
                      {/*   </AvatarFallback> */}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      {/* {user && user.name && user.name !== undefined */}
                      {/*   ? ( */}
                      {/*     <p className="text-sm font-medium leading-none"> */}
                      {/*       {user?.name} */}
                      {/*     </p> */}
                      {/*   ) */}
                      {/*   : ( */}
                      {/*     <Skeleton className="w-[100px] h-[20px] rounded-full" /> */}
                      {/*   )} */}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
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
