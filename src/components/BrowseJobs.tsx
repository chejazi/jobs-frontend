// import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { jobBoardAddress, jobBoardAbi } from 'constants/abi-job-board-v1';
import JobTable from './JobTable';

function BrowseJobs() {

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
    jobIds.push(i);
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
      {/*<div style={{ textAlign: 'right' }}>
        <Link to="/new">
          <button className="secondary-button">Post a job</button>
        </Link>
      </div>*/}
      <JobTable jobIds={jobIds} />
    </div>
  );
}

export default BrowseJobs;
