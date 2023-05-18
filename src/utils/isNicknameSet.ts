import { DEFAULT_USER_NICKNAME } from "./constants";

const isNicknameSet = (nickname: string | undefined | null): boolean => {
  return nickname ? nickname !== DEFAULT_USER_NICKNAME : false;
};

export default isNicknameSet;
