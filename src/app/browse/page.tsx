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
      include: {
        producer: { select: { id: true, name: true } },
        licenses: { where: { active: true } },
      },
    }),
    db.track.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(q || genre || minBpm !== undefined || maxBpm !== undefined);

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
    <main className="page">
      <h1 className="text-2xl font-semibold">Browse beats</h1>

      <form className="card flex flex-wrap items-end gap-3" action="/browse">
        <label className="flex flex-col gap-1">
          <span className="label">Search</span>
          <input
            name="q"
            type="text"
            defaultValue={q}
            placeholder="Title"
            className="input"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="label">Genre</span>
          <input
            name="genre"
            type="text"
            defaultValue={genre}
            className="input w-32"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="label">Min BPM</span>
          <input
            name="minBpm"
            type="number"
            defaultValue={minBpm}
            className="input w-24"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="label">Max BPM</span>
          <input
            name="maxBpm"
            type="number"
            defaultValue={maxBpm}
            className="input w-24"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="label">Sort</span>
          <select name="sort" defaultValue={sort} className="input">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>

        <button type="submit" className="btn-primary">
          Apply
        </button>
        {hasFilters && (
          <Link href="/browse" className="btn-ghost">
            Clear
          </Link>
        )}
      </form>

      {tracks.length === 0 ? (
        <div className="card py-10 text-center text-muted">
          No beats match those filters.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="btn-secondary">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className="btn-secondary">
              Next →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </main>
  );
}
