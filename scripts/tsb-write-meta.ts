/**
 * TSB hub "Veri Durumu" meta + Sektör Özeti önbelleği.
 *   npm run tsb:meta
 */
import { writeTsbVeriDurumuMeta } from "../lib/tsbVeriDurumu";
import { writeSektorOzetiCache } from "../lib/tsbSektorOzeti";

const meta = writeTsbVeriDurumuMeta();
console.log(`[tsb-meta] → public/data/tsb/meta.json`);
console.log(JSON.stringify(meta, null, 2));

writeSektorOzetiCache();
console.log(`[tsb-meta] → public/data/tsb/sektor-ozeti.json`);
