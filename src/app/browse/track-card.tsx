import Link from "next/link";

type Track = {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  coverArtUrl: string | null;
  producer: { id: string; name: string | null };
  licenses?: { type: string; price: number }[];
};

export function TrackCard({ track }: { track: Track }) {
  const oneTimePrice = track.licenses?.find((l) => l.type === "ONE_TIME");

  return (
    <li className="card group flex flex-col gap-3 p-3 transition-colors hover:bg-surface-hover">
      <Link href={`/tracks/${track.id}`} className="flex flex-col gap-3">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-background">
          {track.coverArtUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.coverArtUrl}
              alt={track.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl text-muted">
              ♪
            </div>
          )}
          {oneTimePrice && (
            <span className="badge absolute right-2 bottom-2 border-none bg-background/80 text-foreground backdrop-blur">
              ${(oneTimePrice.price / 100).toFixed(2)}
            </span>
          )}
        </div>
        <p className="font-medium group-hover:text-accent">{track.title}</p>
      </Link>
      <p className="text-sm text-muted">
        {track.genre} · {track.bpm} BPM
      </p>
      <Link
        href={`/producers/${track.producer.id}`}
        className="link text-sm"
      >
        {track.producer.name ?? "Unknown producer"}
      </Link>
    </li>
  );
}
