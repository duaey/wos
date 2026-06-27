/**
 * Komut satırından WOS poller'ı çalıştırır:  npm run poll
 * Sunucusuz cron yerine kendi makinende/cron'da periyodik çalıştırmak için.
 */
import { pollAllMembers } from "../src/lib/poll";

pollAllMembers()
  .then((r) => {
    console.log("Poll bitti:", r);
    process.exit(0);
  })
  .catch((e) => {
    console.error("Poll hatası:", e);
    process.exit(1);
  });
