/*
    This file is used to wrap all the pages with a common layout.
    For example, if you want to add a header and footer to all the pages,
    you can add it here.
*/

import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return <div>{children}</div>;
};

export default Layout;
