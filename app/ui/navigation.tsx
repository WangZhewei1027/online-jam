"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Image from "next/image";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const drawerOptionStyle =
    "font-bold text-center py-2 text-xl md:text-left hover:text-gray-400";

  return (
    <nav className="bg-gray/10 backdrop-blur-sm fixed w-full border-b z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 relative">
          <div className="hidden md:flex">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 md:content-center ">
              <a href="/" className="text-xl font-bold no-underline font-serif">
                {"Let's Jam"}
              </a>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <a
                href="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Home
              </a>
              {/* <a
                href="/music"
                className="text-gray-900 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Music
              </a>
              <a
                href="/coding"
                className="text-gray-900 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Coding
              </a>
              <a
                href="/life"
                className="text-gray-900 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Life
              </a>
              <a
                href="/blog"
                className="text-gray-900 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Blog
              </a> */}
            </div>
            <div className="flex h-full items-center absolute right-0">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDrawer}
                    className="right-4"
                  >
                    <MenuIcon />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                      <DrawerTitle>
                        <div className="text-2xl">Content</div>
                      </DrawerTitle>
                      <DrawerDescription>
                        Navigate to different sections.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-16 md:px-4">
                      <div className="border-b"></div>
                    </div>

                    <div className="flex flex-col p-4">
                      <a href="/" className={drawerOptionStyle}>
                        Home
                      </a>
                      {/* <a href="/music" className={drawerOptionStyle}>
                        Music
                      </a>
                      <a href="/coding" className={drawerOptionStyle}>
                        Coding
                      </a>
                      <a href="/life" className={drawerOptionStyle}>
                        Life
                      </a>
                      <a href="/blog" className={drawerOptionStyle}>
                        Blogs
                      </a> */}
                    </div>
                    <DrawerFooter>
                      <div className="pt-4 w-full"></div>
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
