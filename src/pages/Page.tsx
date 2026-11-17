// The frame for text pages: the title, then the text, held to about two-thirds of the column.
import React from 'react';

export const Page: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <article className="max-w-page mx-auto px-4 md:px-8 pt-8 md:pt-12">
    <h1 id="page-title" tabIndex={-1} className="text-3xl md:text-[2.75rem] md:leading-[3rem] outline-none">
      {title}
    </h1>
    <div className="prose-page mt-6">{children}</div>
  </article>
);
