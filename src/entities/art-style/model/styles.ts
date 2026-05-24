export interface SelectOptionItem {
  value: string;
  label: string;
}

export interface SelectTemplateVarOption {
  type: "select";
  label: string;
  options: SelectOptionItem[];
  default: string;
  required?: boolean;
}

export interface SliderTemplateVarOption {
  type: "slider";
  label: string;
  min: number;
  max: number;
  step?: number;
  default: number;
  required?: boolean;
}

export interface ColorTemplateVarOption {
  type: "color";
  label: string;
  default: string;
  required?: boolean;
}

export type TemplateVarOption =
  | SelectTemplateVarOption
  | SliderTemplateVarOption
  | ColorTemplateVarOption;

export interface Style {
  id?: string;
  name: string;
  img: string;
  thanksUrl?: string | null;
  templateVarOptions?: Record<string, TemplateVarOption> | null;
}
