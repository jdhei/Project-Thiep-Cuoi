import { getWishes } from "@/features/weddings/rsvp.actions";
import { WishManager } from "./WishManager";

type Params = { params: { id: string } };

export default async function WishesPage({ params }: Params) {
  const wishes = await getWishes(params.id);

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-gray-800">
        Sổ lời chúc
      </h3>
      <WishManager
        weddingId={params.id}
        initialWishes={wishes.map((w) => ({ ...w, createdAt: w.createdAt }))}
      />
    </div>
  );
}
