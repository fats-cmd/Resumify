"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestRichTextPage() {
  const [content, setContent] = useState<string>("");

  const handleSave = () => {
    console.log("Content saved:", content);
    alert("Content saved! Check console for details.");
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Rich Text Editor Test</CardTitle>
          <CardDescription>
            Test the Tiptap rich text editor with shadcn UI components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Editor Demo</h2>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Start typing here..."
            />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Output</h2>
            <div className="border rounded-lg p-4 min-h-[100px] bg-muted">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Content</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}