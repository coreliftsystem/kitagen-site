import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

interface NavCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export default function NavCard({
  href,
  icon: Icon,
  title,
  description,
}: NavCardProps) {
  return (
    <Link
      href={href}
      className="card-lift flex items-center gap-5 p-6 md:p-8 bg-background rounded-xl border border-border hover:border-accent/60 group transition-colors"
    >
      {/* アイコン背景 */}
      <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl bg-card-bg border border-border/60 flex items-center justify-center transition-all duration-300 group-hover:bg-accent/10 group-hover:border-accent/30">
        <Icon
          size={24}
          strokeWidth={1.5}
          className="text-accent transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* テキスト */}
      <div className="flex-1 min-w-0">
        <h2 className="font-bold text-base md:text-lg mb-1 group-hover:text-accent transition-colors duration-200">
          {title}
        </h2>
        <p className="text-xs text-muted leading-relaxed">{description}</p>
      </div>

      {/* 矢印 */}
      <ChevronRight
        size={16}
        className="shrink-0 text-border group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-200"
      />
    </Link>
  );
}
