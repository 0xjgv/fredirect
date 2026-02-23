"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
  handleOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOnSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting?: boolean;
  errorMessage?: string;
  error?: boolean;
  url: string;
};

const SearchInput = ({
  handleOnChange,
  handleOnSubmit,
  isSubmitting,
  errorMessage,
  error,
  url
}: SearchInputProps) => {
  return (
    <form onSubmit={handleOnSubmit} className="flex flex-wrap gap-3">
      <div className="flex-1 min-w-64">
        <Input
          placeholder="Enter a URL to follow redirects"
          onChange={handleOnChange}
          id="url"
          required
          type="url"
          value={url}
          className={error ? "border-destructive" : ""}
        />
        {error && errorMessage && (
          <p className="text-sm text-destructive mt-1">{errorMessage}</p>
        )}
      </div>
      <Button
        className="self-start"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
};

export default SearchInput;
