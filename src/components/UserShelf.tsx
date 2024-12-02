import { useEffect, ReactNode } from 'react';
import { useGlobalState } from '../global-state';
import { address2FC } from 'utils/data';
import { prettyPrintAddress } from 'utils/formatting';

function Username({ address, children }: { address: string, children?: ReactNode | undefined }) {
  const { state, dispatch } = useGlobalState();
  const user = (state.addressToFCUser[address] || {});
  const { pfpUrl, username } = user;

  useEffect(() => {
    if (!username && address != '0x0000000000000000000000000000000000000000') {
      address2FC(dispatch, [address]);
    }
  }, [username, address]);

  let handleElt = null;
  if (username) {
    handleElt = (
      <span>
        {username}
        <span onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          window.open(`https://warpcast.com/${username}`);
        }}>
          <img src="/fc.svg" style={{ height: '1em', marginLeft: '.25em', marginBottom: '-.1em', cursor: 'pointer' }} />
        </span>
      </span>
    );
  }
  let addressElt = <span>{prettyPrintAddress(address)}</span>;
  return (
    <div className="flex" style={{ alignItems: 'center' }}>
      <div className="flex-shrink">
        <img
          src={pfpUrl || '/tokens/unknown-token.png'}
          style={{
            width: '3em',
            height: '3em',
            borderRadius: '500px',
            marginRight: '.5em',
            display: 'block'
          }}
        />
      </div>
      <div className="flex-grow">
        <div style={{ fontWeight: 'bold' }}>{handleElt || addressElt}</div>
        {children}
      </div>
    </div>
  );
}

export default Username;
