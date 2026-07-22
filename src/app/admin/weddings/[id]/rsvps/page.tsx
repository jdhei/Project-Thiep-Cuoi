import { getRsvpStats } from "@/features/weddings/rsvp.actions";
import { RsvpManager } from "./RsvpManager";

type Params = { params: { id: string } };

export default async function RsvpsPage({ params }: Params) {
  const { rsvps, stats } = await getRsvpStats(params.id);

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-gray-800">
        Xác nhận tham dự (RSVP)
      </h3>
      <RsvpManager
        weddingId={params.id}
        initialRsvps={rsvps.map((r) => ({ ...r, createdAt: r.createdAt }))}
        initialStats={stats}
      />
    </div>
  );
}
