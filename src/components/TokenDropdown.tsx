import { useReadContract } from 'wagmi';
import { Address } from 'viem';
import Creatable from 'react-select/creatable';

import { getDefaultTokens, getTokenImage } from 'utils/data'
import { DropdownOptionLabel, TokenMap, Token } from '../types';
import { readApiAbi, readApiAddress } from 'constants/abi-read-api';
// import { erc20Abi } from 'constants/abi-erc20';

const formatOptionLabel = ({ label, description, value }: DropdownOptionLabel) => (
  <div className="flex" style={{ alignItems: 'center' }}>
    <div className="flex-shrink" style={{ width: '24px', height: '24px', marginRight: '.5em' }}>
      <img src={getTokenImage(value)} style={{ width: '24px', height: '24px', borderRadius: '500px' }} />
    </div>
    <div className="flex-grow">
      <div style={{ fontWeight: 'bold' }}>{label}</div>
      <div className="tvl" style={{ fontWeight: 'normal', fontSize: '.75em' }}>{description}</div>
    </div>
  </div>
);

function TokenDropdown({ token, setToken }: { token: string | null, setToken: (t: string | null) => void}) {
  const tokenMap: TokenMap = {};

  const tokens = getDefaultTokens();
  const { data: tokenMetadataRes } = useReadContract({
    abi: readApiAbi,
    address: readApiAddress as Address,
    functionName: "getTokenMetadata",
    args: [tokens],
  });
  const tokenMetadata = (tokenMetadataRes || [[], [], []]) as [string[], string[], bigint[]];
  const names = tokenMetadata[0];
  const symbols = tokenMetadata[1];
  const decimals = tokenMetadata[2].map(n => Number(n));

  tokens.forEach((t, i) => tokenMap[t] = {
    name: names[i] || '',
    symbol: symbols[i] || '',
    decimals: decimals[i] || 18,
    image: getTokenImage(t),
    price: 0,
    appStake: 0n,
    userStake: 0n,
  });

  // const { data: balanceRes } = useReadContract({
  //   abi: erc20Abi,
  //   address: token,
  //   functionName: "balanceOf",
  //   args: [userAddress],
  // });
  // const balance = (balanceRes || 0n) as number;


  const options = Object.keys(tokenMap).map(address => {
    const t: Token = tokenMap[address];
    let description = null;
      // const stakedUnits = formatUnits(balance, t.decimals);
      // description = `${prettyPrint(stakedUnits, 0)} $${t.symbol} available`;
    return {
      value: address,
      label: `$${t.symbol}`,
      image: t.image,
      description,
    };
  });

  const selectedOption = options.filter(t => t.value == token)?.[0];

  return (
    <div>
      <Creatable
        placeholder="Choose token or paste address"
        isClearable
        options={options}
        id="coin-selector"
        classNamePrefix="coin-selector"
        onChange={(e) => {
          setToken(e ? e.value as Address : null)
        }}
        value={selectedOption}
        formatOptionLabel={formatOptionLabel}
      />
    </div>
  );
}

export default TokenDropdown;
