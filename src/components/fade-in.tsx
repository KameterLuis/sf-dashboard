import { useInView } from "@/hooks/useInView";
import clsx from "clsx";

type FadeInProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function FadeIn({ children, className }: FadeInProps) {
  const [ref, visible] = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={clsx(
        "opacity-0 motion-safe:transition-all motion-safe:duration-700",
        visible && "opacity-100 translate-y-0",
        className
      )}
    >
      {children}
    </div>
  );
}
