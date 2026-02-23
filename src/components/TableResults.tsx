"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Redirect } from "@/lib/types";

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
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>URL</TableHead>
          <TableHead className="text-right">IP Address</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>

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
                  className={
                    String(statusCode).startsWith("200")
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                      : "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100"
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
