/**
 * Build configuration for `onixbyte.cn`.
 *
 * Thin wrapper over the shared factory — see `rspress.config.ts` for what the
 * `cn` target changes. Invoke it with `pnpm build:cn`, which passes this file
 * via `rspress build --config`.
 */
import { createConfig } from "./rspress.config"

export default createConfig("cn")
