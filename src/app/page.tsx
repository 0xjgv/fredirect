"use client";

import { Redirect } from "@/lib/types";
import { Feedback } from "@/components/Feedback";
import SearchInput from "@/components/SearchInput";
import TableResults from "@/components/TableResults";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface ErrorType {
  message: string;
}

interface ResponseType {
  redirects: { urls: Redirect[] };
  error?: ErrorType;
}

const initialState = {
  info: { error: false, message: "" },
  submitting: false,
  submitted: false
};

export default function Home() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [status, setStatus] = useState(initialState);
  const [url, setUrl] = useState("");

  const handleError = (error: ErrorType) => {
    const { message } = error;
    setStatus(prevStatus => ({
      ...prevStatus,
      info: { error: true, message }
    }));
    setUrl("");
    setTimeout(() => {
      setStatus(prevStatus => ({
        ...prevStatus,
        info: { error: false, message: "" }
      }));
    }, 3000);
  };

  const handleResponse = (res: ResponseType) => {
    const { redirects, error } = res;
    const { urls } = redirects;
    if (error) {
      handleError(error);
      setUrl("");
    } else {
      setStatus({
        info: { error: false, message: "" },
        submitting: false,
        submitted: true
      });
      setRedirects(urls);
      setUrl("");
    }
  };

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(prevStatus => ({ ...prevStatus, submitting: true }));
    try {
      const response = await fetch(
        `api/fredirect?url=${encodeURIComponent(url)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            origin: "self"
          }
        }
      );
      const data = await response.json();
      handleResponse(data);
    } catch (error) {
      if (typeof error === "object" && error !== null && "message" in error) {
        handleError(error as ErrorType);
      } else {
        handleError({ message: "An unexpected error occurred" });
      }
    }
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  return (
    <Card className="mx-auto max-w-6xl">
      <CardContent className="flex flex-col gap-3 relative pt-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          <b>Fredirect</b>
        </h1>
        <p>URL Redirection Tracker and Threat Analyzer</p>
        <SearchInput
          handleOnChange={handleOnChange}
          handleOnSubmit={handleOnSubmit}
          url={url}
          error={status.info.error}
          errorMessage={status.info.message}
          isSubmitting={status.submitting}
        />
        {redirects.length > 0 && <TableResults redirects={redirects} />}
        <Feedback />
      </CardContent>
    </Card>
  );
}
