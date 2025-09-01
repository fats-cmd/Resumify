"use client";

import { Dock, DockItem } from "@/components/ui/dock";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  FolderOpen, 
  Settings, 
  User, 
  Home,
  Mail,
  Calendar,
  Bookmark,
  Trash2,
  Download,
  Search,
  Bell,
  HelpCircle,
  LogOut
} from "lucide-react";
import Link from "next/link";

export default function DockDemoPage() {
  const handleItemClick = (itemName: string) => {
    console.log(`${itemName} clicked`);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Dock Component Demo</h1>
          <p className="text-lg text-muted-foreground">
            A macOS-style dock with magnification effect, built with Framer Motion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Basic Dock</h2>
            <p className="text-muted-foreground mb-6">
              A simple dock with navigation icons
            </p>
            <div className="flex justify-center">
              <Dock>
                <DockItem onClick={() => handleItemClick("Home")}>
                  <Home className="h-6 w-6 text-foreground" />
                </DockItem>
                <DockItem onClick={() => handleItemClick("Files")}>
                  <FileText className="h-6 w-6 text-foreground" />
                </DockItem>
                <DockItem onClick={() => handleItemClick("Folder")}>
                  <FolderOpen className="h-6 w-6 text-foreground" />
                </DockItem>
                <DockItem onClick={() => handleItemClick("User")}>
                  <User className="h-6 w-6 text-foreground" />
                </DockItem>
                <DockItem onClick={() => handleItemClick("Settings")}>
                  <Settings className="h-6 w-6 text-foreground" />
                </DockItem>
              </Dock>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Utility Dock</h2>
            <p className="text-muted-foreground mb-6">
              Dock with utility and action icons
            </p>
            <div className="flex justify-center">
              <Dock>
                <DockItem onClick={() => handleItemClick("Search")}>
                  <Search className="h-6 w-6 text-foreground" />
                </DockItem>
                <DockItem onClick={() => handleItemClick("Mail")}>
                  <Mail className="h-6 w-6 text-foreground" />
                </DockItem>
                <DockItem onClick={() => handleItemClick("Calendar")}>
                  <Calendar className="h-6 w-6 text-foreground" />
                </DockItem>
                <DockItem onClick={() => handleItemClick("Notifications")}>
                  <Bell className="h-6 w-6 text-foreground" />
                </DockItem>
                <DockItem onClick={() => handleItemClick("Help")}>
                  <HelpCircle className="h-6 w-6 text-foreground" />
                </DockItem>
              </Dock>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Full Dock Example</h2>
          <p className="text-muted-foreground mb-6">
            A complete dock with various file and action icons
          </p>
          <div className="flex justify-center">
            <Dock>
              <DockItem onClick={() => handleItemClick("Home")}>
                <Home className="h-6 w-6 text-foreground" />
              </DockItem>
              <DockItem onClick={() => handleItemClick("Documents")}>
                <FileText className="h-6 w-6 text-foreground" />
              </DockItem>
              <DockItem onClick={() => handleItemClick("Downloads")}>
                <Download className="h-6 w-6 text-foreground" />
              </DockItem>
              <DockItem onClick={() => handleItemClick("Pictures")}>
                <Bookmark className="h-6 w-6 text-foreground" />
              </DockItem>
              <DockItem onClick={() => handleItemClick("Trash")}>
                <Trash2 className="h-6 w-6 text-foreground" />
              </DockItem>
              <div className="h-8 w-px bg-border mx-2" />
              <DockItem onClick={() => handleItemClick("Settings")}>
                <Settings className="h-6 w-6 text-foreground" />
              </DockItem>
              <DockItem onClick={() => handleItemClick("Logout")}>
                <LogOut className="h-6 w-6 text-foreground" />
              </DockItem>
            </Dock>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Usage Example</h2>
          <p className="text-muted-foreground mb-4">
            Here&apos;s how to use the Dock component in your application:
          </p>
          <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto mb-6">
            {`import { Dock, DockItem } from "@/components/ui/dock";
import { Home, FileText, Settings } from "lucide-react";

export default function MyComponent() {
  return (
    <Dock>
      <DockItem onClick={() => console.log("Home clicked")}>
        <Home className="h-6 w-6" />
      </DockItem>
      <DockItem onClick={() => console.log("Files clicked")}>
        <FileText className="h-6 w-6" />
      </DockItem>
      <DockItem onClick={() => console.log("Settings clicked")}>
        <Settings className="h-6 w-6" />
      </DockItem>
    </Dock>
  );
}`}
          </pre>
          
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}