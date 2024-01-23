// check if given host is either staging or localhost
// if yes, return false
// if no, return true

import { STAGING } from "src/utils/constants";

export default function isProd(host?: string) {
  if (!host) return false;
  return !(host === STAGING || host === "localhost");
}
