import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="text-4xl font-extrabold tracking-tight">404</h2>
      <p className="text-muted-foreground mt-2 text-xl">Page Not Found</p>
      <p className="text-zinc-500 mt-1 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        Go back home
      </Link>
    </div>
  );
}
