import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { formatUnits, Address } from 'viem';
import { readApiAddress, readApiAbi } from 'constants/abi-read-api';
import { evm2Listing, evmEmptyListingArray, getTokenImage } from 'utils/data';
import { prettyPrint, getDuration } from 'utils/formatting';
import { Listing, RawListingArray, TokenMetadataMap } from '../types';

function BrowseJobs({ jobIds, showOnlyActive }: { jobIds: number[]; showOnlyActive?: boolean }) {
  const { data: jobsRes } = useReadContract({
    abi: readApiAbi,
    address: readApiAddress,
    functionName: "getListings",
    args: [jobIds],
  });
  const jobsResCast = jobsRes as RawListingArray;
  const jobs: Listing[] = (jobsResCast || evmEmptyListingArray())[0].map((_, i) => evm2Listing([
    jobsResCast[0][i],
    jobsResCast[1][i],
    jobsResCast[2][i],
    jobsResCast[3][i],
    jobsResCast[4][i],
    jobsResCast[5][i],
    jobsResCast[6][i],
    jobsResCast[7][i],
  ]));

  const tokenMap: TokenMetadataMap = {};
  jobs.map(j => tokenMap[j.token as string] = {
    name: '',
    symbol: '',
    decimals: 18,
    supply: 1n,
    image: null,
  });

  const tokens = Object.keys(tokenMap);

  // Token Metadata
  const { data: tokenMetadataRes } = useReadContract({
    abi: readApiAbi,
    address: readApiAddress as Address,
    functionName: "getTokenMetadata",
    args: [tokens],
  });
  const tokenMetadata = (tokenMetadataRes || [[], [], [], [], []]) as [string[], string[], bigint[], bigint[], string[]];
  tokens.forEach((t, i) => {
    tokenMap[t] = {
      name: tokenMetadata[0][i],
      symbol: tokenMetadata[1][i],
      decimals: Number(tokenMetadata[2][i]),
      supply: tokenMetadata[3][i],
      image: tokenMetadata[4][i],
    };
  });

  const names = [] as string[];
  const symbols = [] as string[];
  const decimals = [] as number[];
  const supplies = [] as bigint[];
  const images = [] as (string|null)[];

  jobs.forEach(j => {
    const t = tokenMap[j.token];
    names.push(t.name);
    symbols.push(t.symbol);
    decimals.push(t.decimals);
    supplies.push(t.supply);
    images.push(t.image);
  })

  if (jobs.length == 0) {
    return null;
  }

  return (
    <div>
      <div className="mobile">
        {
          jobIds.map((jobId, i) => {
            const job = jobs[i];
            if (job.status != 1 && showOnlyActive) {
              return null;
            }
            const image = images[i] || getTokenImage(job.token);
            return (
              <div key={`job-m-${jobId}`} style={{ borderTop: '1px solid #ccc', margin: '1em 0' }}>
                <br />
                <Link
                  to={`/project/${job.token}`}
                  className="flex"
                  style={{ height: '100%', alignItems: 'center', textDecoration: 'none' }}
                >
                  {
                    image ? (
                      <img style={{ height: '3em', width: '3em', objectFit: 'cover', borderRadius: '500px', marginRight: '.5em' }} src={image} />
                    ) : null
                  }
                  <b>{names[i]}</b>
                </Link>
                <p>
                  <b>
                    <Link
                      style={{ textDecoration: 'none' }}
                      to={`/${jobId}`}
                    >
                      {job.title}
                    </Link>
                  </b>
                  <div>
                    {prettyPrint(formatUnits(job.quantity, decimals[i]), 3)}&nbsp;${symbols[i]}&nbsp;({prettyPrint((Number(job.quantity * 100000n / (supplies[i] || job.quantity)) / 1000).toString(), 3)}%)
                  </div>
                  <div>{getDuration(job.duration)}</div>
                </p>
                {
                  job.status == 1 ? (
                    <div>
                      <Link
                        to={`/${jobId}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <button type="button" className="primary-button" style={{ marginLeft: '0' }}>
                          Apply&nbsp;<i className="far fa-arrow-up-right" />
                        </button>
                      </Link>
                    </div>
                  ) :  (
                    <div className="flex-shrink">
                      <Link
                        to={`/${jobId}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <button type="button" className="primary-button job-status-3" style={{ marginLeft: '0' }}>
                          Closed
                        </button>
                      </Link>
                    </div>
                  )
                }
              </div>
            );
          })
        }
      </div>
      <table className="job-table desktop">
        <thead>
          <tr>
            <th className="secondary-text">Token</th>
            <th className="secondary-text">Job</th>
            <th className="secondary-text">Description</th>
          </tr>
        </thead>
        {
          jobIds.length == jobs.length ? (
            <tbody>
              {
                jobIds.map((jobId, i) => {
                  const job = jobs[i];
                  if (job.status != 1 && showOnlyActive) {
                    return null;
                  }
                  const image = images[i] || getTokenImage(job.token);
                  return (
                    <tr key={`job-${jobId}`}>
                      <td>
                        <Link
                          to={`/project/${job.token}`}
                          className="flex"
                          style={{ height: '100%', alignItems: 'center', textDecoration: 'none' }}
                        >
                          {
                            image ? (
                              <img style={{ height: '3em', width: '3em', objectFit: 'cover', borderRadius: '500px', marginRight: '.5em' }} src={image} />
                            ) : null
                          }
                          <b>{names[i]}</b>
                        </Link>
                      </td>
                      <td style={{ maxWidth: '250px' }}>
                        <b>
                          <Link
                            style={{ textDecoration: 'none' }}
                            to={`/${jobId}`}
                          >
                            {job.title}
                          </Link>
                        </b>
                        <div>
                          {prettyPrint(formatUnits(job.quantity, decimals[i]), 3)}&nbsp;${symbols[i]}&nbsp;({prettyPrint((Number(job.quantity * 100000n / (supplies[i] || job.quantity)) / 1000).toString(), 3)}%)
                        </div>
                        <div>{getDuration(job.duration)}</div>
                      </td>
                      <td style={{ width: '100%' }}>
                        <div style={{ maxHeight: '6em', width: '100%', overflow: 'hidden' }}>
                          {job.description}
                        </div>
                      </td>
                      <td>

                        {
                          job.status == 1 ? (
                            <div className="flex-shrink">
                              <Link
                                to={`/${jobId}`}
                                style={{ textDecoration: 'none' }}
                              >
                                <button type="button" className="primary-button" style={{ marginLeft: '.5em' }}>
                                  Apply&nbsp;<i className="far fa-arrow-up-right" />
                                </button>
                              </Link>
                            </div>
                          ) : (
                            <div className="flex-shrink">
                              <Link
                                to={`/${jobId}`}
                                style={{ textDecoration: 'none' }}
                              >
                                <button type="button" className="primary-button job-status-3" style={{ marginLeft: '.5em' }}>
                                  Closed
                                </button>
                              </Link>
                            </div>
                          )
                        }
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          ) : null
        }
      </table>
    </div>
  );
}

export default BrowseJobs;
