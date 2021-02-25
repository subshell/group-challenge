import { createContext } from 'react';

export interface IAppContext {
  user?: {
    username: string;
  };
}

export const appContext: IAppContext = {
  user: undefined,
};

export const AppContext = createContext<[IAppContext, (context?: IAppContext) => void]>([
  {
    user: undefined,
  },
  () => {},
]);
