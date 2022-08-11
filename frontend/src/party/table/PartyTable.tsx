import { FunctionComponent } from 'react';
import { PartyResponse } from '../../api/api-models';
import PartyListRow from './ParyListRow';

export const PartyTable: FunctionComponent<{ parties: PartyResponse[] }> = ({ parties }) => {
  return (
    <table className="min-w-full table-auto divide-y divide-slate-300 text-slate-700 text-left text-sm font-semibold">
      <thead>
        <tr>
          <th scope="col">
            <span className="pl-2">Name</span>
          </th>
          <th scope="col">Start Date</th>
          <th scope="col">End Date</th>
          <th scope="col">Submissions</th>
          <th scope="col">
            Accepts
            <br />
            Submissions
          </th>
          <th scope="col">Live</th>
          <th scope="col">Moderator</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {parties.map((party) => (
          <PartyListRow key={party.id} party={party} />
        ))}
      </tbody>
    </table>
  );
};
