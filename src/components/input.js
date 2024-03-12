"use client";

import {
  Badge,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput
} from "@tremor/react";
import { useState } from "react";

const initialState = {
  info: { error: false, message: "" },
  submitting: false,
  submitted: false
};

const Input = () => {
  const [status, setStatus] = useState(initialState);
  const [redirects, setRedirects] = useState([]);
  const [url, setUrl] = useState("");

  const handleError = error => {
    const { message } = error;
    setStatus({
      info: { error: true, message }
    });
    setUrl("");
    setTimeout(() => {
      setStatus({
        info: { error: false, message: "" }
      });
    }, 3000);
  };

  const handleResponse = res => {
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

  const handleOnSubmit = async e => {
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
      handleError(error);
    }
  };

  const handleOnChange = ({ target }) => {
    setUrl(target.value);
  };

  const handleClick = ev => {
    ev.preventDefault();
    const { href } = ev.target;
    document.addEventListener(
      "copy",
      e => {
        e.clipboardData.setData("text/plain", href);
        e.preventDefault();
      },
      true
    );
    document.execCommand("copy");
    console.log("copied text : ", href);
    alert("copied text: " + href);
  };

  return (
    <>
      <form onSubmit={handleOnSubmit} className="flex flex-col gap-3">
        <TextInput
          placeholder="Enter a URL to follow redirects"
          onChange={handleOnChange}
          error={status.info.error || status.info.message}
          errorMessage={status.info.message}
          id="url"
          required
          type="url"
          value={url}
        />
        <Button
          className="self-end"
          variant="primary"
          disabled={status.submitting}
          loading={status.submitting}
        >
          {status.submitting ? "Submitting..." : "Submit"}
        </Button>
      </form>

      {redirects.length > 0 && (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>#</TableHeaderCell>
              <TableHeaderCell>URL</TableHeaderCell>
              <TableHeaderCell className="text-right">
                IP Address
              </TableHeaderCell>
              <TableHeaderCell className="text-right">Status</TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {redirects.map(({ url, status, ip }, i) => {
              return (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    <a onClick={handleClick} href={url}>
                      {url}
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    {ip ? ip : "0.0.0.0"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge color={status === 200 ? "emerald" : "amber"}>
                      {status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </>
  );
};

export default Input;
