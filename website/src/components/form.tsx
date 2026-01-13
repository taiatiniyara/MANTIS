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
      <Button 
        disabled={submitting} 
        className="mt-4 sm:mt-6 w-full sm:w-auto sm:min-w-40 min-h-11 text-base font-medium" 
        type="submit"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            <span>Processing...</span>
          </span>
        ) : (
          btnText
        )}
      </Button>
    </form>
  );
}
