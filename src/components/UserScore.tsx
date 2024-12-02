import { useEffect } from 'react';
import { useGlobalState } from '../global-state';
import { address2FC } from 'utils/data';

function UserScore({ address }: { address: string }) {
  const { state, dispatch } = useGlobalState();
  const user = (state.addressToFCUser[address] || {});
  const { builderScore, passportId } = user;
  useEffect(() => {
    if (!builderScore && address != '0x0000000000000000000000000000000000000000') {
      address2FC(dispatch, [address]);
    }
  }, [builderScore, address]);
  if (builderScore) {
    return (
      <div
        className='profile-tag secondary-bg'
        onClick={() => window.open(`https://passport.talentprotocol.com/profile/${passportId}`, '_blank')}
      >
        Builder Score: {builderScore}
      </div>
    );
  } else {
    return null;
  }
}

export default UserScore;
