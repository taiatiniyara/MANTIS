import type React from "react";
import { useState } from "react";
import { Button } from "./ui/button";

interface FormSubmissionProps extends React.HTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  btnText?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function FormSubmission(props: FormSubmissionProps) {
  const [submitting, setSubmitting] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        setSubmitting(true);
        if (props.onSubmit) {
          props.onSubmit(e);
          setSubmitting(false);
        }
      }}
      {...props}
    >
      {props.children}
      <Button
        disabled={submitting}
        className="mt-4 min-w-25"
        type="submit"
      >
        {submitting ? "..." : props.btnText || "Submit"}
      </Button>
    </form>
  );
}
