import type { SeedRobotSpec } from "../../../prisma/seed-data/robots";

export function RobotSpecTable({ title, specs }: { title: string; specs: SeedRobotSpec[] }) {
  if (specs.length === 0) return null;

  return (
    <div className="mb-4 rounded-md border-[1.5px] border-border bg-white p-6.5 dark:bg-[#1a0810]">
      <h4 className="mb-3.5 font-display text-[.95rem] font-bold text-text">{title}</h4>
      <table className="w-full border-collapse">
        <tbody>
          {specs.map((spec) => (
            <tr key={spec.label} className="border-b border-border last:border-none">
              <td className="w-[130px] py-2.5 pr-4 align-top font-mono text-[.68rem] uppercase tracking-[.08em] text-text3">
                {spec.label}
              </td>
              <td className="py-2.5 text-[.84rem] font-medium text-text">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
