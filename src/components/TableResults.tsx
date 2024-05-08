"use client";

import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow
} from "@tremor/react";
import { Redirect } from "./Common";

const TableResults = ({ redirects }: { redirects: Redirect[] }) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const { href } = event.target as HTMLAnchorElement;
    document.addEventListener(
      "copy",
      e => {
        if (e.clipboardData) {
          e.clipboardData.setData("text/plain", href);
        }
        e.preventDefault();
      },
      true
    );
    document.execCommand("copy");
    console.log("copied text : ", href);
    alert("copied text: " + href);
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>#</TableHeaderCell>
          <TableHeaderCell>URL</TableHeaderCell>
          <TableHeaderCell className="text-right">IP Address</TableHeaderCell>
          <TableHeaderCell className="text-right">Status</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {redirects.map(({ url, status: statusCode, ip }, i) => {
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
                <Badge
                  color={
                    String(statusCode).startsWith("200") ? "emerald" : "amber"
                  }
                >
                  {statusCode}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default TableResults;
