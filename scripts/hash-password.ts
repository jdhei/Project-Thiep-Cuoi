/**
 * Sinh bcrypt hash cho mật khẩu admin.
 * Dùng: npx tsx scripts/hash-password.ts "matkhau-cua-ban"
 * Sau đó dán kết quả vào ADMIN_PASSWORD_HASH trong .env.local
 */
import { hashPassword } from "../src/lib/auth/password";

async function main() {
  const pw = process.argv[2];
  if (!pw) {
    console.error('Cách dùng: npx tsx scripts/hash-password.ts "matkhau"');
    process.exit(1);
  }
  const hash = await hashPassword(pw);
  console.log(hash);
}

main();
