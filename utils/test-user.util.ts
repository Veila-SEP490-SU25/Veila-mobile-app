export const getTestUserId = () => {
  return __DEV__ ? "test-user-id" : "";
};

export const getValidUserId = (userId: string | undefined | null) => {
  if (userId) return userId;
  return getTestUserId();
};
