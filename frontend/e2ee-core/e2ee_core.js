/* @ts-self-types="./e2ee_core.d.ts" */
import * as wasm from "./e2ee_core_bg.wasm";
import { __wbg_set_wasm } from "./e2ee_core_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    decrypt_message, derive_shared_secret, encrypt_message, generate_keypair
} from "./e2ee_core_bg.js";
