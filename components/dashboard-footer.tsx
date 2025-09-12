"use client";

import React from "react";

export function DashboardFooter() {
  return (
    <footer className="py-3 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Resumify. All rights reserved.
        </p>
      </div>
    </footer>
  );
}