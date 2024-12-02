import { useEffect } from 'react';
import { useGlobalState } from '../global-state';
import { address2FC } from 'utils/data';

function UserBio({ address, bio }: { address: string, bio: string | null }) {
  const { state, dispatch } = useGlobalState();
  const user = (state.addressToFCUser[address] || {});
  const { fallbackBio } = user;
  useEffect(() => {
    if (!fallbackBio && address != '0x0000000000000000000000000000000000000000') {
      address2FC(dispatch, [address]);
    }
  }, [fallbackBio, address]);
  return bio || fallbackBio;
}

export default UserBio;
