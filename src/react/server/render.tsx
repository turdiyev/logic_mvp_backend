import React from "react";
import App from '../client/App';
import ReactDOMServer from 'react-dom/server';

export function renderComp(data: any = {}) {
  const app = ReactDOMServer.renderToString(<App {...data}/>);

  const html = `
        <html lang="en" class="dark">
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link href="/output.css" rel="stylesheet">
           <!-- <script>
              window.INITIAL_DATA = ${JSON.stringify(data)}
            </script>-->
            
        </head>
        <body class="dark:bg-gray-900">
            <div id="root">${app}</div>
        </body>
        </html>`;

  return html;
}
