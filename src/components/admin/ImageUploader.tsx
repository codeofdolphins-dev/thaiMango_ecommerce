"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Plus,
  Star,
  X,
} from "lucide-react";
import { normalizeImagePath } from "@/lib/images";

interface UploadedImage {
  url: string;
  name: string;
  size: number;
}

interface ImageUploaderProps {
  /** Ordered image paths — the first one is the product cover. */
  value: string[];
  onChange: (next: string[]) => void;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [manualPath, setManualPath] = useState("");

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const body = await res.json();

      if (!res.ok) {
        /* The route returns per-file reasons in `errors` when a batch is rejected. */
        const detail = Array.isArray(body.errors) && body.errors.length > 0
          ? body.errors.join(" · ")
          : body.message;
        throw new Error(detail || "Upload failed");
      }

      const urls = (body.data as UploadedImage[]).map((img) => img.url);
      onChange([...value, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    void uploadFiles(files);
  }

  function addManualPath() {
    const path = normalizeImagePath(manualPath);
    if (!path) return;
    if (value.includes(path)) {
      setError("That image is already in the list");
      return;
    }
    setError("");
    onChange([...value, path]);
    setManualPath("");
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  /* Order matters — the first image is the cover on storefront cards. */
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...value];
    const [picked] = next.splice(index, 1);
    onChange([picked, ...next]);
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition ${
          dragging
            ? "border-accent bg-accent/5"
            : "border-cream hover:border-accent/50 bg-white"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            void uploadFiles(Array.from(e.target.files ?? []));
            /* Reset so re-picking the same file still fires onChange. */
            e.target.value = "";
          }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-muted">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <span className="text-sm font-medium">Uploading…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-cream/60 flex items-center justify-center">
              <ImagePlus className="w-5 h-5 text-accent" />
            </div>
            <p className="text-sm font-semibold text-charcoal">
              Drop images here, or click to browse
            </p>
            <p className="text-[11px] text-muted">
              JPG, PNG, WebP or AVIF · up to 5MB each · 10 at a time
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] text-red-600 font-medium">{error}</p>
      )}

      {/* Thumbnails — order is the storefront gallery order */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {value.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="group relative aspect-square rounded-xl overflow-hidden border border-cream bg-cream/30"
            >
              <Image
                src={normalizeImagePath(src)}
                alt={`Product image ${index + 1}`}
                fill
                sizes="160px"
                className="object-cover"
                unoptimized
              />

              {index === 0 && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-charcoal text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  Cover
                </span>
              )}

              <button
                type="button"
                onClick={() => removeAt(index)}
                title="Remove image"
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 text-charcoal flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="absolute inset-x-0 bottom-0 p-1.5 flex items-center justify-center gap-1 bg-gradient-to-t from-charcoal/80 to-transparent opacity-0 group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  title="Move left"
                  className="w-6 h-6 rounded-md bg-white/90 text-charcoal flex items-center justify-center disabled:opacity-30 hover:bg-white"
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(index)}
                    title="Make cover"
                    className="w-6 h-6 rounded-md bg-white/90 text-charcoal flex items-center justify-center hover:bg-white"
                  >
                    <Star className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  title="Move right"
                  className="w-6 h-6 rounded-md bg-white/90 text-charcoal flex items-center justify-center disabled:opacity-30 hover:bg-white"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Escape hatch for images already sitting in /public/images */}
      <div className="flex items-center gap-2">
        <input
          className="flex-1 px-4 py-2.5 rounded-xl border border-cream bg-white text-sm focus:outline-none focus:border-accent transition placeholder:text-muted/60"
          placeholder="Or paste an existing path — /images/bangkok-mango-beetroot-1.png"
          value={manualPath}
          onChange={(e) => setManualPath(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addManualPath();
            }
          }}
        />
        <button
          type="button"
          onClick={addManualPath}
          disabled={!manualPath.trim()}
          className="px-3 py-2.5 rounded-xl border border-cream bg-white text-charcoal hover:border-accent disabled:opacity-40 transition"
          title="Add path"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] text-muted">
        {value.length === 0
          ? "No images yet — the storefront shows a placeholder."
          : `${value.length} image${value.length === 1 ? "" : "s"} · first is the cover. Removing one here doesn't delete the file from disk.`}
      </p>
    </div>
  );
}
