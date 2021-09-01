import { CHANGES } from './version';

export function Changelog() {
  return (
    <div>
      <h1 className="text-2xl">Changelog</h1>
      {CHANGES.map((change) => (
        <div key={change.name} className="my-5">
          <h2 className="text-xl">{change.name}</h2>
          <ul className="list-disc">
            {change.changes.map((changeItem, i) => (
              <li key={i}>
                <b>{changeItem.type}</b>: {changeItem.description}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default Changelog;
