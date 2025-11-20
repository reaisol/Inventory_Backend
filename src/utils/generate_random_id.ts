import { v4 as uniqueId } from 'uuid';

export const generateRandomId = () => {
  return uniqueId();
};
