import { ReactNode } from "react";

type SectionShellProps = {
  children: ReactNode;
};

export function SectionShell({ children }: SectionShellProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f4ed] text-[#11100d]">
      {children}
    </main>
  );
}
