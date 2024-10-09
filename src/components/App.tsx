import { ConnectKitButton } from 'connectkit';
import { Route, Routes, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import CreateJob from './CreateJob';
import JobListing from './JobListing';
import BrowseJobs from './BrowseJobs';
import About from './About';
import Profile from './Profile';
import People from './People';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const account = useAccount();
  const userAddress = account.address;

  const isAccount = location.pathname.indexOf(`/profile/${userAddress}`) == 0;
  const isCandidates = location.pathname == '/people';
  const isJobs = location.pathname == '/';
  return (
    <div style={{ position: "relative" }}>
      <div className="user-wrapper flex">
        <div className="flex-shrink" style={{ fontSize: '1.4em', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/tokens/jobs-inline.png"  style={{ height: '1.5em' }} />
        </div>
        <div className="flex-shrink" style={{ fontSize: '1.5em', cursor: 'pointer', marginLeft: '.5em' }} onClick={() => navigate('/')}>
          based.jobs
        </div>
        <div className="flex-grow">&nbsp;</div>
        <div className="flex-shrink">
          <ConnectKitButton />
        </div>
      </div>
      <br />
      <div style={{ padding: '1em' }}>
        <div className="flex" style={{ maxWidth: '500px', margin: '0 auto', alignItems: 'center' }}>
          <div className="flex-grow">&nbsp;</div>
          <button
            className="nav-button"
            onClick={() => navigate('/')}
            disabled={isJobs}
          >
            <i className="fas fa-briefcase" />&nbsp;Jobs
          </button>
          <button
            className="nav-button"
            onClick={() => navigate('/people')}
            disabled={isCandidates}
          >
            <i className="fas fa-ranking-star" />&nbsp;People
          </button>
          {
            account ? (
              <button
                className="nav-button"
                onClick={() => navigate(`/profile/${userAddress}`)}
                disabled={isAccount}
              >
                <i className="fas fa-user-hoodie" />&nbsp;Me
              </button>
            ) : null
          }
          <Link to="/about">
            <i style={{ marginLeft: '.5em' }} className="fas fa-circle-question" />
          </Link>
          <div className="flex-grow">&nbsp;</div>
        </div>
        <br />
        <Routes>
          <Route path="/project/:address" element={<About />} />
          <Route path="/profile/:address" element={<Profile />} />
          <Route path="/new" element={<CreateJob />} />
          <Route path="/people" element={<People />} />
          <Route path="/about" element={<About />} />
          {/*<Route path="/me" element={<Profile />} />*/}
          <Route path="/:jobId" element={<JobListing />} />
          <Route path="/" element={<BrowseJobs />} />
        </Routes>
      </div>
      <br />
      <br />
      <br />
    </div>
  );
}

export default App;
