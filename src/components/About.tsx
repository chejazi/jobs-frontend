import { Link } from 'react-router-dom';

function About() {
  return (
    <div style={{ position: "relative", padding: "0 .5em" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h1>About</h1>
        <p>Earn tokens by working for projects built on Base. This site is an interface to the <Link to="https://github.com/chejazi/jobs-contracts" target="_blank">Jobs protocol</Link>.</p>
        <h2>Jobs</h2>
        <p>
          Looking to fill a role for your token-backed project? Need some specific tasks done? Based.Jobs makes it easy to create a listing with an onchain, pre-funded bounty to attract the best candidates. <br /><br />All you need to do to get started is sign in with your crypto or smart wallet and click <Link to="/new">Post a Job</Link> here or on the top right corner of the the <Link to="/">Jobs</Link> page. <br /><br />Creating a job listing takes three simple steps: <br /><br />
        <ol>
          <li>First, create a title &amp; description for your Job that communicates what position you are looking to fill. </li>
          <li>Second, choose the native token you would like to stream out to a successful candidate from the menu of available options OR paste smart contract address of the token instead. </li>
          <li>Finally, enter the total number of tokens and number of days that the tokens will stream once the onchain transaction to accept your preferred applicant is successful.</li>
        </ol>
        </p>
        <h2>Staking</h2>
        <p>
          <b>Anyone</b> can help highlight rockstar applicants and help Job posters identify the best applicants by staking $JOBS tokens on candidates.<br /><br />Recommendations are great; now, skin-in-the-game staking makes recommendations something anyone can profit from too.<br /><br />Anytime a job is accepted, 10% of the job compensation goes to their stakers. If multiple parties stake $JOBS on a single successful applicant, the staking reward will be split pro-rata based across all staking parties.<br /><br />Staking is powered by <Link to="https://github.com/chejazi/rebase-contracts" target="_blank">Rebase</Link> - an audited staking protocol that has safely secured more than $2.5 million in staked assets.
        </p>
      </div>
    </div>
  );
}

export default About;
