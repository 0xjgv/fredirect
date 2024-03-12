import Input from "@/components/input";
import { Card, Metric } from "@tremor/react";

export default function Home() {
  return (
    <Card className="mx-auto max-w-xl flex flex-col gap-3">
      <Metric>Fredirect</Metric>
      <h3>Follow URLs redirects</h3>
      <Input />
    </Card>
  );
}
