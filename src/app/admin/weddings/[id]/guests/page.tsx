import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { GuestManager } from "./GuestManager";

type Params = { params: { id: string } };

export default async function GuestsPage({ params }: Params) {
  await requireAdminSession();

  const wedding = await db.wedding.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      slug: true,
      groomName: true,
      brideName: true,
      guests: {
        orderBy: { fullName: "asc" },
        select: {
          id: true,
          fullName: true,
          phone: true,
          invitationCode: true,
          maximumPeople: true,
          personalizedMessage: true,
          _count: { select: { rsvps: true } },
        },
      },
    },
  });
  if (!wedding) notFound();

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-800">
        Khách mời — {wedding.groomName} &amp; {wedding.brideName}
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Mỗi khách có mã mời riêng. Chia sẻ link{" "}
        <code className="rounded bg-gray-100 px-1">/w/{wedding.slug}?guest=MÃ</code> để tự điền tên
        và giới hạn số người.
      </p>
      <GuestManager weddingId={wedding.id} slug={wedding.slug} guests={wedding.guests} />
    </div>
  );
}
