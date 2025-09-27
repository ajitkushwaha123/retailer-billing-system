"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/lib/auth/context";
import { store } from "@/store";
import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import { Provider } from "react-redux";

const AppShell = ({ children }) => {
  return (
    <Provider store={store}>
      <ClerkProvider>
        <AuthProvider>
          <SidebarProvider
            style={{
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            }}
          >
            <AppSidebar variant="inset" />
            <SidebarInset>
              <SiteHeader />
              {children}
            </SidebarInset>
          </SidebarProvider>
        </AuthProvider>
      </ClerkProvider>
    </Provider>
  );
};

export default AppShell;
