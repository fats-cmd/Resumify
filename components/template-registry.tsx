"use client";

import ModernSplitTemplate from "./templates/modern-split";
import ClassicProfessionalTemplate from "./templates/classic-professional";
import MinimalistProTemplate from "./templates/minimalist-pro";
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
    id: 1,
    name: "Classic Professional",
    component: ClassicProfessionalTemplate
  },
  {
    id: 8,
    name: "Modern Split",
    component: ModernSplitTemplate
  },
  {
    id: 10,
    name: "Minimalist Pro",
    component: MinimalistProTemplate
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
  console.log("Template component:", template?.component);
  return template ? template.component : null;
};

export default templates;