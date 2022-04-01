interface ChangeItem {
  description: string;
  type: 'feature' | 'fix' | 'note';
}

interface Change {
  name: string;
  changes: ChangeItem[];
}

export const CHANGES: Change[] = [
  {
    name: '0.6.0',
    changes: [{ description: 'new image processing proxy', type: 'feature' }],
  },
  {
    name: '0.5.1',
    changes: [{ description: 'Sign in with email', type: 'fix' }],
  },
  {
    name: '0.5.0',
    changes: [
      { description: 'Dependency updates', type: 'note' },
      { description: 'Fix party reactions limit', type: 'fix' },
      { description: 'Add custom emoji picker', type: 'feature' },
    ],
  },
  {
    name: '0.4.0',
    changes: [
      { description: 'Party reactions!', type: 'feature' },
      { description: 'Show the party name on party start page.', type: 'feature' },
      { description: 'Elect new moderator: users should be sorted by name.', type: 'fix' },
      { description: 'Party archive: sort parties by date.', type: 'fix' },
    ],
  },
  {
    name: '0.3.0',
    changes: [{ description: 'The party moderator is now able to elect a new moderator.', type: 'feature' }],
  },
  {
    name: '0.2.2',
    changes: [
      { description: 'Session was not up to date after sign in.', type: 'fix' },
      {
        description: 'Intensive logging if multiple parties are present.',
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

export const VERSION = CHANGES[0].name;
