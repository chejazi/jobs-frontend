import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { jobBoardAddress, jobBoardAbi } from 'constants/abi-job-board-v2';
import JobTable from './JobTable';

function BrowseJobs() {
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  const { data: counterRes } = useReadContract({
    abi: jobBoardAbi,
    address: jobBoardAddress,
    functionName: "counter",
    args: [],
    // scopeKey: `stakemanager-${cacheBust}`
  });
  const counter = Number(counterRes as bigint || 0n);

  const jobIds = [];
  for (let i = counter; i > 0; i--) {
    // if (i != 20) {
      jobIds.push(i);
    // }
  }

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
        <div className="flex-grow">
          <input type="checkbox" id="show-open" checked={showOnlyActive} onChange={(e) => setShowOnlyActive(e.target.checked)} />
          &nbsp;&nbsp;
          <label htmlFor="show-open">Show only open jobs</label>
        </div>
        <div className="flex-shrink">
          <Link to="/new">
            <button className="secondary-button">Post a job</button>
          </Link>
        </div>
      </div>
      <JobTable jobIds={jobIds} showOnlyActive={showOnlyActive} />
    </div>
  );
}

export default BrowseJobs;
