import { ADMIN_ADDRESSES } from "./constants";

export const isAdmin = (address: string | undefined | null): boolean => {
  if (!address) return false;
  const lowerCaseAddress = address.toLowerCase();
  const admins = ADMIN_ADDRESSES.map((addr) => addr.toLowerCase());
  if (admins.find((allowed) => lowerCaseAddress === allowed)) {
    console.log(`admin address ${lowerCaseAddress}`);
    return true;
  }
  return false;
};
