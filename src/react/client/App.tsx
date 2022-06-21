import React, { useEffect, useState } from 'react';
import ResultsContainer from './ResultsContainer';

const App = props => {
  const [clientMessage, setClientMessage] = useState('');

  useEffect(() => {
    setClientMessage('&copy;MITA 2022');
  }, []);
  return (
    <main className="md:container my-6 mx-auto px-4">
      <header className='flex flex-col items-center mb-3'>
      <a href="/" className='mb-1'>
        <img src="/logo-mita.png" alt="mita.uz" className="rounded w-16 h-16 inline-block rounded-md" />
      </a>
      <h1 className="text-uppercase font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Matematika Test Natijalari</h1>
      </header>
      {props.tests?.length && <ResultsContainer tests={props.tests} />}
      <footer>{clientMessage}</footer>
    </main>
  );
};

export default App;
