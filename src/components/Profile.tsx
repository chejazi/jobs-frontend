import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// import { useCapabilities, useWriteContracts, useCallsStatus } from "wagmi/experimental";
import { ConnectKitButton } from 'connectkit';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, formatUnits, parseUnits } from 'viem';

import { prettyPrint, prettyPrintAddress } from 'utils/formatting';
import { jobBoardAddress, jobBoardAbi } from 'constants/abi-job-board-v2';
import { registryAddress, registryAbi } from 'constants/abi-registry';
import { rebaseAddress, rebaseAbi } from 'constants/abi-rebase-v1';
import { readApiAddress, readApiAbi } from 'constants/abi-read-api';
import { splitterAbi } from 'constants/abi-splitter';
import { erc20Abi } from 'constants/abi-erc20';
import { StringBigIntMap } from '../types';
import JobTable from './JobTable';
import Username from './Username';
import UserBio from './UserBio';
import UserScore from './UserScore';
import UserShelf from './UserShelf';
//style={{ fontSize: '.75em', fontWeight: 'bold', textTransform: 'uppercase' }}

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

function Profile() {
  const account = useAccount();
  const userAddress = account.address;
  const navigate = useNavigate();

  const [view, setView] = useState("managed");
  const [quantity, setQuantity] = useState('');
  const [staking, setStaking] = useState(false);
  const [editing, setEditing] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [approving, setApproving] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [cacheBust, setCacheBust] = useState(1);
  const [draftBio, setDraftBio] = useState("");
  const [claimingSplitter, setClaimingSplitter] = useState("");
  const [claimingSnapshotId, setClaimingSnapshotId] = useState(0n);
  const [claiming, setClaiming] = useState(false);
  const [viewBioInput, setViewBioInput] = useState(false);
  const [mode, setMode] = useState(0);
  const { address } = useParams();

  const jobsToken = '0xd21111c0e32df451eb61a23478b438e3d71064cb';

  const { writeContract, error: writeContractError, data: writeContractData } = useWriteContract();
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

  // const { data: callsStatus } = useCallsStatus({
  //   id: writeContractsData as string,
  //   query: {
  //     refetchInterval: (data) =>
  //       data.state.data?.status === "CONFIRMED" ? false : 1000,
  //   },
  // });

  const { isSuccess } = useWaitForTransactionReceipt({
    hash: writeContractData as Address,
  });
  const isConfirmed = isSuccess; // || (callsStatus && callsStatus.status === "CONFIRMED");

  // const write = (args: any) => {
  //   if (capabilities.paymasterService) {
  //     writeContracts({ contracts: [args], capabilities });
  //   } else {
  //     writeContract(args);
  //   }
  // };
  const write = (args: any) => writeContract(args);


  useEffect(() => {
    setMode(0);
    setQuantity('');
  }, [address]);

  useEffect(() => {
    if (writeContractError) {
      setClaimingSplitter("");
      setClaimingSnapshotId(0n);
      setClaiming(false);
      setViewBioInput(false);
      setEditing(false);
      setApproving(false);
      setApproving(false);
      setStaking(false);
      setUnstaking(false);
      setRegistering(false);
      setTimeout(() => window.alert(writeContractError), 1);
    } else if (isConfirmed) {
      if (staking || unstaking) {
        setQuantity('');
      }
      setClaimingSplitter("");
      setClaimingSnapshotId(0n);
      setClaiming(false);
      setViewBioInput(false);
      setEditing(false);
      setApproving(false);
      setStaking(false);
      setUnstaking(false);
      setRegistering(false);
      setCacheBust(cacheBust + 1);
    }
  }, [writeContractError, isConfirmed]);

  useEffect(() => {
    if (userAddress && address == 'undefined') {
      navigate(`/profile/${userAddress}`);
    }
  }, [userAddress, address]);

  const { data: managedJobIdsRes } = useReadContract({
    abi: jobBoardAbi,
    address: jobBoardAddress,
    functionName: 'getManaged',
    args: [address],
  });
  const managedJobIds = (managedJobIdsRes || []) as number[];

  const { data: workedJobIdsRes } = useReadContract({
    abi: jobBoardAbi,
    address: jobBoardAddress,
    functionName: 'getWorked',
    args: [address],
  });
  const workedJobIds = (workedJobIdsRes || []) as number[];

  const { data: splitterRes } = useReadContract({
    abi: registryAbi,
    address: registryAddress,
    functionName: 'getSplitter',
    args: [address],
  });
  const splitterAddress = (splitterRes || '') as string;

  const { data: bioRes } = useReadContract({
    abi: registryAbi,
    address: registryAddress,
    functionName: 'getBio',
    args: [address],
    scopeKey: `profile-${cacheBust}`,
  });
  const bio = (bioRes || '') as string;

  // Scouts
  const { data: scoutersRes } = useReadContract({
    abi: readApiAbi,
    address: readApiAddress as Address,
    functionName: "getScouters",
    args: [address],
    scopeKey: `profile-${cacheBust}`,
  });
  const scoutersResTyped = (scoutersRes || [[],[]]) as [string[], bigint[]];
  const scoutersMap = {} as StringBigIntMap;
  scoutersResTyped[0].forEach((u, i) => {
    scoutersMap[u] = scoutersResTyped[1][i];
  });

  // Scouting
  const { data: scoutingRes } = useReadContract({
    abi: readApiAbi,
    address: readApiAddress as Address,
    functionName: "getScouting",
    args: [address],
    scopeKey: `profile-${cacheBust}`,
  });
  const scoutingResTyped = (scoutingRes || [[],[]]) as [string[], bigint[]];
  const scoutingMap = {} as StringBigIntMap;
  scoutingResTyped[0].forEach((u, i) => {
    scoutingMap[u] = scoutingResTyped[1][i];
  });

  // Scouting earnings
  const { data: scoutEarningsRes } = useReadContract({
    abi: readApiAbi,
    address: readApiAddress as Address,
    functionName: "getScoutEarnings",
    args: [address, scoutingResTyped[0]],
    scopeKey: `profile-${cacheBust}`,
  });
  const scoutEarningsResTyped = (scoutEarningsRes || [[],[],[],[],[],[]]) as [string[], string[], bigint[], string[], bigint[], boolean[]];
  const [users, splitters, snapshotIds, tokens, earnings, claimed] = scoutEarningsResTyped;

  // Token Metadata
  const { data: tokenMetadataRes } = useReadContract({
    abi: readApiAbi,
    address: readApiAddress as Address,
    functionName: "getTokenMetadata",
    args: [tokens],
  });
  const tokenMetadata = (tokenMetadataRes || [[], [], [], [], []]) as [string[], string[], bigint[], bigint[], string[]];
  // const names = tokenMetadata[0];
  const symbols = tokenMetadata[1];
  const decimals = tokenMetadata[2].map(n => Number(n));
  // const supplies = tokenMetadata[3];
  // const images = tokenMetadata[4];

  // Tokens staked by all users
  const { data: appStakeRes } = useReadContract({
    abi: rebaseAbi,
    address: rebaseAddress as Address,
    functionName: "getAppStake",
    args: [splitterAddress, jobsToken],
    scopeKey: `profile-${cacheBust}`,
  });
  const totalStakedWei = (appStakeRes || 0n) as bigint;

  // Tokens staked by user
  const { data: userAppStakeRes } = useReadContract({
    abi: rebaseAbi,
    address: rebaseAddress as Address,
    functionName: "getUserAppStake",
    args: [userAddress, splitterAddress, jobsToken],
    scopeKey: `profile-${cacheBust}`,
  });
  const userStakedWei = (userAppStakeRes || 0n) as bigint;

  // User's Token Balance / Allowance
  const { data: balanceOfRes } = useReadContract({
    abi: erc20Abi,
    address: jobsToken,
    functionName: "balanceOf",
    args: [userAddress],
    scopeKey: `profile-${cacheBust}`
  });
  const userWalletWei = (balanceOfRes || 0n) as bigint;

  const { data: allowanceRes } = useReadContract({
    abi: erc20Abi,
    address: jobsToken,
    functionName: "allowance",
    args: [userAddress, rebaseAddress],
    scopeKey: `profile-${cacheBust}`
  });
  const allowance = (allowanceRes || 0n) as bigint;

  const wei = parseUnits((quantity || '0').toString(), 18);
  const input = parseFloat(quantity || '0');
  const hasAllowance = allowance >= wei;

  const approve = () => {
    setApproving(true);
    write({
      abi: erc20Abi,
      address: jobsToken,
      functionName: "approve",
      args: [rebaseAddress, wei],
    });
  };

  const stake = () => {
    setStaking(true);
    write({
      abi: rebaseAbi,
      address: rebaseAddress,
      functionName: "stake",
      args: [jobsToken, wei, splitterAddress],
    });
  };

  const unstake = () => {
    setUnstaking(true);
    write({
      abi: rebaseAbi,
      address: rebaseAddress,
      functionName: "unstake",
      args: [jobsToken, wei, splitterAddress],
    });
  };

  const edit = () => {
    setEditing(true);
    write({
      abi: registryAbi,
      address: registryAddress,
      functionName: "update",
      args: [draftBio],
    });
  };

  const register = () => {
    setRegistering(true);
    write({
      abi: registryAbi,
      address: registryAddress,
      functionName: "register",
      args: [""],
    });
  };

  const claim = (i: number) => {
    setClaiming(true);
    setClaimingSplitter(splitters[i]);
    setClaimingSnapshotId(snapshotIds[i]);
    write({
      abi: splitterAbi,
      address: splitters[i] as Address,
      functionName: "claim",
      args: [userAddress, [jobsToken], [[snapshotIds[i]]]],
    });
  };

  const totalStakedUnits = formatUnits(totalStakedWei, 18);
  const userStakedUnits = formatUnits(userStakedWei, 18);
  const userWalletUnits = formatUnits(userWalletWei, 18);

  const pending = staking || unstaking;

  const isAll = mode == 0 ? quantity == userWalletUnits : quantity == userStakedUnits;

  const isOwnProfile = address == userAddress;

  if (!address || address == "undefined") {
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
        <h2>Connect a wallet to get started</h2>
        <ConnectKitButton />
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      <div
        className="ui-island"
        style={{
          padding: '1em',
          position: 'relative',
        }}
      >
        <h2 style={{ marginBottom: '0', overflow: 'hidden', textOverflow: 'ellipsis' }}><UserShelf address={address} /></h2>
        <div>
          {
            viewBioInput ? (
              <div>
                <textarea
                  className='text-input'
                  placeholder="bio, farcaster/lens/x @handle, etc"
                  style={{ resize: "vertical", minHeight: '5em' }}
                  value={draftBio}
                  onChange={e => setDraftBio(e.target.value)}
                />
                <button
                  type="button"
                  className="primary-button flex-grow"
                  onClick={edit}
                  disabled={editing}
                >
                  {editing ? 'saving' : 'save'}
                  {
                    editing ? (
                      <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                    ) : null
                  }
                </button>
                &nbsp;
                <button
                  type="button"
                  className="primary-button flex-grow"
                  onClick={() => setViewBioInput(false)}
                  disabled={editing}
                >
                  cancel
                </button>
              </div>
            ) : (
              <p>
              {
                splitterAddress == NULL_ADDRESS ? (
                  <div>
                    <p>
                      <i className="far fa-triangle-exclamation" /> This address is not yet registered. The owner must register before others can stake on them.
                    </p>
                    {
                      userAddress == address ? (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={register}
                          disabled={registering}
                        >
                          {registering ? 'registering' : 'register'}
                          {
                            registering ? (
                              <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                            ) : null
                          }
                        </button>
                      ) : null
                    }
                  </div>
                ) : (
                  <div>
                    <UserBio bio={bio} address={address} />
                    {
                      isOwnProfile ? (
                        <span
                          onClick={() => {
                            setDraftBio(bio);
                            setViewBioInput(true);
                          }}
                          className="secondary-text"
                          style={{ cursor: 'pointer', marginLeft: '.5em' }}
                        >
                          edit
                        </span>
                      ) : null
                    }
                  </div>
                )
              }
              </p>
            )
          }
        </div>
        <div>
          <div
            className='profile-tag secondary-bg'
            onClick={() => window.open(`https://basescan.org/address/${address}`, '_blank')}
          >
            {prettyPrintAddress(address)}
          </div>
          <div className='profile-tag secondary-bg' onClick={() => setView("mystake")}>
            Stakers: {prettyPrint(totalStakedUnits, 0)} $JOBS
          </div>
          <UserScore address={address} />
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <br />
        <button
          className="nav-button"
          onClick={() => setView("managed")}
          disabled={view == "managed"}
          style={{ marginBottom: '1em' }}
        >
          Managed ({managedJobIds.length})
        </button>
        <button
          className="nav-button"
          onClick={() => setView("worked")}
          disabled={view == "worked"}
          style={{ marginBottom: '1em' }}
        >
          Performed ({workedJobIds.length})
        </button>
        <button
          className="nav-button"
          onClick={() => setView("mystake")}
          disabled={view == "mystake"}
          style={{ marginBottom: '1em' }}
        >
          Stakers ({Object.keys(scoutersMap).length})
        </button>
        <button
          className="nav-button"
          onClick={() => setView("commissions")}
          disabled={view == "commissions"}
          style={{ marginBottom: '1em' }}
        >
          Staking ({Object.keys(scoutingMap).length})
        </button>
      </div>
      {
        view == "managed" ? (
          <div className="ui-island" style={{ padding: '1em' }}>
            <JobTable jobIds={managedJobIds || []} />
          </div>
        ) : null
      }
      {
        view == "worked" ? (
          <div className="ui-island" style={{ padding: '1em' }}>
            <JobTable jobIds={workedJobIds || []} />
          </div>
        ) : null
      }
      {
        view == "commissions" ? (
          <div className="flex-desktop">
            {
              isOwnProfile ? (
                <div className="ui-island full-width-mobile" style={{ padding: '1em', width: '300px', marginRight: '1em', marginBottom: '1em' }}>
                  <div><h3>My commissions <i className="far fa-lock" /></h3>If you stop staking on someone, your commissions from them will no longer appear below.</div>
                  {
                    users.map((u, i) => (
                      <div key={`commission-${u}-${snapshotIds[i]}`} style={{ marginTop: '1em' }} className="flex">
                        <div className="flex-grow">
                          {prettyPrint(formatUnits(earnings[i] || 0n, decimals[i]), 0)} ${symbols[i]}
                          <div style={{ fontSize: '.75em' }}>from <Username address={u} /></div>
                        </div>
                        <div className="flex-shrink">
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() => claim(i)}
                            disabled={claiming || claimed[i]}
                          >
                            {claiming ? 'claiming' : (claimed[i] ? 'claimed' : 'claim')}
                            {
                              claimingSplitter == splitters[i] && claimingSnapshotId == snapshotIds[i] ? (
                                <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                              ) : null
                            }
                          </button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : null
            }
            <div className="ui-island flex-grow" style={{ padding: '1em' }}>
              <h3>Stakes by <Username address={address} /></h3>
              <ol>
                {
                  Object.keys(scoutingMap).sort((a, b) => scoutingMap[a] < scoutingMap[b] ? 1 : -1).map((u) => (
                    <li className={`scout-${u}`}>
                      <Link to={`/profile/${u}`}><Username address={u} /></Link>
                      <div style={{ fontSize: '.75em' }}>
                        with {prettyPrint(formatUnits(scoutingMap[u] || 0n, 18), 0)} $JOBS
                      </div>
                    </li>
                  ))
                }
              </ol>
              {
                Object.keys(scoutingMap).length == 0 ? (
                  <i>Nobody currently</i>
                ) : null
              }
            </div>
          </div>
        ) : null
      }
      {
        view == "mystake" ? (
          <div className="flex-desktop">
            <div className="ui-island full-width-mobile" style={{ padding: '1em', width: '300px', marginRight: '1em', marginBottom: '1em' }}>
              <h3>Stake on <Username address={address} /></h3>
              {
                splitterAddress == NULL_ADDRESS ? (
                  <div>
                    <p>
                      <i className="far fa-triangle-exclamation" /> This address is not yet registered. The owner must register before others can stake on them.
                    </p>
                    {
                      userAddress == address ? (
                        <button
                          type="button"
                          className="primary-button"
                          onClick={register}
                          disabled={registering}
                        >
                          {registering ? 'registering' : 'register'}
                          {
                            registering ? (
                              <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                            ) : null
                          }
                        </button>
                      ) : null
                    }
                  </div>
                ) : (
                  <div>
                    <div>Stakers split a 10% commission on any job accepted by <Username address={address} /></div>
                    <div className="flex" style={{ maxWidth: '20em', margin: '1em 0', display: 'none' }}>
                      <div
                        className="flex-grow"
                        style={{
                          textAlign: 'center',
                          fontWeight: 'bold',
                          padding: '.25em 0',
                          cursor: 'pointer',
                          borderRadius: '12px',
                          border: mode == 0 ? '1px solid #999' : '1px solid transparent'
                        }}
                        onClick={() => {
                          setMode(0);
                          setQuantity("")
                        }}
                      >
                        Stake
                      </div>
                      <div
                        className="flex-grow"
                        style={{
                          textAlign: 'center',
                          fontWeight: 'bold',
                          padding: '.25em 0',
                          cursor: 'pointer',
                          borderRadius: '12px',
                          border: mode == 1 ? '1px solid #999' : '1px solid transparent'
                        }}
                        onClick={() => {
                          setMode(1);
                          setQuantity("")
                        }}
                      >
                        Unstake
                      </div>
                    </div>
                    <div style={{ fontSize: '.75em' }}>
                      <div>{prettyPrint(userStakedUnits, 4)} $JOBS staked by you ({(100 * parseFloat(String(userStakedWei)) / parseFloat(String(totalStakedWei || 1))).toFixed(0)}%)</div>
                      <div>{prettyPrint(userWalletUnits, 4)} $JOBS available to stake</div>
                    </div>
                    <br />
                    <div className="flex" style={{ maxWidth: '20em', marginBottom: '1em' }}>
                      <div className="flex-shrink">&nbsp;</div>
                      <input
                        className="buy-input"
                        type="text"
                        name="quantity"
                        autoComplete="off"
                        placeholder="quantity"
                        style={{ width: "100%" }}
                        value={quantity}
                        onChange={(e) => {
                          setQuantity(e.target.value.replace(/[^0-9.]/g, ''));
                        }}
                      />
                      <div
                        className="flex-shrink"
                        style={{ marginLeft: '1em', minWidth: '4em' }}
                        onClick={() => isAll ? setQuantity("") : setQuantity(mode == 0 ? userWalletUnits : userStakedUnits)}
                      >
                        <input
                          id="all"
                          type="checkbox"
                          checked={isAll}
                        />
                        <label htmlFor="all">&nbsp;all</label>
                      </div>
                    </div>
                    {
                      mode == 0 ? (
                        <div>
                          <div>
                            {
                              hasAllowance ? (
                                <button
                                  type="button"
                                  className="primary-button"
                                  onClick={stake}
                                  disabled={pending || !(input > 0 && parseFloat(userWalletUnits) >= input)}
                                >
                                  {staking ? 'staking' : 'stake'}
                                  {
                                    staking ? (
                                      <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                                    ) : null
                                  }
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="primary-button"
                                  onClick={approve}
                                  disabled={pending || !(input > 0 && parseFloat(userWalletUnits) >= input)}
                                >
                                  {approving ? 'approving' : 'approve and stake'}
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
                      ) : (
                        <div>
                          <button
                            type="button"
                            className="primary-button"
                            onClick={unstake}
                            disabled={pending || !(input > 0 && parseFloat(userStakedUnits) >= input)}
                          >
                            {unstaking ? 'unstaking' : 'unstake'}
                            {
                              unstaking ? (
                                <i className="fa-duotone fa-spinner-third fa-spin" style={{ marginLeft: "1em" }}></i>
                              ) : null
                            }
                          </button>
                        </div>
                      )
                    }
                  </div>
                )
              }
            </div>
            <div className="ui-island flex-grow" style={{ padding: '1em' }}>
              <h3>Top Stakers</h3>
              <ol>
                {
                  Object.keys(scoutersMap).sort((a, b) => scoutersMap[a] < scoutersMap[b] ? 1 : -1).map((u) => (
                    <li className={`scout-${u}`}>
                      <Link to={`/profile/${u}`}><Username address={u} /></Link>
                      <div style={{ fontSize: '.75em' }}>
                        with {prettyPrint(formatUnits(scoutersMap[u] || 0n, 18), 0)} $JOBS
                      </div>
                    </li>
                  ))
                }
              </ol>
              {
                Object.keys(scoutersMap).length == 0 ? (
                  <i>Nobody currently</i>
                ) : null
              }
            </div>
          </div>
        ) : null
      }
    </div>
  );
}

export default Profile;
