import Link from "next/link";
import { cn } from "@/lib/utils";

type CommonProps = {
  variant?: "primary" | "default";
  className?: string;
  children: React.ReactNode;
};

type ButtonProps =
  | (CommonProps & { href: string; external?: boolean; onClick?: never; type?: never })
  | (CommonProps & { href?: never; external?: never; onClick?: React.MouseEventHandler<HTMLButtonElement>; type?: "button" | "submit" });

const base =
  "inline-flex items-center gap-2 rounded-full border-[1.5px] px-6.5 py-3.5 font-body text-[.88rem] font-medium transition-all duration-350 ease-club";

const variants = {
  default: "border-border-h bg-transparent text-text hover:-translate-y-0.5 hover:bg-card-h",
  primary:
    "border-trail relative overflow-hidden border-crimson bg-crimson text-white hover:-translate-y-0.5 hover:border-magenta hover:bg-magenta hover:shadow-[0_8px_30px_rgba(164,12,76,0.3)]",
};

export function Button(props: ButtonProps) {
  const { variant = "default", className, children } = props;
  const classes = cn(base, variants[variant], className);

  if (typeof props.href === "string") {
    const { href, external } = props;
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={props.type ?? "button"} onClick={props.onClick} className={classes}>
      {children}
    </button>
  );
}
