"use client";

import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
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
import NotificationBell from "./notification-bell";
import { useStore } from "@/app/providers";
import { IconMenu2 } from "@tabler/icons-react";
import { useState } from "react";

export default function NavigationBar() {
  const { setTheme } = useTheme();
  const { user, isAuthenticated } = useKindeBrowserClient();
  const displayProfile = useStore((state) => state.displayProfile);
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <>
      <section className="fixed w-full z-50">
        <header className="border-b bg-background w-full">
          <div className="container mx-auto flex h-16 items-center px-4 w-full">
            <nav>
              <section className="hidden md:flex space-x-4 lg:space-x-6 mr-6 items-center">
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
                  href={"/community-routes"}
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Community Routes
                </Link>
                {isAuthenticated && (
                  <>
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
                      href={"/route-editor"}
                      className={buttonVariants({
                        size: "sm",
                        variant: "ghost",
                      })}
                    >
                      Route Editor
                    </Link>
                  </>
                )}
              </section>
              <section className="md:hidden flex items-center">
                <button
                  className="hover:cursor-pointer"
                  onClick={() => setMobileMenu(!mobileMenu)}
                  aria-label="open mobile menu"
                >
                  <IconMenu2 size={28} />
                </button>
              </section>
            </nav>
            <div className="ml-auto flex items-center space-x-4">
              {isAuthenticated && user &&
                <NotificationBell />}
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
              {isAuthenticated && user
                ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full hover:cursor-pointer"
                      >
                        <Avatar className="h-8 w-8">
                          {displayProfile && displayProfile.avatarUrl !== null
                            ? (
                              <AvatarImage
                                src={displayProfile.avatarUrl}
                                alt="User Avatar"
                              />
                            )
                            : (
                              <AvatarImage
                                src="/placeholder-avatar.png?height=32&width=32"
                                alt="User Avatar"
                              />
                            )}
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          {displayProfile
                            ? (
                              <p className="text-sm font-medium leading-none overflow-hidden overflow-ellipsis">
                                {displayProfile.username}
                              </p>
                            )
                            : (
                              <Skeleton className="w-[100px] h-[20px] rounded-full" />
                            )}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href="/account/profile">
                        <DropdownMenuItem className="hover:cursor-pointer">
                          <User className="mr-2 h-4 w-4" />Profile
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/account/settings">
                        <DropdownMenuItem className="hover:cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <Link prefetch={false} href="/api/auth/logout">
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
                      prefetch={false}
                      href={"/api/auth/register"}
                      className={buttonVariants({
                        size: "sm",
                        variant: "ghost",
                      })}
                    >
                      Login
                    </Link>

                    <Link
                      prefetch={false}
                      href={"/api/auth/register"}
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
      </section>
      <section
        className={`${mobileMenu ? "top-[65px]" : "-top-[100%]"
          } fixed ease-in-out z-20 lg:hidden duration-500 bg-background pt-4 h-full w-full left-0 flex justify-center`}
      >
        <div className="container flex items-baseline flex-col">
          <Link
            href={"/"}
            onClick={() => setMobileMenu(!mobileMenu)}
            className={buttonVariants({
              size: "lg",
              variant: "link",
            })}
          >
            Twisty Moto
          </Link>
          <Link
            href={"/community-routes"}
            onClick={() => setMobileMenu(!mobileMenu)}
            className={buttonVariants({
              size: "lg",
              variant: "link",
            })}
          >
            Community Routes
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href={"/my-routes"}
                onClick={() => setMobileMenu(!mobileMenu)}
                className={buttonVariants({
                  size: "lg",
                  variant: "link",
                })}
              >
                My Routes
              </Link>
              <Link
                href={"/route-editor"}
                onClick={() => setMobileMenu(!mobileMenu)}
                className={buttonVariants({
                  size: "lg",
                  variant: "link",
                })}
              >
                Route Editor
              </Link>
              <Link
                href={"/account/profile"}
                onClick={() => setMobileMenu(!mobileMenu)}
                className={buttonVariants({
                  size: "lg",
                  variant: "link",
                })}
              >
                Profile
              </Link>
              <Link
                href={"/account/settings"}
                onClick={() => setMobileMenu(!mobileMenu)}
                className={buttonVariants({
                  size: "lg",
                  variant: "link",
                })}
              >
                Settings
              </Link>
            </>
          )}
        </div>
      </section>
    </>
  );
}
