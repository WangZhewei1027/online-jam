"use client";

import React, {Suspense, useState, useEffect} from 'react';

// A component to be rendered after data is fetched
const MyComponent = () => {
    return <div>Data has loaded successfully!</div>;
};

function App() {
    const [dataLoaded, setDataLoaded] = useState(false);

    // Simulate loading a function or data
    useEffect(() => {
        const fetchData = async () => {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading
            setDataLoaded(true);
        };
        fetchData();
    }, []);

    return (
        <div>
            {dataLoaded ? <MyComponent/> : <div>Loading function...</div>}
        </div>
    );
}

export default App;