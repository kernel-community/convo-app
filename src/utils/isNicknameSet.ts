import { DEFAULT_USER_NICKNAME } from "./constants";

const isNicknameSet = (nickname: string | undefined | null) => {
  return nickname && nickname !== DEFAULT_USER_NICKNAME;
};

export default isNicknameSet;
