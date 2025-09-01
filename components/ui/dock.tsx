"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DockItemProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  title?: string;
}

const DockItem = React.forwardRef<
  HTMLDivElement,
  DockItemProps
>(({ children, href, onClick, className, title }, ref) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col items-center relative">
      {title && (
        <motion.div
          className="absolute bottom-full mb-5 px-2 py-1  bg-background/80 backdrop-blur-lg border border-border rounded-md text-xs text-foreground whitespace-nowrap z-50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isHovered ? 1 : 0, 
            y: isHovered ? 0 : 10 
          }}
          transition={{ duration: 0.2 }}
        >
          {title}
        </motion.div>
      )}
      <motion.div
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-2xl bg-background/80 backdrop-blur-lg border border-border shadow-lg cursor-pointer",
          "hover:bg-accent transition-colors",
          className
        )}
        whileHover={{ y: -10, scale: 1.2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {href ? (
          <a href={href} className="flex items-center justify-center w-full h-full p-3">
            {children}
          </a>
        ) : (
          <div className="flex items-center justify-center w-full h-full p-3">
            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
});

DockItem.displayName = "DockItem";

interface DockProps {
  children: React.ReactNode;
  className?: string;
}

const Dock = React.forwardRef<
  HTMLDivElement,
  DockProps
>(({ className, children, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "flex items-end justify-center gap-5 rounded-3xl bg-background/80 backdrop-blur-lg border border-border p-3 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Dock.displayName = "Dock";

export { Dock, DockItem };