import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalState } from '../global-state';
import { address2FC } from 'utils/data';
import { prettyPrintAddress } from 'utils/formatting';

function Username({ address, link, both }: { address: string, link?: boolean, both?: boolean }) {
  const { state, dispatch } = useGlobalState();
  const fcHandle = (state.addressToFCUser[address] || {}).username;

  useEffect(() => {
    if (!fcHandle && address != '0x0000000000000000000000000000000000000000') {
      address2FC(dispatch, [address]);
    }
  }, [fcHandle, address]);

  let handleElt = null;
  if (fcHandle) {
    handleElt = (
      <span>{fcHandle}<img src="/fc.svg" style={{ height: '1em', marginLeft: '.25em', marginBottom: '-.1em' }} /></span>
    );
  }
  let addressElt = <span>{prettyPrintAddress(address)}</span>;

  if (link) {
    if (handleElt) {
      handleElt = (<Link to={`https://warpcast.com/${fcHandle}`} target="_blank" style={{ marginRight: '.5em' }}>{handleElt}</Link>);
    }
    addressElt = (<Link to={`https://basescan.org/address/${address}`} target="_blank">{addressElt}</Link>)
  }
  if (both) {
    return <span>{handleElt}<span className="secondary-text">({addressElt})</span></span>
  }  else {
    return handleElt || addressElt;
  }
}

export default Username;
