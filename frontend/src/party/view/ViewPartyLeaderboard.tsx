import {PartyResponse} from '../../api/api-models';

import {sortSubmissions} from './util';
import {useSession} from '../../user/session';
import LinkButton from '../../components/LinkButton';
import SubmissionGallery from "./SubmissionGallery";

function ViewPartyLeaderboard({ party }: { party: PartyResponse }) {
  const [session] = useSession();
  const isHost = party?.userId === session?.userId;
  const sortedSubmissions = sortSubmissions(party.submissions);

  return (
    <section id="vp-leaderboard" className="body-font">
      <div id="vp-leaderboard-headline" className="flex justify-between mb-5">
        <h1 className="font-bold text-4xl dark:text-slate-300 ">{party.name}</h1>
        {isHost && <LinkButton to={`/party/edit/${party.id}`} text="Edit" />}
      </div>

      <div id="vp-submissions" className="space-y-4">
          <SubmissionGallery submissions={sortedSubmissions} />
      </div>
    </section>
  );
}

export default ViewPartyLeaderboard;
