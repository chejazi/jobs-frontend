import { Link, useParams } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { Address } from 'viem';
import { jobBoardAddress, jobBoardAbi } from 'constants/abi-job-board-v2';
import { erc20Abi } from 'constants/abi-erc20';
import JobTable from './JobTable';

function BrowseJobs() {
  const { address } = useParams();

  const { data: jobIdRes } = useReadContract({
    abi: jobBoardAbi,
    address: jobBoardAddress,
    functionName: "getOpen",
    args: address ? [address] : [],
    // scopeKey: `stakemanager-${cacheBust}`
  });
  const jobIds = (jobIdRes as bigint[] || []).map(id => Number(id)).sort((a, b) => a < b ? 1 : -1);

  const { data: tokenSymbolRes } = useReadContract({
    abi: erc20Abi,
    address: address as Address,
    functionName: "symbol",
    args: [],
    // scopeKey: `stakemanager-${cacheBust}`
  });
  const tokenSymbol = (tokenSymbolRes || null) as string|null;

  return (
    <div
      className="ui-island"
      style={{
        padding: '1em',
        position: 'relative',
        maxWidth: '1000px',
        margin: '0 auto'
      }}
    >
      <div className="flex" style={{ alignItems: 'center' }}>
        <div className="flex-grow" style={{ fontWeight: 'bold' }}>
          {
            tokenSymbol ? `Browsing $${tokenSymbol} jobs` : 'Browsing all open jobs'
          }
        </div>
        <div className="flex-shrink">
          <Link to="/new">
            <button className="secondary-button">Post a job</button>
          </Link>
        </div>
      </div>
      <JobTable jobIds={jobIds} showOnlyActive={true} />
    </div>
  );
}

export default BrowseJobs;
