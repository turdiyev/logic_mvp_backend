import React from 'react';
import { DATE_TIME_FORMAT, PAGE_LIMIT } from '@config';
import moment from 'moment';
import { PageableResponse } from '../../services/tests.service';

type Props = {
  pageableTests: PageableResponse<any>;
  curPath: string;
};
const ResultsContainer = ({ curPath, pageableTests = { items: [], total: 0, page: 1 } }: Props) => {
  return (
    <>
      <div className="relative overflow-x-auto rounded-xl shadow-2xl">
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
            {pageableTests.items.map((tst, index) => (
              <tr key={tst.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4">
                  #{tst.order || index + 1} --- {tst.id}
                </td>
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  {tst.user?.first_name || tst.user.username || ''} {tst.user?.last_name || ''}
                </th>
                <td className="px-6 py-4 text-gray-900 dark:text-white whitespace-nowrap">
                  <strong className="text-green-400">44</strong> / <span>30</span>
                </td>
                <td className="px-6 py-4">{moment(tst.created_at).format(DATE_TIME_FORMAT)}</td>
                <td className="px-6 py-4">{tst.status === 'PENDING' ? 'Oxirigacha ishlanmagan' : "To'liq tugatilgan"}</td>

                <td className="px-6 py-4 text-right">58%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination info={pageableTests} curPath={curPath} />
    </>
  );
};

export default ResultsContainer;

function Pagination({ info, curPath }: { info: PageableResponse<any>; curPath: string }) {
  const startIndex = (info.page - 1) * PAGE_LIMIT;
  const lastIndex = info.total > startIndex + PAGE_LIMIT ? startIndex + PAGE_LIMIT : info.total;
  return (
    <div className="flex flex-col items-center my-5">
      <span className="text-sm text-gray-700 dark:text-gray-400">
        <span className="font-semibold text-gray-900 dark:text-white">{startIndex}</span> {'  -  '}
        <span className="font-semibold text-gray-900 dark:text-white">{lastIndex}</span> &nbsp; &nbsp; jami:{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{info.total}</span> ta
      </span>
      <div className="inline-flex mt-2 xs:mt-0 space-x-4">
        {info.page > 1 && (
          <a
            href={`${curPath}?page=${info.page - 1}`}
            className="inline-flex items-center py-2 px-4 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <svg className="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
            Avvalgi
          </a>
        )}
        {/* {info.page < Math.ceil(info.total / PAGE_LIMIT) && ( */}
          <a
            href={`${curPath}?page=${info.page + 1}`}
            className="inline-flex items-center py-2 px-4 text-sm font-medium text-white bg-gray-800 rounded border-0 border-gray-700 hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Keyingi
            <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </a>
        {/* )} */}
      </div>
    </div>
  );
}
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
