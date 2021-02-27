import { PartyResponse } from '../../api';

function ViewPartyDoneItem({ party }: { party: PartyResponse }) {
  return (
    <section className="text-gray-600 body-font">
      Challenge Done!
      {party.items.map((item) => (
        <img key={item.id} src={item.imageURL} />
      ))}
    </section>
  );
}

export default ViewPartyDoneItem;
