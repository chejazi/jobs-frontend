import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { prettyPrint } from 'utils/formatting';

import { registryAddress, registryAbi } from 'constants/abi-registry';
import { readApiAddress, readApiAbi } from 'constants/abi-read-api';
import { StringBigIntMap } from '../types';
import Username from './Username';

function People() {
  // const account = useAccount();
  // const userAddress = account.address;
   const { data: usersRes } = useReadContract({
    abi: registryAbi,
    address: registryAddress,
    functionName: "getUsers",
    args: [],
  });
  const users = (usersRes || []) as string[];

  const { data: stakedRes } = useReadContract({
    abi: readApiAbi,
    address: readApiAddress,
    functionName: "getStakedJobs",
    args: [users],
  });
  const stakes = (stakedRes || []) as bigint[];

  const userStake: StringBigIntMap = {};
  users.forEach((u, i) => {
    userStake[u] = stakes[i];
  });

  const usersCopy = users.slice(0);

  return (
    <div
      className="ui-island"
      style={{
        padding: '1em',
        position: 'relative',
        maxWidth: '500px',
        margin: '0 auto'
      }}
    >
      <h2 style={{ marginBottom: '0' }}>Top candidates</h2>
      <p>As people stake more $JOBS on a user, they rise in the ranks.</p>
      <ol>
        {
          usersCopy.sort((a, b) => userStake[a] > userStake[b] ? -1 : 1).slice(0, 20).map(u => (
            <li key={`u-${u}`}>
              <div style={{ marginBottom: '.25em' }}>
                <Link to={`/profile/${u}`}><Username address={u} /></Link>
                <div style={{ fontSize: '.75em' }}>
                  {prettyPrint(formatUnits(userStake[u] || 0n, 18), 0)} $JOBS
                </div>
              </div>
            </li>
          ))
        }
      </ol>
    </div>
  );
}

export default People;
