import { useEffect } from 'react';
import { useParties } from '../api/api';

// TODO: optimize with dedicated api endpoints
export function Statistics() {
  const { data: parties, isLoading, fetchNextPage, hasNextPage } = useParties();

  useEffect(() => {
    if (hasNextPage && parties?.pages?.length && parties?.pages?.length < 100) {
      fetchNextPage();
    }
  }, [parties?.pages.length, hasNextPage]);

  return (
    <div className="space-y-4">
      <div>
        Total submissions: {parties?.pages?.flatMap((page) => page.data).flatMap((party) => party.submissions).length}
      </div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Party
              </th>
              <th scope="col" className="px-6 py-3">
                Participants
              </th>
              <th scope="col" className="px-6 py-3">
                Submissions
              </th>
            </tr>
          </thead>
          <tbody>
            {parties?.pages.map((page) =>
              page.data.map((party) => (
                <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700" key={party.id}>
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {party.name}
                  </th>
                  <td className="px-6 py-4">
                    {new Set(party.submissions.map((submission) => submission.userId)).size}
                  </td>
                  <td className="px-6 py-4">{party.submissions.length}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div>More statistics and performance optimizations coming soon</div>
    </div>
  );
}

export default Statistics;
