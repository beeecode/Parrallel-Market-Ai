import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description = "The data could not be prepared. Try again in a moment.",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-danger/30 bg-danger/10 p-6 text-sm",
        className,
      )}
      role="alert"
    >
      <h3 className="font-semibold text-red-200">{title}</h3>
      <p className="mt-2 leading-6 text-red-100/75">{description}</p>
    </div>
  );
}
