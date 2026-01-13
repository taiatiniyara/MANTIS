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
    <div className="grid w-full space-y-2 items-center">
      <Label htmlFor={props.name} className="text-sm sm:text-base">{props.label}</Label>
      <Input {...props} className="h-11 text-base" />
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
    <div className="space-y-2 w-full">
      <Label className="text-sm sm:text-base">{props.label}</Label>
      <select
        className="border h-11 rounded shadow-xs w-full px-3 text-base bg-white"
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
