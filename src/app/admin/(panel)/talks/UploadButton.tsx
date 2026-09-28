"use client";

import { useRef, useState } from "react";
import { uploadTalkFile } from "./actions";

export function UploadButton({
  accept,
  label = "Subir archivo",
  onUploaded,
}: {
  accept: string;
  label?: string;
  onUploaded: (url: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadTalkFile(formData);
    setPending(false);
    if (inputRef.current) inputRef.current.value = "";

    if ("error" in result) setError(result.error);
    else onUploaded(result.url);
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="w-fit cursor-pointer text-xs font-medium text-text2 hover:text-crimson-text">
        {pending ? "Subiendo…" : label}
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} disabled={pending} className="hidden" />
      </label>
      {error && <p className="max-w-[16rem] text-xs text-crimson">{error}</p>}
    </div>
  );
}
