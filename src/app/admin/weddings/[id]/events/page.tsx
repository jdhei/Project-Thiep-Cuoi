import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { EventManager } from "./EventManager";

type Params = { params: { id: string } };

export default async function EventsPage({ params }: Params) {
  await requireAdminSession();

  const wedding = await db.wedding.findUnique({
    where: { id: params.id },
    include: { events: { orderBy: { sortOrder: "asc" } } },
  });
  if (!wedding) notFound();

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-gray-800">
        Sự kiện — {wedding.groomName} & {wedding.brideName}
      </h2>
      <EventManager weddingId={wedding.id} events={wedding.events} />
    </div>
  );
}
