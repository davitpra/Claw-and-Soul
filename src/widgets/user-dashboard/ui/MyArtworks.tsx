"use client";

import Link from "next/link";
import { Card } from "@/shared/ui/Card";
import type { UserGeneration } from "@/entities/order/types";

interface Props {
  artworks: UserGeneration[];
  isLoading: boolean;
  error: string | null;
}

export function MyArtworks({ artworks, isLoading, error }: Props) {
  return (
    <section className="rounded-xl bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-black text-text-main">
          My Artworks
        </h2>
        <Link
          href="/user/generations"
          className="text-sm font-bold text-primary hover:text-primary-dark"
        >
          View all
        </Link>
      </div>

      <div className="mt-4">
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-4/5 animate-pulse rounded-xl bg-cream"
              />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {!isLoading && !error && artworks.length === 0 && (
          <div className="rounded-xl bg-cream px-4 py-8 text-center">
            <p className="text-text-muted">No artworks yet.</p>
            <Link
              href="/ia-generator"
              className="mt-3 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-primary-dark hover:shadow-md"
            >
              Create your first artwork
            </Link>
          </div>
        )}

        {!isLoading && !error && artworks.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {artworks.map((art) => (
              <div
                key={art.id}
                className="overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-md"
              >
                <Card
                  imageUrl={art.thumbnailUrl || art.resultUrl || ""}
                  imageAlt={
                    art.pet?.name ? `Artwork of ${art.pet.name}` : "Artwork"
                  }
                >
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3">
                    <p className="truncate font-display text-sm font-bold text-white">
                      {art.pet?.name || "Untitled"}
                    </p>
                    {art.style?.displayName && (
                      <p className="truncate text-xs text-white/80">
                        {art.style.displayName}
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
