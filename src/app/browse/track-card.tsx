import Link from "next/link";

type Track = {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  coverArtUrl: string | null;
  producer: { id: string; name: string | null };
};

export function TrackCard({ track }: { track: Track }) {
  return (
    <li className="flex flex-col gap-2 rounded border p-3">
      <Link href={`/tracks/${track.id}`} className="flex flex-col gap-2">
        <div className="aspect-square w-full overflow-hidden rounded bg-gray-100">
          {track.coverArtUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.coverArtUrl}
              alt={track.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <p className="font-medium">{track.title}</p>
      </Link>
      <p className="text-sm text-gray-500">
        {track.genre} · {track.bpm} BPM
      </p>
      <Link
        href={`/producers/${track.producer.id}`}
        className="text-sm underline"
      >
        {track.producer.name ?? "Unknown producer"}
      </Link>
    </li>
  );
}
