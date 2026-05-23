/**
 * TSB hub "Veri Durumu" meta dosyası.
 *   npm run tsb:meta
 */
import { writeTsbVeriDurumuMeta } from "../lib/tsbVeriDurumu";

const meta = writeTsbVeriDurumuMeta();
console.log(`[tsb-meta] → public/data/tsb/meta.json`);
console.log(JSON.stringify(meta, null, 2));
