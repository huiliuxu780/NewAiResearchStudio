"use client";

export type PushFlashMessage = {
  tone: "success" | "error";
  text: string;
};

export function PushFlashBanner({ message }: { message: PushFlashMessage }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        message.tone === "success"
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-destructive/20 bg-destructive/10 text-destructive"
      }`}
    >
      {message.text}
    </div>
  );
}
