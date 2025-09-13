"use client";

// Removed incorrect import: import { getTemplateById } from "@/lib/templates";
import ModernSplitTemplate from "./templates/modern-split";
import { ResumeData } from "@/types/resume";

export type TemplateComponentProps = {
  data: ResumeData;
};

type TemplateDefinition = {
  id: number;
  name: string;
  component: React.ComponentType<TemplateComponentProps>;
};

// Define all available templates
const templates: TemplateDefinition[] = [
  {
    id: 8,
    name: "Modern Split",
    component: ModernSplitTemplate
  },
  // Add more templates here
];

export const getTemplateById = (id: number): TemplateDefinition | undefined => {
  console.log("Looking for template with ID:", id);
  console.log("Available templates:", templates);
  const template = templates.find(template => template.id === id);
  console.log("Found template:", template);
  return template;
};

export const getTemplateComponent = (id: number): React.ComponentType<TemplateComponentProps> | null => {
  console.log("Getting template component for ID:", id);
  const template = getTemplateById(id);
  console.log("Template component result:", template ? "Found" : "Not found");
  return template ? template.component : null;
};

export default templates;