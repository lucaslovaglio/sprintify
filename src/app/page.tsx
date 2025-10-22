"use client";
import { PsaCard } from "@/lib/types";
import React, { useState } from "react";

type ApiError = { error: string; reason?: string };

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PsaCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
    setError(null);

    if (f && f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/classify", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        const err = data as ApiError;
        setError(err?.reason || "Unknown error");
      } else {
        setResult(data as PsaCard);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-6 gap-6">
      <h1 className="text-2xl font-semibold">NBA Card Classifier</h1>

      <form onSubmit={onSubmit} className="w-full max-w-xl flex flex-col gap-4">
        <label className="block">
          <span className="text-sm font-medium">Upload an image or PDF</span>
          <input
            className="mt-2 block w-full border rounded p-2"
            type="file"
            name="file"
            accept="image/*,application/pdf"
            onChange={onFileChange}
            required
          />
        </label>

        {previewUrl && (
          <div className="border rounded p-2">
            <p className="text-sm mb-2">Preview:</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="preview" className="max-h-64 object-contain" />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="border rounded px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {/* Result / Error */}
      <section className="w-full max-w-xl">
        {error && (
          <div className="border-red-300 bg-red-50 text-red-700 border rounded p-3">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="border rounded p-3">
            <h2 className="font-medium mb-2">Result</h2>
            <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </section>
    </main>
  );
}