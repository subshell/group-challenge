import { CHANGES, type Change, type ChangeItem } from './version';

// Extract the union of type values from ChangeItem
type ChangeType = ChangeItem['type'];

interface TypeStyle {
  bg: string;
  text: string;
  label: string;
}

// Map each ChangeType to a badge style — must cover ALL union members.
// Each style includes light + dark variants.
const typeStyles: Record<ChangeType, TypeStyle> = {
  feature: {
    bg: 'bg-emerald-100 dark:bg-emerald-500/10',
    text: 'text-emerald-800 dark:text-emerald-300',
    label: 'Feature',
  },
  fix: {
    bg: 'bg-amber-100 dark:bg-amber-500/10',
    text: 'text-amber-800 dark:text-amber-300',
    label: 'Fix',
  },
  note: {
    bg: 'bg-sky-100 dark:bg-sky-500/10',
    text: 'text-sky-800 dark:text-sky-300',
    label: 'Note',
  },
  beta: {
    bg: 'bg-violet-100 dark:bg-violet-500/10',
    text: 'text-violet-800 dark:text-violet-300',
    label: 'Beta',
  },
};

export function Changelog() {
  if (CHANGES.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-4 px-4">
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No changelog entries yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-2">Changelog</p>
      </div>

      {/* Timeline */}
      <div className="relative border-l-2 border-gray-200 dark:border-gray-700 pl-6 ml-4 space-y-12">
        {CHANGES.map((release: Change) => (
          <div key={release.name} className="relative">
            {/* Timeline dot — ring matches page background in both themes */}
            <div className="absolute -left-7.75 top-1.5 w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 ring-4 ring-white dark:ring-gray-900" />

            {/* Version header */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{release.name}</h2>
            </div>

            {/* Changes card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700 overflow-hidden">
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {release.changes.map((changeItem: ChangeItem, i: number) => {
                  const style = typeStyles[changeItem.type];
                  return (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                    >
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} whitespace-nowrap`}
                      >
                        {style.label}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {changeItem.description}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Changelog;
