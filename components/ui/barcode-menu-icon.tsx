"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BarcodeMenuIconProps {
  isOpen: boolean;
  className?: string;
}

export function BarcodeMenuIcon({ isOpen, className }: BarcodeMenuIconProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {isOpen ? (
        // X icon when open
        <motion.div
          initial={{ rotate: 0, scale: 1 }}
          animate={{ rotate: 45, scale: 1 }}
          exit={{ rotate: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          whileTap={{
            scale: 0.9,
            rotate: 50,
            transition: { duration: 0.1 },
          }}
          className="relative w-5 h-5"
        >
          <motion.div
            className="absolute top-1/2 left-0 w-full h-0.5 bg-white rounded-full transform -translate-y-1/2"
            whileTap={{ scaleX: 0.8 }}
          />
          <motion.div
            className="absolute top-1/2 left-0 w-full h-0.5 bg-white rounded-full transform -translate-y-1/2 rotate-90"
            whileTap={{ scaleX: 0.8 }}
          />
        </motion.div>
      ) : (
        // Two horizontal dashes (equals sign style) when closed
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-1.5"
        >
          <motion.div
            className="w-6 h-0.5 bg-white"
            animate={{ scaleX: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            whileTap={{
              scaleX: 0.8,
              transition: { duration: 0.1 },
            }}
          />
          <motion.div
            className="w-6 h-0.5 bg-white"
            animate={{ scaleX: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            whileTap={{
              scaleX: 0.8,
              transition: { duration: 0.1 },
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
