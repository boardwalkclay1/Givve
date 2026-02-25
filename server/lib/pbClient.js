import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.POCKETBASE_URL);

// No admin login here — backend routes authenticate users normally.

export default pb;
