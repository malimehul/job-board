// components/Loader.tsx
interface LoaderProps {
    fullScreen?: boolean;
}

export default function Loader({ fullScreen = true }: LoaderProps) {
    const containerClass = fullScreen
        ? "flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950"
        : "flex items-center justify-center p-4";

    return (
        <div className={containerClass}>
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    );
}