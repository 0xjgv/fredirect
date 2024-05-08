"use client";

import { Button, TextInput } from "@tremor/react";

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
      <TextInput
        className="flex-1 min-w-64"
        placeholder="Enter a URL to follow redirects"
        onChange={handleOnChange}
        error={error}
        errorMessage={errorMessage}
        id="url"
        required
        type="url"
        value={url}
      />
      <Button
        className="self-end"
        variant="primary"
        disabled={isSubmitting}
        loading={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
};

export default SearchInput;
