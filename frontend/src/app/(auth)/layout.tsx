import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
    children: React.ReactNode;
    backHref?: string;
    backLabel?: string;
}

export default function AuthLayout({
    children,
    backHref = "/",
    backLabel = "Back to Home",
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
            <div className="absolute top-8 left-8">
                <Link
                    href={backHref}
                    className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink dark:hover:text-zinc-50 focus-visible:outline-hidden focus-visible:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {backLabel}
                </Link>
            </div>

            {children}
        </div>
    );
}