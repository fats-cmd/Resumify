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
  return templates.find(template => template.id === id);
};

export const getTemplateComponent = (id: number): React.ComponentType<TemplateComponentProps> | null => {
  const template = getTemplateById(id);
  return template ? template.component : null;
};

export default templates;