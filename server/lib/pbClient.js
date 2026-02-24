import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.PB_URL);

await pb.admins.authWithPassword(
  process.env.PB_ADMIN_EMAIL,
  process.env.PB_ADMIN_PASSWORD
);

export default pb;
