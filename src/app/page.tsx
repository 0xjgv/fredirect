import Input from "@/components/input";
import { Card, Metric } from "@tremor/react";

export default function Home() {
  return (
    <Card className="mx-auto max-w-xl flex flex-col gap-3">
      <Metric>
        <b>Fredirect</b>
      </Metric>
      <p>URL Redirection Tracker and Threat Analyzer</p>
      <Input />
    </Card>
  );
}
