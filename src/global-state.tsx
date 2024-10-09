import { createContext, useReducer, useContext, ReactNode, Dispatch } from 'react';
import { getAddress } from 'viem';
import { StringFCUserMap, NeynarUser } from './types';


interface GlobalState {
  addressToFCUser: StringFCUserMap;
}

interface Action {
  type: string;
  payload: any;
}

// 1. Create Context
const GlobalStateContext = createContext<{ state: GlobalState; dispatch: Dispatch<Action> } | undefined>(undefined);

// 2. Create Reducer Function
const initialState: GlobalState = {
  addressToFCUser: {},
};

function globalReducer(state: GlobalState, action: Action) {
  switch (action.type) {
    case 'RESOLVE_FC_HANDLE':
      const users = {...state.addressToFCUser};
      Object.keys(action.payload).forEach(address => {
        action.payload[address].forEach((user: NeynarUser) => {
          const casedAddr = getAddress(address);
          if (!users[casedAddr]) {
            users[casedAddr] = {
              username: user.username,
              numFollowers: user.follower_count,
            };
          } else if (users[casedAddr].numFollowers < user.follower_count) {
            users[casedAddr] = {
              username: user.username,
              numFollowers: user.follower_count,
            };
          }
        });
      });
      return { ...state, addressToFCUser: users };
    default:
      return state;
  }
}

// 3. Create a Provider Component
export function GlobalStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  return (
    <GlobalStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalStateContext.Provider>
  );
}

// 4. Custom Hook to Access Global State
export function useGlobalState() {
  const context = useContext(GlobalStateContext);

  if (!context) {
      throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }

  return context;
}
