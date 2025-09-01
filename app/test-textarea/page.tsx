"use client";

import { Textarea } from "@/components/ui/textarea";

export default function TestTextareaPage() {
  return (
    <div className="p-8">
      <h1>Textarea Test</h1>
      <Textarea placeholder="Type something here..." />
    </div>
  );
}