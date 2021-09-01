interface ChangeItem {
  description: string;
  type: 'feature' | 'fix' | 'note';
}

interface Change {
  name: string;
  changes: ChangeItem[];
}

const CHANGES: Change[] = [
  {
    name: '0.2.2',
    changes: [
      { description: 'Session was not up to date after sign in.', type: 'fix' },
      {
        description: 'Intensive logging when multiple parites are present.',
        type: 'fix',
      },
    ],
  },
  {
    name: '0.2.1',
    changes: [{ description: 'Changelog flickers on browser focus.', type: 'fix' }],
  },
  {
    name: '0.2.0',
    changes: [
      { description: 'Archive is on its own page.', type: 'feature' },
      {
        description: 'Submissions are rated based on their avg. score (not their total score).',
        type: 'feature',
      },
      {
        description: 'New changelog 🗒 page.',
        type: 'feature',
      },
    ],
  },
  {
    name: '0.1.0',
    changes: [
      { description: 'Initial non-alpha release.', type: 'note' },
      { description: 'Foto Challenge.', type: 'feature' },
    ],
  },
];

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
