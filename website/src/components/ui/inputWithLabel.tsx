import type React from "react";
import { Input } from "./input";
import { Label } from "./label";

interface InputWithLabelProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  type: React.InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
}

export function InputWithLabel(props: InputWithLabelProps) {
  return (
    <div className="grid w-full max-w-sm space-y-1 items-center">
      <Label htmlFor={props.name}>{props.label}</Label>
      <Input {...props} />
    </div>
  );
}

export function SelectWithLabel(props: {
  label: string;
  name: string;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div className="space-y-1">
      <Label>{props.label}</Label>
      <select
        className="border h-9 rounded shadow-xs w-full px-2"
        name={props.name}
      >
        <option className="w-full">{`Select ${props.label}`}</option>
        {props.options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
