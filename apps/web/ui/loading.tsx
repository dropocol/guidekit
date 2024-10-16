import { LoadingDots } from "@/ui/icons/loading-dots";

export default function Loading() {
  return (
    <>
      <div className="h-10 animate-pulse rounded-md dark:bg-stone-800" />
      <div className="flex h-full w-full items-center justify-center">
        <LoadingDots />
      </div>
    </>
  );
}
