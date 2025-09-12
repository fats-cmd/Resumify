"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
}

interface AccordionItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  value: string;
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
  value: string;
}

const AccordionContext = React.createContext<{
  activeItems: string[];
  setActiveItems: (value: string | string[]) => void;
  type: "single" | "multiple";
  collapsible: boolean;
}>({
  activeItems: [],
  setActiveItems: () => {},
  type: "single",
  collapsible: false,
});

const Accordion = React.forwardRef<
  HTMLDivElement,
  AccordionProps
>(({ 
  children, 
  className, 
  type = "single", 
  collapsible = false,
  defaultValue,
  ...props 
}, ref) => {
  const [activeItems, setActiveItems] = React.useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const handleSetActiveItems = React.useCallback((value: string | string[]) => {
    if (type === "single") {
      const stringValue = Array.isArray(value) ? value[0] : value;
      if (stringValue) {
        setActiveItems([stringValue]);
      } else {
        setActiveItems([]);
      }
    } else {
      setActiveItems(Array.isArray(value) ? value : [value]);
    }
  }, [type]);

  return (
    <AccordionContext.Provider value={{ 
      activeItems, 
      setActiveItems: handleSetActiveItems,
      type,
      collapsible
    }}>
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
});
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  AccordionItemProps
>(({ children, value, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("border-b border-border", className)}
      {...props}
    >
      {children}
    </div>
  );
});
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ children, className, value, ...props }, ref) => {
  const { activeItems, setActiveItems, type, collapsible } = React.useContext(AccordionContext);
  const isOpen = activeItems.includes(value);

  const handleToggle = () => {
    if (type === "single") {
      if (isOpen) {
        if (collapsible) {
          setActiveItems([]);
        }
      } else {
        setActiveItems(value);
      }
    } else {
      if (isOpen) {
        if (collapsible) {
          setActiveItems(activeItems.filter(item => item !== value));
        }
      } else {
        setActiveItems([...activeItems, value]);
      }
    }
  };

  return (
    <button
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between py-4 text-left font-medium transition-all hover:underline",
        className
      )}
      onClick={handleToggle}
      aria-expanded={isOpen}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen ? "rotate-180" : ""
        )}
      />
    </button>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ children, className, value, ...props }, ref) => {
  const { activeItems } = React.useContext(AccordionContext);
  const isOpen = activeItems.includes(value);
  const [height, setHeight] = React.useState(0);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        className
      )}
      style={{ height: `${height}px` }}
      {...props}
    >
      <div ref={contentRef} className="pb-4 pt-0">
        {children}
      </div>
    </div>
  );
});
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };