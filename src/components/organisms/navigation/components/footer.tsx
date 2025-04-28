import * as React from "react";
import { SidebarMenuItem } from "@/components/atoms/sidebar";

export function Footer() {
  return (
    <SidebarMenuItem className="text-xs grid text-muted-foreground">
      <span className="sr-only">
        Thank you for using Communalists. This project is open source and is
        developed by volunteers located in the San Francisco Bay Area since
        2022.
      </span>
      <p aria-hidden={true} className="font-bold">
        Developed by Volunteers
      </p>
      <p aria-hidden={true}>San Francisco Bay Area</p>
      <p>
        <a
          className="underline"
          href="https://github.com/jadeallencook/communalists"
          target="_blank"
        >
          <span aria-hidden={true}>Open Source</span>
          <span className="sr-only">Check out the source code on GitHub.</span>
        </a>
        <span aria-hidden={true}> | 2022-2025</span>
      </p>
    </SidebarMenuItem>
  );
}
