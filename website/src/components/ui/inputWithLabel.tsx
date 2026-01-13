import { Input } from "./input";
import { Label } from "./label";

export function InputWithLabel(props: {
  label: string;
  type?: "text" | "email" | "password" | "number";
  name: string;
  placeholder?: string;
}) {
  return (
    <div className="grid w-full max-w-sm items-center">
      <Label htmlFor={props.name}>{props.label}</Label>
      <Input
        name={props.name}
        type={props.type}
        id={props.name}
        required
        placeholder={props.placeholder ?? `Enter ${props.label}`}
      />
    </div>
  );
}