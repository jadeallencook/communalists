"use client";

import * as React from "react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/atoms/sidebar";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const isDarkTheme = theme === "dark";
  const toggleTheme = () => setTheme(isDarkTheme ? "light" : "dark");

  return (
    <SidebarMenuItem>
      <SidebarMenuButton className="underline" onClick={toggleTheme}>
        Toggle Theme Mode
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
