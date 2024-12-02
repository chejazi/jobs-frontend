import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, Address } from 'viem';

import { erc20Abi } from 'constants/abi-erc20';
import { jobBoardAddress, jobBoardAbi } from 'constants/abi-job-board-v2';
import TokenDropdown from './TokenDropdown';

function CreateJob() {
  const navigate = useNavigate();
  const account = useAccount();
  const userAddress = account.address;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [token, setToken] = useState<string|null>(null);
  const [quantity, setQuantity] = useState('');
  const [duration, setDuration] = useState('');
  const [posting, setPosting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [lastManaged, setLastManaged] = useState(-1);
  const [units, setUnits] = useState("days");
  const [cacheBust, setCacheBust] = useState(1);

  const { writeContract, error: writeError, data: writeData } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  useEffect(() => {
    setQuantity('');
  }, [token]);

  const tokenAddress = token as Address;

  useEffect(() => {
    if (writeError) {
      setApproving(false);
      setPosting(false);
      setTimeout(() => window.alert(writeError), 1);
    } else if (isConfirmed) {
      if (posting) {
        setQuantity('');
      }
      setApproving(false);
      setPosting(false);
      setCacheBust(cacheBust + 1);
    }
  }, [writeError, isConfirmed]);

  // User's Token Balance / Allowance
  const { data: balanceOfRes } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "balanceOf",
    args: [userAddress],
    scopeKey: `postmanager-${cacheBust}`
  });
  const userWalletWei = (balanceOfRes || 0n) as bigint;

  const { data: allowanceRes } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "allowance",
    args: [userAddress, jobBoardAddress],
    scopeKey: `postmanager-${cacheBust}`
  });
  const allowance = (allowanceRes || 0n) as bigint;

  // Token Metadata

  const { data: decimalsRes } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "decimals",
    args: [],
  });
  const decimals = Number(decimalsRes as bigint || 0n);

  const { data: symbolRes } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "symbol",
    args: [],
  });
  const symbol = (symbolRes || '') as string;

  // Job posted

  const { data: managedRes } = useReadContract({
    abi: jobBoardAbi,
    address: jobBoardAddress,
    functionName: "getManaged",
    args: [userAddress],
    scopeKey: `postmanager-${cacheBust}`
  });
  const managed = managedRes ? (managedRes as bigint[]).map(r => Number(r)) : null;

  useEffect(() => {
    if (managed) {
      const latestJobId = managed.sort((a, b) => a < b ? 1 : -1)[0];
      if (lastManaged < 0) {
        setLastManaged(latestJobId);
      } else if (lastManaged != latestJobId) {
        navigate(`/${latestJobId}`);
      }
    }
  }, [managed, lastManaged])

  const wei = parseUnits((quantity || '0').toString(), decimals);
  let seconds: number = Number(duration);
  if (units == "hours") {
    seconds *= 3600;
  } else if (units == "days") {
    seconds *= 86400;
  } else if (units == "weeks") {
    seconds *= 604800;
  }

  const approve = () => {
    setApproving(true);
    writeContract({
      abi: erc20Abi,
      address: tokenAddress,
      functionName: "approve",
      args: [jobBoardAddress, wei],
    });
  };

  const post = () => {
    setPosting(true);
    writeContract({
      abi: jobBoardAbi,
      address: jobBoardAddress,
      functionName: "create",
      args: [title, description, token, wei, seconds],
    });
  };

  const input = parseFloat(quantity || '0');
  const hasAllowance = allowance >= wei;

  const userWalletUnits = formatUnits(userWalletWei, decimals);

  const pending = posting;

  return (
    <div className="ui-island" style={{ maxWidth: '600px', margin: '0 auto', padding: '1em' }}>
      <h2>Job</h2>
      <input
        className='text-input'
        placeholder="title"
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <br />
      <br />
      <textarea
        className='text-input'
        placeholder="description"
        style={{ resize: "vertical", minHeight: '5em' }}
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <br />
      <br />
      <h2>Compensation</h2>
      <TokenDropdown token={token} setToken={setToken} />
      <br />
      <div className="flex" style={{ alignItems: 'center' }}>
        <input
          className="flex-grow text-input"
          type="text"
          name="quantity"
          autoComplete="off"
          placeholder={`${symbol || 'tokens'} to pay`}
          style={{ width: "100%" }}
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value.replace(/[^0-9.]/g, ''));
          }}
        />
        {
          symbol ? (
            <div className="flex-shrink" style={{ marginLeft: '1em' }}>
              ${symbol}
            </div>
          ) : null
        }
      </div>
      <br />
      <div className="flex" style={{ alignItems: 'center' }}>
        <input
          className="flex-grow text-input"
          type="text"
          name="duration"
          autoComplete="off"
          placeholder="job duration"
          style={{ width: "100%" }}
          value={duration}
          onChange={(e) => {
            setDuration(e.target.value.replace(/[^0-9.]/g, ''));
          }}
        />
        <div className="flex-shrink" style={{ marginLeft: '1em' }}>
          <select
            className="text-input"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
          >
            <option value="hours">hours</option>
            <option value="days">days</option>
            <option value="weeks">weeks</option>
          </select>
        </div>
      </div>
      <br />
      <h2>The Fine Print ™️</h2>
      <div>All jobs must be funded at the time of creation. For the job to start, you must offer the job to a candidate and they must accept. You may cancel a job before it has started and receive a full refund. If a job has started, you can end the job early and claim a refund of the prorated time remaining, less the 10% commission paid to stakers on the candidate.</div>
      <br />
      <br />
      <div className="flex">
        {
          hasAllowance ? (
            <button
              type="button"
              className="primary-button flex-grow"
              onClick={post}
              disabled={pending || !(input > 0 && parseFloat(userWalletUnits) >= input)}
            >
              {posting ? 'posting' : 'post'}
              {
                posting ? (
                  <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                ) : null
              }
            </button>
          ) : (
            <button
              type="button"
              className="primary-button flex-grow"
              onClick={approve}
              disabled={pending || !(input > 0 && parseFloat(userWalletUnits) >= input)}
            >
              {approving ? 'approving' : 'approve and post'}
              {
                approving ? (
                  <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                ) : null
              }
            </button>
          )
        }
      </div>
    </div>
  );
}

export default CreateJob;
