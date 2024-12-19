import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
// import { useCapabilities, useWriteContracts, useCallsStatus } from "wagmi/experimental";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, Address, parseUnits } from 'viem';
import { jobBoardAddress, jobBoardAbi } from 'constants/abi-job-board-v2';
import { readApiAddress, readApiAbi } from 'constants/abi-read-api';
import { tokenAbi } from 'constants/abi-token';
import { funderAbi } from 'constants/abi-funder';
import { erc20Abi } from 'constants/abi-erc20';
import { evm2Listing, evmEmptyListing } from 'utils/data';
import { prettyPrint, getTimeAgo, getDuration } from 'utils/formatting';
import { RawListing, StringBigIntMap } from '../types';
import Username from './Username';
import UserShelf from './UserShelf';
import RewardsProgressBar from './RewardsProgressBar';
const EMPTY_OFFER = '0x0000000000000000000000000000000000000000000000000000000000000000';
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

function JobListing() {
  const { jobId } = useParams();
  const account = useAccount();
  const userAddress = account.address;

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState(false);

  const [candidate, setCandidate] = useState("");
  const [offering, setOffering] = useState(false);
  const [applying, setApplying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [rescinding, setRescinding] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [funding, setFunding] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [cacheBust, setCacheBust] = useState(1);

  const { writeContract, error: writeContractError, data: writeContractData } = useWriteContract();

  // CB-SW-REENABLE
  // const { writeContracts, error: writeContractsError, data: writeContractsData } = useWriteContracts();
  // const { data: availableCapabilities } = useCapabilities({
  //   account: account.address,
  // });
  // const capabilities = useMemo(() => {
  //   if (!availableCapabilities || !account.chainId) return {};
  //   const capabilitiesForChain = availableCapabilities[account.chainId];
  //   if (
  //     capabilitiesForChain["paymasterService"] &&
  //     capabilitiesForChain["paymasterService"].supported
  //   ) {
  //     return {
  //       paymasterService: {
  //         url: 'https://api.developer.coinbase.com/rpc/v1/base/McRfKBFkYsCReIW4otXCyFqarpE6ClAU',
  //       },
  //     };
  //   }
  //   return {};
  // }, [availableCapabilities, account.chainId]);
  // const write = (args: any) => {
  //   if (capabilities.paymasterService) {
  //     writeContracts({ contracts: [args], capabilities });
  //   } else {
  //     writeContract(args);
  //   }
  // };
  const write = (args: any) => writeContract(args);

  // CB-SW-REENABLE
  // const { data: callsStatus } = useCallsStatus({
  //   id: writeContractsData as string,
  //   query: {
  //     refetchInterval: (data) =>
  //       data.state.data?.status === "CONFIRMED" ? false : 1000,
  //   },
  // });

  const { isSuccess } = useWaitForTransactionReceipt({
    hash: writeContractData,
  });
  const isConfirmed = isSuccess; // || (callsStatus && callsStatus.status === "CONFIRMED"); // CB-SW-REENABLE

  useEffect(() => {
    if (writeContractError) {
      setEditing(false);
      setApplying(false);
      setOffering(false);
      setCancelling(false);
      setRescinding(false);
      setAccepting(false);
      setEnding(false);
      setClaiming(false);
      setFunding(false);
      setTimeout(() => window.alert(writeContractError), 1);
    } else if (isConfirmed) {
      if (isEditingDescription) {
        setIsEditingDescription(false);
      }
      setEditing(false);
      setApplying(false);
      setOffering(false);
      setCancelling(false);
      setRescinding(false);
      setAccepting(false);
      setEnding(false);
      setClaiming(false);
      setFunding(false);
      setQuantity('');
      setCacheBust(cacheBust + 1);
    }
  }, [writeContractError, isConfirmed]);

  const { data: listingRes } = useReadContract({
    abi: readApiAbi,
    address: readApiAddress,
    functionName: "getListing",
    args: [jobId],
    scopeKey: `job-listing-${cacheBust}`
  });
  const job = evm2Listing(listingRes as RawListing || evmEmptyListing());

  const { data: boardRes } = useReadContract({
    abi: jobBoardAbi,
    address: jobBoardAddress,
    functionName: "getBoard",
    args: [jobId],
    scopeKey: `job-listing-${cacheBust}`
  });
  const boardAddress = (boardRes || jobBoardAddress) as Address;

  const { data: startTimeRes } = useReadContract({
    abi: jobBoardAbi,
    address: boardAddress,
    functionName: "getStartTime",
    args: [jobId],
    scopeKey: `job-listing-${cacheBust}`
  });
  const startTime = Number(startTimeRes || 0n) as number;

  const { data: workerRes } = useReadContract({
    abi: jobBoardAbi,
    address: boardAddress,
    functionName: "getWorker",
    args: [jobId],
    scopeKey: `job-listing-${cacheBust}`
  });
  const worker = (workerRes || NULL_ADDRESS) as string;

  const { data: pendingWorkerRes } = useReadContract({
    abi: jobBoardAbi,
    address: boardAddress,
    functionName: "getPendingWorker",
    args: [jobId],
    scopeKey: `job-listing-${cacheBust}`
  });
  const pendingWorker = (pendingWorkerRes || NULL_ADDRESS) as string;

  const { data: timeMoneyRes } = useReadContract({
    abi: jobBoardAbi,
    address: boardAddress,
    functionName: "getTimeAndMoneyOwed",
    args: [jobId],
    scopeKey: `job-listing-${cacheBust}`
  });
  const timeMoney = (timeMoneyRes || [0n, 0n]) as [bigint, bigint];
  const moneyOwed = timeMoney[1];

  const { data: appliedRes } = useReadContract({
    abi: jobBoardAbi,
    address: boardAddress,
    functionName: "hasApplied",
    args: [userAddress, jobId],
    scopeKey: `job-listing-${cacheBust}`
  });
  const applied = (appliedRes || false) as boolean;

  const { data: applicantTimesRes } = useReadContract({
    abi: jobBoardAbi,
    address: boardAddress,
    functionName: "getApplicantTimes",
    args: [jobId],
    scopeKey: `job-listing-${cacheBust}`
  });
  const applicantTimes = (applicantTimesRes || [[], []]) as [string[], bigint[]];
  const applications = applicantTimes[0].map((applicant, i) => ({
    applicant,
    time: new Date(Number(applicantTimes[1][i]) * 1000),
  }));

  const { data: funderRes } = useReadContract({
    abi: tokenAbi,
    address: job.token,
    functionName: "getFunder",
    args: [],
    scopeKey: `job-listing-${cacheBust}`
  });
  const treasury = (funderRes || NULL_ADDRESS) as string;

  const { data: ownerRes } = useReadContract({
    abi: tokenAbi,
    address: job.token,
    functionName: "owner",
    args: [],
    scopeKey: `job-listing-${cacheBust}`
  });
  const owner = (ownerRes || NULL_ADDRESS) as string;

  const { data: stakedRes } = useReadContract({
    abi: readApiAbi,
    address: readApiAddress,
    functionName: "getStakedJobs",
    args: [applicantTimes[0]],
  });
  const stakes = (stakedRes || []) as bigint[];

  const userStake: StringBigIntMap = {};
  applicantTimes[0].forEach((u, i) => {
    userStake[u] = stakes[i];
  });

  // Token Metadata

  const { data: decimalsRes } = useReadContract({
    abi: erc20Abi,
    address: job.token,
    functionName: "decimals",
    args: [],
  });
  const decimals = Number(decimalsRes || 18n) as number;

  const { data: symbolRes } = useReadContract({
    abi: erc20Abi,
    address: job.token,
    functionName: "symbol",
    args: [],
  });
  const symbol = (symbolRes || '') as string;

  const wei = parseUnits((quantity || '0').toString(), decimals);

  const apply = () => {
    setApplying(true);
    write({
      abi: jobBoardAbi,
      address: jobBoardAddress,
      functionName: "apply_",
      args: [jobId],
    });
  };

  const cancel = () => {
    setCancelling(true);
    write({
      abi: jobBoardAbi,
      address: jobBoardAddress,
      functionName: "cancel",
      args: [jobId],
    });
  };

  const rescind = () => {
    setRescinding(true);
    write({
      abi: jobBoardAbi,
      address: jobBoardAddress,
      functionName: "offer",
      args: [jobId, EMPTY_OFFER],
    });
  };

  const edit = () => {
    setEditing(true);
    write({
      abi: jobBoardAbi,
      address: jobBoardAddress,
      functionName: "updateDescription",
      args: [jobId, description],
    });
  };

  const offer = (candidate: string) => {
    setOffering(true);
    write({
      abi: jobBoardAbi,
      address: jobBoardAddress,
      functionName: "offer",
      args: [jobId, candidate],
    });
  };

  const end = () => {
    setEnding(true);
    write({
      abi: jobBoardAbi,
      address: jobBoardAddress,
      functionName: "end",
      args: [jobId],
    });
  };

  const claim = () => {
    setClaiming(true);
    write({
      abi: jobBoardAbi,
      address: jobBoardAddress,
      functionName: "claim",
      args: [jobId, userAddress],
    });
  };

  const accept = () => {
    setAccepting(true);
    write({
      abi: jobBoardAbi,
      address: jobBoardAddress,
      functionName: "accept",
      args: [jobId],
    });
  };

  const fund = () => {
    setFunding(true);
    write({
      abi: funderAbi,
      address: treasury as Address,
      functionName: "fund",
      args: [jobBoardAddress, jobId, wei],
    });
  };

  const isManager = job.manager == userAddress;
  const isWorker = worker == userAddress;
  const hasOffer = pendingWorker != NULL_ADDRESS;
  const isOpen = job.status == 1;
  const isActive = job.status == 2;
  const isEnded = job.status == 3;
  // const isCancelled = job.status == 3;
  let statusText = '';
  if (isOpen) {
    statusText = 'Open';
  } else if (isActive) {
    statusText = 'Filled';
  } else if (isEnded) {
    statusText = worker == NULL_ADDRESS ? 'Cancelled' : 'Filled';
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div
        className="ui-island"
        style={{ padding: '1em' }}
      >
        <h2>{job.title}</h2>
        <div className="flex">
          <div className="flex-shrink">
            <div className={`job-status-indicator job-status-${job.status}`} style={{ fontSize: '.75em', marginRight: '.5em' }}>
              {statusText}
            </div>
          </div>
          <div className="flex-grow">
            <div style={{ fontWeight: 'bold' }}>
              <i className="fa-sharp fa-regular fa-coins"></i> {prettyPrint(formatUnits(job.quantity, decimals), 3)} ${symbol} over {getDuration(job.duration)}.
            </div>
          </div>
        </div>
        {
          isManager && isOpen ? (
            <div>
              {
                isEditingDescription ? (
                  <div>
                    <textarea
                      className='text-input'
                      placeholder="job description"
                      style={{ resize: "vertical", minHeight: '5em', margin: '1em 0', display: 'block' }}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                    <div>
                      <button
                        type="button"
                        className="buy-button"
                        onClick={edit}
                        disabled={editing}
                      >
                        {editing ? 'updating' : 'update'}
                        {
                          editing ? (
                            <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                          ) : null
                        }
                      </button>
                      &nbsp;
                      <button
                        type="button"
                        className="buy-button"
                        onClick={() => setIsEditingDescription(false)}
                        disabled={editing}
                      >
                        cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                    {job.description}
                    <span
                      onClick={() => {
                        setDescription(job.description);
                        setIsEditingDescription(true);
                      }}
                      className="secondary-text"
                      style={{ cursor: 'pointer', marginLeft: '.5em' }}
                    >
                      edit
                    </span>
                  </p>
                )
              }
            </div>
          ) : (
            <p style={{ fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
              {job.description}
            </p>
          )
        }
        <div style={{ fontWeight: 'bold' }}>
          <p>
            Managed by <Link to={`/profile/${job.manager}`}><Username address={job.manager} /></Link>
          </p>
        </div>
        {
          worker != NULL_ADDRESS ? (
            <div style={{ fontWeight: 'bold' }}>
              <p>
                Performed by <Link to={`/profile/${worker}`}><Username address={worker} /></Link>
              </p>
            </div>
          ) : null
        }
      </div>
      {
        userAddress == owner && isOpen ? (
          <div>
            <br />
            <div
              className="ui-island"
              style={{ padding: '1em' }}
            >
              <h3>Fund this job <i className="far fa-lock" /></h3>
              <p>Funding will come from the ${symbol} treasury. If the job is cancelled, the amount will be refunded back.</p>
              <div>
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
                <button
                  type="button"
                  className="primary-button"
                  onClick={fund}
                  disabled={funding}
                  style={{ margin: '0' }}
                >
                  {funding ? 'Funding' : 'Fund'}
                  {
                    funding ? (
                      <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                    ) : null
                  }
                </button>
                <br />
                <br />
              </div>
            </div>
          </div>
        ) : null
      }
      {
        isActive || isEnded ? (
          <div>
            <br />
            <div
              className="ui-island"
              style={{ padding: '1em' }}
            >
              <h3>Progress</h3>
              <RewardsProgressBar
                rewardTotal={job.quantity * 9n / 10n}
                decimals={decimals}
                rewardSymbol={symbol}
                startTime={startTime}
                endTime={startTime + job.duration}
              />
              {
                isWorker ? (
                  <div>
                    <p>
                      You have {prettyPrint(formatUnits(moneyOwed, decimals), 3)} ${symbol} to claim.
                    </p>
                    <p>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={claim}
                        disabled={claiming}
                        style={{ margin: '0' }}
                      >
                        {claiming ? 'Claiming' : 'Claim'}
                        {
                          claiming ? (
                            <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                          ) : null
                        }
                      </button>
                    </p>
                  </div>
                ) : null
              }
            </div>
          </div>
        ) : null
      }
      {
        !isEnded && (isWorker || isManager) ? (
          <div>
            <br />
            <div
              className="ui-island"
              style={{ padding: '1em' }}
            >
              <h3>Danger Zone <i className="far fa-lock" /></h3>
              {
                isWorker ? (
                  <div>
                    <p>
                      You may quit this job at any time. Any unvested tokens will be refunded to the original job poster. Your can still claim your vested tokens above.
                    </p>
                    <p>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={end}
                        disabled={ending}
                        style={{ margin: '0' }}
                      >
                        {ending ? 'Quitting' : 'Quit'}
                        {
                          ending ? (
                            <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                          ) : null
                        }
                      </button>
                    </p>
                  </div>
                ) : null
              }
              {
                isManager && isActive ? (
                  <div>
                    <p>
                      As the manager, you may end this job at any time and receive a refund. Your refund will be prorated based on time elapsed and excludes the 10% commission paid to curators.
                    </p>
                    <p>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={end}
                        disabled={ending}
                        style={{ margin: '0' }}
                      >
                        {ending ? 'Ending' : 'End'}
                        {
                          ending ? (
                            <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                          ) : null
                        }
                      </button>
                    </p>
                  </div>
                ) : null
              }
              {
                isManager && !isActive ? (
                  <div>
                    <p>
                      As the manager, you may cancel this job and receive a full refund.
                    </p>
                    <p>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={cancel}
                        disabled={cancelling}
                        style={{ margin: '0' }}
                      >
                        {cancelling ? 'Cancelling' : 'Cancel'}
                        {
                          cancelling ? (
                            <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                          ) : null
                        }
                      </button>
                    </p>
                  </div>
                ) : null
              }
            </div>
          </div>
        ) : null
      }
      {
        isOpen && hasOffer ? (
          <div>
            <br />
            <div
              className="ui-island"
              style={{ padding: '1em' }}
            >
              <h3>Offer extended</h3>
              {
                isOpen && hasOffer ? (
                  <div>
                    <p>
                      An offer has been extended to <Username address={pendingWorker} />.
                      {
                        isManager ? (
                          <span
                            onClick={rescinding ? undefined : rescind}
                            className="secondary-text"
                            style={{ cursor: rescinding ? 'not-allowed' : 'pointer', marginLeft: '.5em' }}
                          >
                            {rescinding ? 'rescinding' : 'rescind'}
                            {rescinding ? (
                              <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                            ) : null}
                          </span>
                        ) : null
                      }
                    </p>
                    {
                      pendingWorker == userAddress ? (
                        <div>
                          <p>
                            Click accept to start the job. Your compensation will stream over the duration and be claimable from this page.
                          </p>
                          <p>
                            <button
                              type="button"
                              className="primary-button"
                              onClick={accept}
                              disabled={accepting}
                              style={{ margin: '0' }}
                            >
                              {accepting ? 'Accepting' : 'Accept'}
                              {
                                accepting ? (
                                  <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                                ) : null
                              }
                            </button>
                          </p>
                        </div>
                      ) : null
                    }
                  </div>
                ) : null
              }
            </div>
          </div>
        ) : null
      }
      <br />
      <div
        className="ui-island"
        style={{ padding: '1em' }}
      >
        <h3>Applicants</h3>
        {
          isOpen ? (
            <div>
              <p>
                This job is currently accepting applicants.
              </p>
            </div>
          ) : null
        }
        {
          isOpen ? (
            <p>
              <button
                type="button"
                className={isManager ? "secondary-button" : "primary-button"}
                onClick={apply}
                disabled={applying || applied}
                style={{ margin: '0' }}
              >
                {applying ? 'Applying' : (applied ? 'Applied' : 'Apply')}
                {
                  applying ? (
                    <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                  ) : null
                }
              </button>
            </p>
          ) : null
        }
        {applications.map(a => (
          <div key={`applicant-${a.applicant}`} className="flex" style={{ alignItems: 'start', marginBottom: '.5em' }}>
            {
              isManager && isOpen && !hasOffer ? (
                <div className="flex-shrink" style={{ marginRight: '.5em', marginTop: '.25em' }}>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      setCandidate(a.applicant);
                      offer(a.applicant);
                    }}
                    disabled={offering}
                    style={{ margin: '0', fontSize: '.8em' }}
                  >
                    {offering && candidate == a.applicant ? 'Offering' : 'Offer'}
                    {
                      offering && candidate == a.applicant  ? (
                        <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                      ) : null
                    }
                  </button>
                </div>
              ) : null
            }
            <div className="flex-grow">
              <Link to={`/profile/${a.applicant}`} style={{ textDecoration: 'none' }}>
                <UserShelf address={a.applicant}>
                  <div style={{ fontSize: '.75em' }}>
                    {getTimeAgo(a.time)} · {prettyPrint(formatUnits(userStake[a.applicant] || 0n, 18), 0)} $JOBS
                  </div>
                </UserShelf>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobListing;
