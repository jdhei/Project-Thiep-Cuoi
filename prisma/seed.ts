/**
 * Seed dữ liệu demo: thiệp "Quân & Linh" (dựa trên prototype).
 * Chạy: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";

const db = new PrismaClient();

function code(): string {
  return randomBytes(4).toString("hex");
}

async function main() {
  const slug = "quan-linh";

  // Idempotent: xoá thiệp demo cũ nếu có (cascade xoá con).
  const existing = await db.wedding.findUnique({ where: { slug } });
  if (existing) {
    await db.wedding.delete({ where: { id: existing.id } });
  }

  const wedding = await db.wedding.create({
    data: {
      slug,
      status: "PUBLISHED",
      groomName: "Quân",
      brideName: "Linh",
      weddingDate: new Date("2026-12-20T08:00:00+07:00"),
      title: "Trân trọng kính mời",
      introduction: "Sự hiện diện của bạn là niềm vinh hạnh của chúng mình.",
      loveStory:
        "Chúng mình gặp nhau vào một chiều mưa Hà Nội, cùng trú dưới một mái hiên nhỏ. " +
        "Từ tách cà phê đầu tiên đến những chuyến đi khắp mọi miền, tình yêu lớn dần theo năm tháng. " +
        "Và hôm nay, chúng mình muốn viết tiếp câu chuyện ấy — cùng nhau, mãi mãi.",
      primaryColor: "#8A6D3B",
      showCountdown: true,
      showStory: true,
      showGallery: true,
      showRsvp: true,
      showWishes: true,
      showGift: false,
      showMusic: true,
      events: {
        create: [
          {
            title: "Lễ Vu Quy",
            startsAt: new Date("2026-12-20T08:00:00+07:00"),
            address: "Tư gia nhà gái · 123 Nguyễn Trãi, Thanh Xuân, Hà Nội",
            mapUrl: "https://maps.google.com",
            sortOrder: 0,
          },
          {
            title: "Lễ Thành Hôn",
            startsAt: new Date("2026-12-20T11:00:00+07:00"),
            address: "Trung tâm tiệc cưới Sen Vàng · 88 Trần Duy Hưng, Cầu Giấy",
            mapUrl: "https://maps.google.com",
            sortOrder: 1,
          },
          {
            title: "Tiệc Mừng",
            startsAt: new Date("2026-12-20T18:00:00+07:00"),
            address: "Grand Ballroom · Khách sạn Metropole, Hoàn Kiếm",
            mapUrl: "https://maps.google.com",
            sortOrder: 2,
          },
        ],
      },
      guests: {
        create: [
          { fullName: "Minh Anh", invitationCode: code(), maximumPeople: 2 },
          { fullName: "Gia đình bác Tú", invitationCode: code(), maximumPeople: 4 },
        ],
      },
      wishes: {
        create: [
          {
            guestName: "Minh Anh",
            content: "Chúc hai bạn trăm năm hạnh phúc, sớm có tin vui!",
            status: "APPROVED",
          },
          {
            guestName: "Gia đình bác Tú",
            content: "Mừng hạnh phúc hai cháu. Sống bên nhau thật lâu và luôn yêu thương.",
            status: "APPROVED",
          },
          {
            guestName: "Khách ẩn danh",
            content: "Lời chúc đang chờ duyệt (không hiển thị công khai).",
            status: "PENDING",
          },
        ],
      },
    },
  });

  console.log(`✓ Seed xong thiệp demo: /w/${wedding.slug} (id=${wedding.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
