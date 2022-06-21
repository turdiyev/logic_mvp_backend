import React from 'react';
import { DATE_TIME_FORMAT } from '@config';
import moment from 'moment';

type Props = {
  tests: any[];
};
const ResultsContainer = ({ tests = [] }: Props) => {
  return (
    <>
     <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                O'rin
              </th>
              <th scope="col" className="px-6 py-3">
                Ishladi
              </th>
              <th scope="col" className="px-6 py-3">
                Natija
              </th>
              <th scope="col" className="px-6 py-3">
                Tugadi
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Foizda
              </th>
            </tr>
          </thead>
          <tbody>
            {tests.map((tst, index) => (
              <tr key={tst.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4">#{tst.order || index + 1}</td>
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  {tst.user?.first_name || tst.user.username || ''} {tst.user?.last_name || ''}
                </th>
                <td className="px-6 py-4 text-gray-900 dark:text-white whitespace-nowrap">
                  <strong className="text-green-400">44</strong> / <span>30</span>
                </td>
                <td className="px-6 py-4">{moment(tst.updated_at).format(DATE_TIME_FORMAT)}</td>
                <td className="px-6 py-4">{tst.status === 'PENDING' ? 'Oxirigacha ishlanmagan' : "To'liq tugatilgan"}</td>
                
                <td className="px-6 py-4 text-right">58%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ResultsContainer;

function Filter() {
  return (
    <div className="p-4">
      <label htmlFor="table-search" className="sr-only">
        Search
      </label>
      <div className="relative mt-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
              fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </div>
        <input
          type="text"
          id="table-search"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Search for items"
        />
      </div>
    </div>
  );
}
