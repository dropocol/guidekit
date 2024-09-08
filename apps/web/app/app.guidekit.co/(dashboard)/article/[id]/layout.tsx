import { ReactNode } from "react";

export default function ArticleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-grow overflow-auto">{children}</div>
    </div>
  );
}
