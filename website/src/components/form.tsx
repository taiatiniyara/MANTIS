import type React from "react";
import { useState } from "react";
import { Button } from "./ui/button";

interface FormSubmissionProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  btnText?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function FormSubmission({
  children,
  btnText = "Submit",
  onSubmit,
  ...formProps
}: FormSubmissionProps) {
  const [submitting, setSubmitting] = useState(false);
  return (
    <form
      {...formProps}
      onSubmit={async (e) => {
        setSubmitting(true);
        try {
          await onSubmit?.(e);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {children}
      <Button disabled={submitting} className="mt-4 min-w-25" type="submit">
        {submitting ? "..." : btnText}
      </Button>
    </form>
  );
}
