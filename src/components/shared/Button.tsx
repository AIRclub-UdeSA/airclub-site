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
  default:
    "border-border-strong/25 hover:border-border-strong bg-transparent text-text hover:-translate-y-0.5 hover:bg-black/5 dark:hover:bg-white/10 active:translate-y-0",
  primary:
    "border-crimson bg-crimson text-white hover:-translate-y-0.5 hover:bg-crimson-hover hover:border-crimson-hover active:translate-y-0",
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
