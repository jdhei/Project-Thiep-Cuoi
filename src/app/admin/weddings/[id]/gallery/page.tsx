import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { GalleryManager } from "./GalleryManager";

type Params = { params: { id: string } };

export default async function GalleryPage({ params }: Params) {
  await requireAdminSession();

  const wedding = await db.wedding.findUnique({
    where: { id: params.id },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!wedding) notFound();

  const cover = wedding.media.find((m) => m.type === "cover");
  const gallery = wedding.media.filter((m) => m.type === "gallery");
  const music = wedding.media.find((m) => m.type === "music");

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-gray-800">
        Media — {wedding.groomName} & {wedding.brideName}
      </h2>
      <GalleryManager
        weddingId={wedding.id}
        cover={cover ?? null}
        gallery={gallery}
        music={music ?? null}
      />
    </div>
  );
}
