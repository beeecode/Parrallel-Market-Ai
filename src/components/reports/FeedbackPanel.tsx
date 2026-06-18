import { Card } from "@/components/ui/Card";

type FeedbackPanelProps = {
  title: string;
  items: string[];
};

export function FeedbackPanel({ title, items }: FeedbackPanelProps) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
        {items.map((item) => (
          <li className="flex gap-3" key={item}>
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}
