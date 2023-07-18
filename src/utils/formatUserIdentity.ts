/**
 * takes user address + nickname
 * returns string like
 * `nickame (0x12...123) [copy button]`
 */

import formatWalletAddress from "./formatWalletAddress";

export default function formatUserIdentity(nickname: string, addr: string) {
  return nickname + " (" + formatWalletAddress(addr) + ")";
}
