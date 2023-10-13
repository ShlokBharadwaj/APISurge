import React, { useState, useEffect } from 'react';

const UserDataTable = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const maxRetries = 4;

    const fetchData = async (retryCount) => {
        try {
            const response = await fetch('http://localhost:3001/api/users');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const jsonData = await response.json();
            setData(jsonData);
            setLoading(false);
        } catch (err) {
            if (retryCount > 0) {
                setTimeout(() => fetchData(retryCount - 1), 2000);
            } else {
                setError('Failed to fetch data. Please try again later.');
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData(maxRetries);
    }, []);

    return (
        <div className="m-4 overflow-x-auto">
            {loading ? (
                <div className="text-center text-2xl font-bold">Loading...</div>
            ) : error ? (
                <div className="text-center text-2xl font-bold text-red-500">Error: {error}</div>
            ) : (
                <table className="table-auto w-full">
                    <thead>
                        <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Username</th>
                            <th className="px-4 py-2">Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((user) => (
                            <tr key={user.id} className="text-center">
                                <td className="border px-4 py-2">{user.id}</td>
                                <td className="border px-4 py-2">{user.name}</td>
                                <td className="border px-4 py-2">{user.username}</td>
                                <td className="border px-4 py-2">{user.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserDataTable;