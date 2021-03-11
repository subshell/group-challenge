import { PartyResponse } from '../../api-models';

function ViewPartyDoneItem({ party }: { party: PartyResponse }) {
  return (
    <section className="text-gray-600 body-font">
      Challenge Done!
      {party.submissions.map((submission) => (
        <img key={submission.id} src={submission.imageURL} />
      ))}
    </section>
  );
}

export default ViewPartyDoneItem;
