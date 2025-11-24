/**
 * 遅延処理ユーティリティ
 */

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
