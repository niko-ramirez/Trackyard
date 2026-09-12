import Link from "next/link";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { TrackCard } from "./track-card";

const PAGE_SIZE = 12;
const SORT_OPTIONS = ["newest", "oldest"] as const;
type Sort = (typeof SORT_OPTIONS)[number];

function parseSort(value: string | undefined): Sort {
  return SORT_OPTIONS.includes(value as Sort) ? (value as Sort) : "newest";
}

function parseIntParam(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const genre = params.genre?.trim() || undefined;
  const minBpm = parseIntParam(params.minBpm);
  const maxBpm = parseIntParam(params.maxBpm);
  const sort = parseSort(params.sort);
  const page = Math.max(1, parseIntParam(params.page) ?? 1);

  const where: Prisma.TrackWhereInput = {
    status: "ACTIVE",
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(genre ? { genre: { contains: genre, mode: "insensitive" } } : {}),
    ...(minBpm !== undefined || maxBpm !== undefined
      ? { bpm: { gte: minBpm, lte: maxBpm } }
      : {}),
  };

  const [tracks, total] = await Promise.all([
    db.track.findMany({
      where,
      orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { producer: { select: { id: true, name: true } } },
    }),
    db.track.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const next = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined) as [
        string,
        string,
      ][],
    );
    next.set("page", String(targetPage));
    return `/browse?${next.toString()}`;
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Browse beats</h1>

      <form className="flex flex-wrap items-end gap-3" action="/browse">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Search</span>
          <input
            name="q"
            type="text"
            defaultValue={q}
            placeholder="Title"
            className="rounded border px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Genre</span>
          <input
            name="genre"
            type="text"
            defaultValue={genre}
            className="w-32 rounded border px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Min BPM</span>
          <input
            name="minBpm"
            type="number"
            defaultValue={minBpm}
            className="w-24 rounded border px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Max BPM</span>
          <input
            name="maxBpm"
            type="number"
            defaultValue={maxBpm}
            className="w-24 rounded border px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Sort</span>
          <select
            name="sort"
            defaultValue={sort}
            className="rounded border px-3 py-2"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Apply
        </button>
      </form>

      {tracks.length === 0 ? (
        <p className="text-gray-500">No beats match those filters.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between text-sm">
        {page > 1 ? (
          <Link href={pageHref(page - 1)} className="underline">
            Previous
          </Link>
        ) : (
          <span />
        )}
        <span className="text-gray-500">
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={pageHref(page + 1)} className="underline">
            Next
          </Link>
        ) : (
          <span />
        )}
      </div>
    </main>
  );
}
