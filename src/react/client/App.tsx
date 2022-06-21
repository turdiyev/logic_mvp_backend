import React, { useEffect, useState } from 'react';
import ResultsContainer from './ResultsContainer';

type Props = {
  curPath: string;
  routeName: 'test-list' | 'test-details';
  data: any;
};
const App = (props: Props) => {
  return (
    <main className="sm:container my-6 mx-auto px-4 !max-w-4xl">
      <header className="flex flex-col items-center mb-5">
        <a href={props.curPath || '/'} className="mb-1">
          <img src="/logo-mita.png" alt="mita.uz" className="w-16 h-16 inline-block rounded-md" />
        </a>
        <h1 className="text-uppercase font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Matematika Test Natijalari</h1>
      </header>
      {props.data?.items?.length && <ResultsContainer pageableTests={props.data} curPath={props.curPath} />}

      <footer className="text-center p-4">
        <p className="text-gray-500 dark:text-gray-400 ">&copy;MITA 2022</p>
      </footer>
    </main>
  );
};

export default App;
