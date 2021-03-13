import { PartySubmissionResponse } from '../../api-models';

function PartySubmission({ partySubmission }: { partySubmission: PartySubmissionResponse }) {
  return (
    <div className="p-4">
      <div className="bg-gray-100 w-96 p-6 rounded-lg">
        <img className="rounded w-full mb-6" src={partySubmission.imageURL} alt={partySubmission.name} />
        <h3 className="tracking-widest text-indigo-500 text-xs font-medium title-font">
          User id: {partySubmission.userId}
        </h3>
        <h2 className="text-lg text-gray-900 font-medium title-font mb-4">{partySubmission.name}</h2>
        <p className="leading-relaxed text-base">{partySubmission.description}</p>
      </div>
    </div>
  );
}

function PartySubmissions({ partySubmissions }: { partySubmissions: PartySubmissionResponse[] }) {
  return (
    <div className="flex flex-wrap -m-4">
      {partySubmissions.map((partySubmission) => (
        <PartySubmission key={partySubmission.id} partySubmission={partySubmission} />
      ))}
    </div>
  );
}

export default PartySubmissions;
