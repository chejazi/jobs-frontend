import { createContext, useReducer, useContext, ReactNode, Dispatch } from 'react';
import { getAddress } from 'viem';
import { StringFCUserMap, PassportSocial } from './types';


interface GlobalState {
  addressToFCUser: StringFCUserMap;
}

interface Action {
  type: string;
  meta: {
    address: string;
  };
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
      const { passport } = action.payload;
      if (passport) {
        const user = passport.passport_socials.filter((s: PassportSocial) => s.source == 'farcaster')?.[0];
        if (user) {
          const casedAddr = getAddress(action.meta.address);
          if (!users[casedAddr]) {
            users[casedAddr] = {
              username: user.profile_name,
              fallbackBio: user.profile_bio,
              pfpUrl: user.profile_image_url,
              numFollowers: user.follower_count,
              builderScore: passport.score,
              passportId: passport.passport_id,
            };
          }
        }
      }
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
