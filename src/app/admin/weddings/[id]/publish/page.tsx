import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { validatePublishReady } from "@/features/weddings/wedding.validators";
import { PublishActions } from "./PublishActions";

export default async function PublishPage({ params }: { params: { id: string } }) {
  await requireAdminSession();

  const wedding = await db.wedding.findUnique({
    where: { id: params.id },
    include: { events: true },
  });
  if (!wedding) notFound();

  const validation = validatePublishReady(wedding);

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <section className="rounded-xl bg-white p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Kiểm tra trước khi xuất bản</h3>
        <ul className="space-y-3">
          {validation.checks.map((check, i) => (
            <li key={i} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                  check.passed
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {check.passed ? "✓" : "✗"}
              </span>
              <span
                className={`text-sm ${
                  check.passed ? "text-gray-700" : "text-red-600 font-medium"
                }`}
              >
                {check.label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Actions */}
      <PublishActions
        weddingId={params.id}
        status={wedding.status}
        slug={wedding.slug}
        canPublish={validation.valid}
        errors={validation.errors}
      />
    </div>
  );
}
