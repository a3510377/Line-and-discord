// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type keyType = keyof any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deepCopy = <T extends Record<keyType, any> | any[]>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/** dict omit
 * Returns a new object with properties from the original object omitted.
 * for typescript Omit type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DictOmit = <T extends Record<keyType, any>, K extends keyType>(
  obj: T,
  ...keys: K[]
): Omit<T, K> => {
  const newObj = deepCopy(obj);

  // eslint-disable-next-line no-param-reassign
  for (const key of keys) delete newObj[key];

  return newObj;
};

/** dict pick
 * Returns a new object with properties from the original object picked.
 * for typescript Pick type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DictPick = <T extends Pick<KeyType, any>, K extends keyType>(
  obj: T,
  ...keys: K[]
): Pick<T, K> => {
  const newObj = <Pick<T, K>>{};

  for (const key of keys) newObj[key] = obj[key];

  return newObj;
};
